/**
 * local-sync/merge-pull.js
 * ---------------------------------------------------------------------------
 * الجزء المقابل لـ writer.js لكن بالاتجاه المعاكس: "اسحب أي تغييرات في
 * الملف المحلي لم تصل بعد إلى هذا المتصفح، وادمجها في keepit:state."
 *
 * لماذا هذا الملف تحديدًا يحتاج DOM (وبالتالي offscreen أو صفحة حقيقية)؟
 * لقراءة الملف عبر File System Access API فقط (نفس سبب writer.js). أما
 * الدمج نفسه فمنطق JS عادي، لكنه يعتمد على globalThis.KeepitDedup (من
 * shared/dedup.js) — لذلك أي مستند يستدعي هذه الدالة يجب أن يكون قد حمّل
 * shared/dedup.js أولًا كسكربت كلاسيكي (راجع offscreen.html وoptions/index.html
 * وpopup/index.html، وكلاهما يحمّله فعلًا).
 *
 * سياسة الدمج (mode):
 *   - "merge" (افتراضي): يُضيف فقط ما هو جديد في الملف؛ لا يحذف شيئًا محليًا
 *     أبدًا. آمن دائمًا، لكنه لا ينقل عمليات الحذف من متصفح آخر.
 *   - "replace": يجعل محتوى الملف هو الحقيقة الكاملة ويستبدل به مجموعات هذا
 *     المتصفح، بما يشمل نقل الحذف. يُستخدَم فقط إن اختاره المستخدم صراحةً.
 *
 * لا حلقة تغذية راجعة لا نهائية: بعد كتابة keepit:state هنا، سيُشغّل ذلك
 * مستمع الكتابة التلقائية (background/local-sync-sw/controller.js) فيعيد
 * كتابة الملف — لكن المحتوى الجديد سيطابق (من ناحية بنيوية) ما سحبناه للتو،
 * فلن يكتشف فحص السحب التالي أي اختلاف، ويتوقف الدوران.
 */
import { readStateFromLocalFolder } from "./reader.js";
import { toInternalCollections } from "./import-schema.js";
import { buildExportPayload } from "./export-schema.js";
import { exportCollectionsEqual } from "./compare.js";
import { KEEPIT_STATE_KEY, PULL_MODE, SYNC_ERRORS } from "./constants.js";

/**
 * @param {{ fileName?: string, mode?: string }} params
 * @returns {Promise<
 *   | { ok: true, changed: false }
 *   | { ok: true, changed: true, addedCollections: number, addedItems: number }
 *   | { ok: false, error: string }
 * >}
 */
export async function pullFromLocalFolder({ fileName, mode }) {
  const readResult = await readStateFromLocalFolder({ fileName });
  if (!readResult.ok) return readResult;
  if (readResult.collections === null) return { ok: true, changed: false }; // لا ملف بعد، لا شيء لسحبه

  if (typeof globalThis.KeepitDedup?.mergeCollections !== "function") {
    // احترازي بحت: يعني أن shared/dedup.js لم يُحمَّل في هذا المستند، وهو
    // خطأ في الإعداد وليس حالة متوقعة أثناء التشغيل الطبيعي.
    console.error("[Keepit local sync] KeepitDedup unavailable in this document");
    return { ok: false, error: SYNC_ERRORS.INTERNAL_ERROR };
  }

  const localState = await getLocalState();
  const localExportCollections = buildExportPayload(localState).collections;

  // فحص سريع ورخيص: إن كان محتوى الملف مطابقًا تمامًا لما لدينا محليًا (سواء
  // لأننا نحن من كتبه، أو لأن متصفحًا آخر توافق مسبقًا)، لا داعي لأي عمل
  // إضافي (لا توليد معرّفات جديدة، لا كتابة إلى chrome.storage).
  if (exportCollectionsEqual(readResult.collections, localExportCollections)) {
    return { ok: true, changed: false };
  }

  const useReplace = mode === PULL_MODE.REPLACE;
  const { collections: importedInternal } = toInternalCollections(readResult.collections);

  const mergeResult = globalThis.KeepitDedup.mergeCollections(
    useReplace ? [] : (localState.collections ?? []),
    importedInternal,
  );

  // فحص أمان أخير: قد يُنتج الدمج نفس المحتوى الحالي فعليًا (مثلًا كان كل ما
  // في الملف موجودًا محليًا أصلًا تحت ترتيب/تنسيق مختلف قليلًا). لا نكتب في
  // هذه الحالة لتفادي دورة كتابة/سحب لا طائل منها.
  const mergedExportShape = buildExportPayload({ collections: mergeResult.merged }).collections;
  if (exportCollectionsEqual(mergedExportShape, localExportCollections)) {
    return { ok: true, changed: false };
  }

  const newState = {
    schemaVersion: localState.schemaVersion ?? 1,
    collections: mergeResult.merged,
    lastUsedCollectionId: useReplace
      ? (mergeResult.merged[0]?.id ?? null)
      : (localState.lastUsedCollectionId ?? mergeResult.merged[0]?.id ?? null),
  };

  await setLocalState(newState);

  const addedCollections = countNewCollections(localExportCollections, mergedExportShape);
  const addedItems = countNewItems(localState.collections ?? [], mergeResult.merged);

  return { ok: true, changed: true, addedCollections, addedItems };
}

async function getLocalState() {
  const data = await chrome.storage.local.get(KEEPIT_STATE_KEY);
  return data[KEEPIT_STATE_KEY] ?? { schemaVersion: 1, collections: [], lastUsedCollectionId: null };
}

/** @param {any} state */
async function setLocalState(state) {
  await chrome.storage.local.set({ [KEEPIT_STATE_KEY]: state });
}

/**
 * عدّ تقريبي (لغرض رسالة نجاح فقط، ليس منطقًا حرجًا) لعدد التصنيفات
 * الجديدة التي ظهرت بعد الدمج ولم تكن موجودة قبله.
 */
function countNewCollections(before, after) {
  const beforeNames = new Set(before.map((c) => normalizeForCount(c.name)));
  return after.filter((c) => !beforeNames.has(normalizeForCount(c.name))).length;
}

/** نفس الفكرة لكن على مستوى إجمالي عدد المواقع داخل كل التصنيفات. */
function countNewItems(beforeInternalCollections, afterInternalCollections) {
  const before = beforeInternalCollections.reduce((n, c) => n + (c.items?.length ?? 0), 0);
  const after = afterInternalCollections.reduce((n, c) => n + (c.items?.length ?? 0), 0);
  return Math.max(0, after - before);
}

function normalizeForCount(name) {
  return String(name ?? "").trim().toLowerCase();
}

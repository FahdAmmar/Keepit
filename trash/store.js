/**
 * trash/store.js
 * ---------------------------------------------------------------------------
 * القراءة والاستعادة والحذف النهائي لسلة المحذوفات (keepit:trash). لا تلمس
 * أي كود من background/index.js أو popup|options/main.js — فقط تقرأ/تكتب
 * chrome.storage.local مباشرة، ثم مستمع onChanged المدمج أصلاً في main.js
 * يتولى إعادة رسم الواجهة تلقائيًا (نفس الآلية المستخدمة في المزامنة
 * المحلية بالضبط).
 *
 * الاستعادة تعتمد على globalThis.KeepitDedup (من shared/dedup.js، المُحمَّل
 * دومًا قبل هذه الوحدة في كل من popup وoptions — راجع index.html في كليهما)
 * لتُطبَّق نفس قواعد منع تكرار الأسماء/الروابط المستخدمة أصلاً في الاستيراد
 * اليدوي، فلا يمكن لاستعادة من السلة أن تُنتج تصنيفًا مكررًا بالاسم أو
 * موقعًا مكررًا بالرابط.
 */
import { KEEPIT_STATE_KEY, TRASH_KEY } from "./constants.js";
import { writeStateOptimistically } from "../shared/optimistic-state-write.js";

/** @type {{entries: KeepitTrashEntry[]}} */
const EMPTY_TRASH = { entries: [] };
/** @type {KeepitState} */
const EMPTY_STATE = { schemaVersion: 1, collections: [], lastUsedCollectionId: null };

/** @returns {Promise<KeepitTrashEntry[]>} الأحدث حذفًا أولًا */
export async function readTrashEntries() {
  const data = /** @type {{[k: string]: {entries?: KeepitTrashEntry[]} | undefined}} */ (
    await chrome.storage.local.get(TRASH_KEY)
  );
  const entries = data[TRASH_KEY]?.entries;
  return Array.isArray(entries) ? entries.slice().sort((a, b) => b.deletedAt - a.deletedAt) : [];
}

export async function deleteEntryPermanently(entryId) {
  await writeStateOptimistically(
    TRASH_KEY,
    (current) => ({ entries: (current.entries ?? []).filter((e) => e.id !== entryId) }),
    EMPTY_TRASH,
  );
}

export async function emptyTrash() {
  await writeStateOptimistically(TRASH_KEY, () => EMPTY_TRASH, EMPTY_TRASH);
}

function dedup() {
  const api = /** @type {any} */ (globalThis).KeepitDedup;
  if (!api) {
    throw new Error("KeepitDedup غير متاح — تأكد من تحميل shared/dedup.js قبل هذه الوحدة");
  }
  return api;
}

/**
 * يستعيد تصنيفًا كاملًا محذوفًا. يُدمَج مع أي تصنيف حالي بنفس الاسم
 * المطوَّع (بنفس منطق KeepitDedup.mergeCollections المستخدم أصلاً في
 * الاستيراد اليدوي)، فلا يمكن أن ينتج عن الاستعادة اسمان متطابقان.
 * @param {string} entryId
 * @returns {Promise<{ok: boolean, mergedIntoExisting: boolean}>}
 */
export async function restoreCollectionEntry(entryId) {
  const entries = await readTrashEntries();
  const entry = entries.find(
    /** @returns {e is Extract<KeepitTrashEntry, {kind: "collection"}>} */ (e) =>
      e.id === entryId && e.kind === "collection",
  );
  if (!entry) return { ok: false, mergedIntoExisting: false };

  // يُعاد حسابه من جديد داخل mutate عند كل محاولة (لا يُلتقَط من خارجها)
  // لأنه يعتمد على الحالة الحالية الفعلية وقت الكتابة، لا وقت أول قراءة —
  // بالضبط ما تحمي منه writeStateOptimistically عبر إعادة استدعاء mutate
  // كاملة عند اكتشاف تغيّر متزامن.
  let mergedIntoExisting = false;
  await writeStateOptimistically(
    KEEPIT_STATE_KEY,
    (state) => {
      const existingCollections = Array.isArray(state.collections) ? state.collections : [];
      mergedIntoExisting = Boolean(dedup().findDuplicateCollection(existingCollections, entry.collection.name));
      const { merged } = dedup().mergeCollections(existingCollections, [entry.collection]);
      return { ...state, collections: merged };
    },
    EMPTY_STATE,
  );
  await deleteEntryPermanently(entryId);

  return { ok: true, mergedIntoExisting };
}

/**
 * يستعيد موقعًا واحدًا محذوفًا إلى تصنيفه الأصلي إن كان لا يزال موجودًا
 * (بنفس المعرّف)، أو يُعيد إنشاء تصنيف جديد بنفس الاسم/اللون الذي كان
 * عليه وقت الحذف إن كان التصنيف نفسه قد حُذف لاحقًا هو الآخر (ويُدمج مع
 * تصنيف موجود بنفس الاسم إن أُنشئ يدويًا لاحقًا باسم مطابق). يتجاهل
 * الاستعادة الفعلية (مع alreadyExists: true) إن وُجد رابط أو عنوان مطابق
 * بالفعل في وجهة الاستعادة، لتفادي تكرار غير مقصود.
 * @param {string} entryId
 * @returns {Promise<{ok: boolean, alreadyExists: boolean, recreatedCollection: boolean}>}
 */
export async function restoreItemEntry(entryId) {
  const entries = await readTrashEntries();
  const entry = entries.find(
    /** @returns {e is Extract<KeepitTrashEntry, {kind: "item"}>} */ (e) => e.id === entryId && e.kind === "item",
  );
  if (!entry) return { ok: false, alreadyExists: false, recreatedCollection: false };

  let alreadyExists = false;
  let recreatedCollection = false;
  await writeStateOptimistically(
    KEEPIT_STATE_KEY,
    (state) => {
      alreadyExists = false;
      recreatedCollection = false;
      const collections = Array.isArray(state.collections) ? state.collections : [];
      const target = collections.find((c) => c.id === entry.sourceCollection.id);

      if (target) {
        const dup = dedup().findDuplicateItem(target.items, entry.item.url, entry.item.title);
        if (dup.url || dup.title) {
          alreadyExists = true;
          return state; // بلا أي تغيير — writeStateOptimistically لن تكتب فعليًا
        }
        const updatedCollections = collections.map((c) =>
          c.id === target.id ? { ...c, items: [...c.items, entry.item], updatedAt: Date.now() } : c,
        );
        return { ...state, collections: updatedCollections };
      }

      recreatedCollection = true;
      const recreated = {
        id: crypto.randomUUID(),
        name: entry.sourceCollection.name,
        color: entry.sourceCollection.color,
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [entry.item],
      };
      const { merged } = dedup().mergeCollections(collections, [recreated]);
      return { ...state, collections: merged };
    },
    EMPTY_STATE,
  );
  await deleteEntryPermanently(entryId);
  return { ok: true, alreadyExists, recreatedCollection };
}

/**
 * يوجّه الاستعادة تلقائيًا لدالة النوع المناسب.
 * @param {KeepitTrashEntry} entry
 * @returns {Promise<
 *   | {ok: boolean, mergedIntoExisting: boolean}
 *   | {ok: boolean, alreadyExists: boolean, recreatedCollection: boolean}
 * >}
 */
export function restoreEntry(entry) {
  return entry.kind === "collection" ? restoreCollectionEntry(entry.id) : restoreItemEntry(entry.id);
}

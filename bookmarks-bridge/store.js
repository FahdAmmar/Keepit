/**
 * bookmarks-bridge/store.js
 * ---------------------------------------------------------------------------
 * القراءة والدمج الفعلي في keepit:state — نقطة الالتقاء الوحيدة بين مصدري
 * الاستيراد (chrome-bookmarks.js وnetscape-format.js) وبين تخزين Keepit.
 *
 * إعادة استخدام مقصودة بدل تكرار منطق:
 *   - toInternalCollections من local-sync/import-schema.js: نفس التحقق
 *     الصارم المطبَّق على أي ملف يرفعه المستخدم (بروتوكول الرابط http/https
 *     فقط، تجاهل صامت للعناصر غير الصالحة) — مصدرا هذه الميزة (شجرة
 *     chrome.bookmarks، وملف HTML خارجي) كلاهما "مصدر غير موثوق" بنفس
 *     درجة ملف JSON يرفعه المستخدم يدويًا، فيستحقان نفس الصرامة بالضبط.
 *   - KeepitDedup.mergeCollections من shared/dedup.js: نفس أداة الدمج
 *     الآمن المستخدمة في استعادة النسخ الاحتياطية والاستيراد اليدوي —
 *     يضمن عدم تكرار اسم تصنيف أو رابط موجود أصلاً.
 *
 * لا يُحذف أو يُستبدَل أي شيء هنا مطلقًا — هذه الوحدة عملية "دمج" فقط
 * بتصميم، بعكس ميزة المزامنة المحلية التي تدعم أيضًا وضع "استبدال" (لا
 * معنى لوضع استبدال هنا: استيراد بضعة إشارات مرجعية من المتصفح لا يجب أن
 * يحذف أي تصنيف Keepit موجود مسبقًا).
 */
import { toInternalCollections } from "../local-sync/import-schema.js";
import { KEEPIT_STATE_KEY, COLOR_CYCLE } from "./constants.js";

function dedupApi() {
  const api = /** @type {any} */ (globalThis).KeepitDedup;
  if (!api) throw new Error("KeepitDedup غير متاح — تأكد من تحميل shared/dedup.js قبل هذه الوحدة");
  return api;
}

/** @returns {Promise<KeepitState>} */
async function readAppState() {
  const data = /** @type {{[k: string]: KeepitState | undefined}} */ (await chrome.storage.local.get(KEEPIT_STATE_KEY));
  return data[KEEPIT_STATE_KEY] ?? { schemaVersion: 1, collections: [], lastUsedCollectionId: null };
}

/** @returns {Promise<Array<any>>} تصنيفات Keepit الحالية، للاستخدام في قائمة اختيار التصدير */
export async function readExistingCollections() {
  const state = await readAppState();
  return Array.isArray(state.collections) ? state.collections : [];
}

/**
 * يُسند لونًا دائريًا (من COLOR_CYCLE) لأي مجموعة بلا حقل color — مصدرا
 * هذه الميزة (chrome.bookmarks وNetscape HTML) لا يحملان مفهوم "لون"
 * إطلاقًا في الحالة العامة، فبلا هذا كانت كل المجموعات المستورَدة ستنتهي
 * إلى اللون الافتراضي "indigo" الموحَّد (سلوك toInternalCollections عند
 * غياب color)، فتفقد إمكانية التمييز البصري بينها من أول وهلة.
 * @param {Array<{name:string, color?:string, items:Array<any>}>} collections
 */
function withRotatingColors(collections) {
  let i = 0;
  return collections.map((c) => (c.color ? c : { ...c, color: COLOR_CYCLE[i++ % COLOR_CYCLE.length] }));
}

/**
 * يدمج مصفوفة مجموعات موحَّدة (بصيغة {name, color?, items:[{url,title,...}]})
 * في keepit:state الحالي، ويكتب النتيجة، ويُرجع ملخصًا رقميًا لعرضه في
 * إشعار (toast) للمستخدم.
 *
 * @param {Array<any>} normalizedCollections
 * @returns {Promise<{importedCollections: number, importedItems: number, skippedItems: number}>}
 */
export async function importNormalizedCollections(normalizedCollections) {
  const withColors = withRotatingColors(normalizedCollections);
  const { collections: internalCols, skippedItems: invalidItems } = toInternalCollections(withColors);

  if (internalCols.length === 0) {
    return { importedCollections: 0, importedItems: 0, skippedItems: invalidItems };
  }

  const attemptedItems = internalCols.reduce((n, c) => n + c.items.length, 0);

  const state = await readAppState();
  const existing = Array.isArray(state.collections) ? state.collections : [];
  const { merged, skippedItems: duplicateItems } = dedupApi().mergeCollections(existing, internalCols);

  state.collections = merged;
  state.schemaVersion = state.schemaVersion ?? 1;
  if (!state.lastUsedCollectionId && merged[0]) state.lastUsedCollectionId = merged[0].id;
  await chrome.storage.local.set({ [KEEPIT_STATE_KEY]: state });

  return {
    importedCollections: internalCols.length,
    importedItems: attemptedItems - duplicateItems,
    skippedItems: invalidItems + duplicateItems,
  };
}

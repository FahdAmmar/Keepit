/**
 * shared/collection-order-store.js
 * ---------------------------------------------------------------------------
 * ترتيب المجموعات هو ترتيب عناصر مصفوفة collections نفسها. هذا يجعله ثابتًا
 * في التخزين المحلي، وفي النسخ الاحتياطية، وملف المزامنة المحلية، دون إضافة
 * حقل ترتيب جديد قد يربك الإصدارات السابقة من الإضافة.
 */
import { writeStateOptimistically } from "./optimistic-state-write.js";

export const KEEPIT_STATE_KEY = "keepit:state";

/** @type {KeepitState} */
const EMPTY_STATE = {
  schemaVersion: 1,
  collections: [],
  lastUsedCollectionId: null,
};

/**
 * يعيد المجموعات بحسب معرّفات العرض، مع إبقاء أي مجموعة أُنشئت/وصلت بالتزامن
 * بعد بدء السحب في نهاية القائمة بدل فقدانها.
 *
 * @param {any[]} collections
 * @param {string[]} orderedIds
 * @returns {any[]}
 */
export function orderCollectionsByIds(collections, orderedIds) {
  /** @type {any[]} */
  const source = Array.isArray(collections) ? collections : [];
  /** @type {Map<string, any>} */
  const byId = new Map();
  for (const collection of source) {
    if (collection && typeof collection.id === "string") byId.set(collection.id, collection);
  }
  const usedIds = new Set();
  const ordered = [];

  for (const id of Array.isArray(orderedIds) ? orderedIds : []) {
    if (typeof id !== "string" || usedIds.has(id)) continue;
    const collection = byId.get(id);
    if (!collection) continue;
    ordered.push(collection);
    usedIds.add(id);
  }

  for (const collection of source) {
    const id = collection && typeof collection.id === "string" ? collection.id : null;
    if (id && usedIds.has(id)) continue;
    ordered.push(collection);
    if (id) usedIds.add(id);
  }

  return ordered;
}

/**
 * يحفظ ترتيب المجموعة باستخدام الكتابة المتفائلة المشتركة لتفادي الكتابة فوق
 * تعديل آخر في chrome.storage.local.
 *
 * @param {string[]} orderedIds
 * @returns {Promise<boolean>} true عند تغيّر ترتيب فعلي.
 */
export async function saveCollectionOrder(orderedIds) {
  let changed = false;
  await writeStateOptimistically(
    KEEPIT_STATE_KEY,
    (state) => {
      const current = Array.isArray(state?.collections) ? state.collections : [];
      const ordered = orderCollectionsByIds(current, orderedIds);
      changed = ordered.some((collection, index) => collection !== current[index]);
      return changed ? { ...state, collections: ordered } : state;
    },
    EMPTY_STATE,
  );
  return changed;
}

/**
 * quick-add-preview/store.js
 * ---------------------------------------------------------------------------
 * قراءة عناصر تصنيف واحد من chrome.storage.local عبر معرّفه (id) فقط —
 * بلا طبقة تخزين مؤقت (cache) منفصلة: قراءة chrome.storage.local محليًا
 * سريعة جدًا (أقل من مللي ثانية عمليًا)، فلا مبرر لتعقيد إضافي هنا (KISS)،
 * تمامًا كمنطق search-enhance/store.js.
 *
 * الفرز حسب حقل order مطابق تمامًا لمنطق شاشة تفاصيل التصنيف داخل
 * popup/main.js (المضغوطة)، حفاظًا على تطابق بصري تام بين هذه المعاينة
 * وبين الشاشة الحقيقية عند فتح التصنيف كاملاً لاحقًا.
 */
import { KEEPIT_STATE_KEY } from "./constants.js";

/**
 * @param {string} collectionId
 * @returns {Promise<{name: string, color: string, items: Array<any>} | null>}
 */
export async function readCollectionById(collectionId) {
  if (!collectionId) return null;

  const data = await chrome.storage.local.get(KEEPIT_STATE_KEY);
  const collections = Array.isArray(data[KEEPIT_STATE_KEY]?.collections) ? data[KEEPIT_STATE_KEY].collections : [];
  const collection = collections.find((c) => c?.id === collectionId);
  if (!collection) return null;

  const items = Array.isArray(collection.items) ? [...collection.items] : [];
  items.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));

  return { name: collection.name, color: collection.color, items };
}

/**
 * search-enhance/store.js
 * ---------------------------------------------------------------------------
 * منطق مطابقة أسماء التصنيفات فقط — القراءة ببساطة عند كل استدعاء بدل طبقة
 * تخزين مؤقت (cache) منفصلة: قراءة chrome.storage.local محليًا سريعة جدًا
 * (أقل من مللي ثانية عمليًا)، فلا مبرر لتعقيد إضافي هنا (KISS).
 *
 * نفس منطق التطبيع المستخدم أصلاً في دالة البحث عن المواقع داخل
 * popup/main.js وoptions/main.js (المضغوطتين): `toLowerCase().includes()`
 * بلا أي معالجة إملائية أو لغوية إضافية، حفاظًا على سلوك بحث متسق ومتوقَّع
 * في كل أنحاء التطبيق.
 */
import { KEEPIT_STATE_KEY, KEEPIT_LOCALE_KEY, MAX_MATCHES } from "./constants.js";

/**
 * @param {string} query
 * @returns {Promise<Array<any>>} التصنيفات المطابقة، الأقرب أولًا (اسم يبدأ
 *   بنص البحث يُرتَّب قبل اسم يحتوي عليه فقط في مكان آخر)
 */
export async function searchMatchingCollections(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const data = await chrome.storage.local.get(KEEPIT_STATE_KEY);
  const collections = Array.isArray(data[KEEPIT_STATE_KEY]?.collections) ? data[KEEPIT_STATE_KEY].collections : [];

  return collections
    .filter((c) => typeof c?.name === "string" && c.name.toLowerCase().includes(needle))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(needle) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(needle) ? 0 : 1;
      return aStarts !== bStarts ? aStarts - bStarts : a.name.localeCompare(b.name);
    })
    .slice(0, MAX_MATCHES);
}

/** @returns {Promise<string | undefined>} */
export async function readLocalePreference() {
  const data = await chrome.storage.local.get(KEEPIT_LOCALE_KEY);
  return data[KEEPIT_LOCALE_KEY];
}

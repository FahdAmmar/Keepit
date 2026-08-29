/**
 * search-enhance/store.js
 * ---------------------------------------------------------------------------
 * منطق مطابقة البحث — يشمل اسم التصنيف **وعنوان/رابط كل موقع بداخله**.
 * القراءة ببساطة عند كل استدعاء بدل طبقة تخزين مؤقت (cache) منفصلة: قراءة
 * chrome.storage.local محليًا سريعة جدًا (أقل من مللي ثانية عمليًا)، فلا
 * مبرر لتعقيد إضافي هنا (KISS).
 *
 * نفس منطق المطابقة البسيط في كل أنحاء التطبيق: `toLowerCase().includes()`
 * بلا أي معالجة إملائية أو لغوية إضافية، حفاظًا على سلوك بحث متسق ومتوقَّع.
 *
 * كل تصنيف يظهر في النتائج لسبب واحد على الأقل:
 *   - اسمه نفسه يطابق نص البحث (matchInName)، أو
 *   - أحد مواقعه يطابق (matchedItems غير فارغة) — بعنوانه أو رابطه أو
 *     ملاحظته أو أحد وسومه.
 * الفرز: اسم يبدأ بالنص أولًا، ثم اسم يحتويه فقط، ثم تطابق عبر المواقع
 * فقط، وأبجديًا داخل كل مستوى.
 */
import { KEEPIT_STATE_KEY, KEEPIT_LOCALE_KEY, MAX_MATCHES, MAX_MATCHED_ITEMS_PER_COLLECTION } from "./constants.js";
import { normalizeTags } from "../shared/tag-utils.js";

/**
 * @param {string} query
 * @returns {Promise<Array<KeepitCollection & {nameMatches: boolean, matchedItems: KeepitItem[], matchedItemsTotal: number}>>}
 */
export async function searchMatchingCollections(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const data = /** @type {{[k: string]: KeepitState | undefined}} */ (await chrome.storage.local.get(KEEPIT_STATE_KEY));
  const collections = Array.isArray(data[KEEPIT_STATE_KEY]?.collections) ? data[KEEPIT_STATE_KEY].collections : [];

  const results = [];
  for (const c of collections) {
    if (!c || typeof c.name !== "string") continue;

    const nameMatches = c.name.toLowerCase().includes(needle);
    const items = Array.isArray(c.items) ? c.items : [];
    const allMatchedItems = items.filter((it) => itemMatches(it, needle));

    if (!nameMatches && allMatchedItems.length === 0) continue; // لا تطابق بأي شكل؛ استبعد التصنيف كليًا

    results.push({
      ...c,
      nameMatches,
      matchedItems: allMatchedItems.slice(0, MAX_MATCHED_ITEMS_PER_COLLECTION),
      matchedItemsTotal: allMatchedItems.length,
    });
  }

  return results
    .sort((a, b) => {
      const rank = (c) => (c.nameMatches ? (c.name.toLowerCase().startsWith(needle) ? 0 : 1) : 2);
      const ra = rank(a);
      const rb = rank(b);
      return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
    })
    .slice(0, MAX_MATCHES);
}

/** @param {any} item @param {string} needle (مُطبَّع مسبقًا: trim + toLowerCase) */
function itemMatches(item, needle) {
  if (!item) return false;
  const title = typeof item.title === "string" ? item.title.toLocaleLowerCase() : "";
  const url = typeof item.url === "string" ? item.url.toLocaleLowerCase() : "";
  const note = typeof item.note === "string" ? item.note.toLocaleLowerCase() : "";
  const tags = normalizeTags(item.tags).join(" ").toLocaleLowerCase();
  return title.includes(needle) || url.includes(needle) || note.includes(needle) || tags.includes(needle);
}

/** @returns {Promise<unknown>} قيمة خام غير مُتحقَّق منها؛ مرِّرها عبر resolveLocale() قبل الاستخدام */
export async function readLocalePreference() {
  const data = await chrome.storage.local.get(KEEPIT_LOCALE_KEY);
  return data[KEEPIT_LOCALE_KEY];
}

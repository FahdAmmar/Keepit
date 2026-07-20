/**
 * local-sync/compare.js
 * ---------------------------------------------------------------------------
 * مقارنة بنيوية (structural) بين مصفوفتي "تصنيفات" بصيغة التصدير (نفس شكل
 * ما يُنتجه export-schema.js). تُستخدَم من merge-pull.js لسؤال بسيط لكنه
 * حاسم: "هل محتوى الملف على القرص يختلف فعليًا عمّا لدينا محليًا الآن؟"
 *
 * لماذا لا نكتفي بمقارنة JSON.stringify مباشرة؟
 *   لأن ترتيب مفاتيح الكائن (key order) قد يختلف بين تشغيلتين لنفس البيانات
 *   منطقيًا (خصوصًا إن كتب الملفَّ إصدار مختلف قليلًا من نفس الميزة في
 *   متصفح آخر) دون أن يعني ذلك اختلافًا حقيقيًا في المحتوى. لذلك نُطبّع عبر
 *   ترتيب المفاتيح أبجديًا قبل المقارنة (stable stringify) — لكن نُبقي على
 *   ترتيب العناصر داخل كل مصفوفة كما هو، لأن ترتيب التصنيفات/المواقع بيانات
 *   ذات معنى فعلي وليس تفصيلًا عرضيًا.
 */

/**
 * @param {unknown} value
 * @returns {string}
 */
export function stableStringify(value) {
  return JSON.stringify(sortKeysDeep(value));
}

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = sortKeysDeep(/** @type {Record<string, unknown>} */ (value)[key]);
    }
    return out;
  }
  return value;
}

/**
 * @param {Array<any>} a - مصفوفة تصنيفات بصيغة التصدير
 * @param {Array<any>} b - مصفوفة تصنيفات بصيغة التصدير
 * @returns {boolean}
 */
export function exportCollectionsEqual(a, b) {
  return stableStringify(a ?? []) === stableStringify(b ?? []);
}

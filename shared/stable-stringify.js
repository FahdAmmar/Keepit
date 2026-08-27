/**
 * shared/stable-stringify.js
 * ---------------------------------------------------------------------------
 * تسلسل JSON حتمي (نفس المُدخَل ينتج دائمًا نفس النص، بصرف النظر عن ترتيب
 * مفاتيح الكائنات) — مفيدة لأي مقارنة بنيوية "هل هاتان الحالتان متطابقتان
 * فعليًا" بلا الاعتماد على ترتيب إدراج المفاتيح غير ذي الدلالة.
 *
 * كانت هذه الدالة معرَّفة داخل local-sync/compare.js رغم أنها عامة تمامًا
 * ولا علاقة لها بمنطق المزامنة المحلية تحديدًا — استُخرجت هنا حتى لا تضطر
 * أي ميزة أخرى لتكرارها أو (الأسوأ) الاعتماد على وحدة ميزة محدَّدة لاستخدام
 * أداة عامة (shared/optimistic-state-write.js تستخدمها أيضًا).
 */

/** @param {unknown} value @returns {string} */
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

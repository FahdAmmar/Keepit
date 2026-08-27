/**
 * local-sync/compare.js
 * ---------------------------------------------------------------------------
 * مقارنة بنيوية (structural) بين مصفوفتي "تصنيفات" بصيغة التصدير (نفس شكل
 * ما يُنتجه export-schema.js). تُستخدَم من merge-pull.js لسؤال بسيط لكنه
 * حاسم: "هل محتوى الملف على القرص يختلف فعليًا عمّا لدينا محليًا الآن؟"
 *
 * stableStringify نفسها عامة تمامًا (لا خاصة بالمزامنة المحلية) — استُخرجت
 * إلى shared/stable-stringify.js، وتُعاد تصديرها هنا فقط حفاظًا على نفس
 * نقطة الاستيراد لكل مستهلك حالي لهذا الملف.
 */
export { stableStringify } from "../shared/stable-stringify.js";
import { stableStringify } from "../shared/stable-stringify.js";

/**
 * @param {Array<any>} a - مصفوفة تصنيفات بصيغة التصدير
 * @param {Array<any>} b - مصفوفة تصنيفات بصيغة التصدير
 * @returns {boolean}
 */
export function exportCollectionsEqual(a, b) {
  return stableStringify(a ?? []) === stableStringify(b ?? []);
}

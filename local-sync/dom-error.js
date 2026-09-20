/**
 * local-sync/dom-error.js
 * ---------------------------------------------------------------------------
 * تفسير موحَّد لأخطاء File System Access API، يستخدمه reader.js وwriter.js
 * معًا (كانت كل نسخة منهما تُعرّف نفس المنطق بشكل منفصل — نفس أسماء
 * استثناءات DOM بالضبط، والفرق الوحيد هو كود الخطأ الافتراضي عند عدم
 * التعرّف على الاستثناء). لا مشكلة في استيراد الملفين من هنا: كلاهما
 * أصلًا داخل مجلد local-sync/ نفسه ويستوردان من constants.js المشترك
 * بينهما — بخلاف حالة KEEPIT_LOCALE_KEY المكرَّرة عمدًا بين مجلدات
 * الميزات المستقلة (راجع التعليقات هناك)، هذا توحيد داخل نفس الميزة.
 */
import { SYNC_ERRORS } from "./constants.js";

/**
 * @param {unknown} err
 * @param {string} fallbackCode - الكود المُرجَع عند عدم التعرّف على اسم الاستثناء
 * @param {string} logLabel - يظهر في رسالة console.error لتمييز القراءة عن الكتابة
 */
export function mapDomError(err, fallbackCode, logLabel) {
  const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return SYNC_ERRORS.PERMISSION_REQUIRED;
  }
  if (name === "NotFoundError") {
    return SYNC_ERRORS.FOLDER_MISSING;
  }
  console.error(`[Keepit local sync] ${logLabel}`, err);
  return fallbackCode;
}

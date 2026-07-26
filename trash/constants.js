/**
 * trash/constants.js
 * ---------------------------------------------------------------------------
 * ثوابت ميزة "سلة المحذوفات" لسياقات المستندات (صفحة الخيارات والنافذة
 * المنبثقة) — وحدة ES module حقيقية. يجب أن تبقى القيم المشتركة (المفاتيح،
 * الحدود) مطابقة تمامًا لنظيراتها في background/trash-sw/constants.js.
 * راجع التعليق هناك لشرح سبب هذا التكرار المحدود والمقصود.
 */
export const KEEPIT_STATE_KEY = "keepit:state";
export const KEEPIT_LOCALE_KEY = "keepit:locale";
export const TRASH_KEY = "keepit:trash";
export const MAX_ENTRIES = 200;
export const RETENTION_DAYS = 30;

/** أقل عمر (مللي ثانية) لعنصر سلة "جديد" حتى نعتبره جديرًا بعرض إشعار
 *  التراجع الفوري (toast) بدل تجاهله بصمت — راجع trash/undo-toast.js. */
export const UNDO_TOAST_FRESHNESS_MS = 4000;

/** مدة بقاء إشعار التراجع الفوري ظاهرًا على الشاشة (مللي ثانية). أطول
 *  بكثير من toast العادي (2600ms في dom-utils.js) لأنه يحمل إجراءً وليس
 *  مجرد إعلام. */
export const UNDO_TOAST_DURATION_MS = 8000;

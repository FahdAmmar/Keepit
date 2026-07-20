/**
 * local-sync/constants.js
 * ---------------------------------------------------------------------------
 * ثوابت ميزة "المزامنة المحلية" لسياقات المستندات (صفحة الخيارات ومستند
 * offscreen) — وحدة ES module حقيقية قابلة للاستيراد بـ import.
 *
 * تنبيه: القيم أدناه يجب أن تبقى مطابقة تمامًا لنظيراتها في
 * background/local-sync-sw/constants.js (نسخة السكربت الكلاسيكي المُحمَّلة
 * داخل service worker عبر importScripts). لا يوجد نظام تجميع (bundler) في
 * هذا المشروع يسمح بمشاركة ملف واحد بين النوعين، لذلك تم قبول هذا التكرار
 * المحدود والمُوثَّق عمدًا بدل تعقيد الإعداد بأداة بناء لميزة صغيرة.
 */

// المفتاح الذي يخزّن تحته التطبيق الأصلي كامل الحالة (التصنيفات + المواقع).
export const KEEPIT_STATE_KEY = "keepit:state";

// المفتاح المستخدم من التطبيق الأصلي لتفضيل اللغة (نتابعه لعرض لوحتنا
// بنفس لغة بقية التطبيق تلقائيًا).
export const KEEPIT_LOCALE_KEY = "keepit:locale";

// مفتاح تخزين إعدادات/حالة ميزة المزامنة المحلية.
export const STATUS_KEY = "keepit:fsSync";

// اسم الملف الافتراضي المُقترح عند أول إعداد للميزة.
export const DEFAULT_FILE_NAME = "keepit-data.json";

// نوع الرسالة التي يرسلها service worker إلى مستند offscreen لطلب الكتابة.
export const MSG_WRITE = "keepit-local-sync/write";

// نوع الرسالة التي يرسلها service worker إلى مستند offscreen لطلب "السحب"
// (قراءة الملف المحلي ودمج أي تغييرات خارجية فيه لم تصل بعد إلى هذا المتصفح).
export const MSG_PULL = "keepit-local-sync/pull";

// اسم المنبّه (chrome.alarms) المسؤول عن تشغيل فحص "سحب" دوري في الخلفية،
// حتى لو كانت صفحة الخيارات والنافذة المنبثقة مغلقتين، وحتى بعد إيقاف
// service worker وإعادة تشغيله (المنبّهات توقظه، بخلاف setInterval).
export const PULL_ALARM_NAME = "keepit-local-sync/pull-alarm";

// الفاصل الزمني بين كل فحص دوري (دقائق). لا يمكن أن يقل عن 1 في إضافة
// مثبَّتة فعليًا (Chrome يفرض حدًّا أدنى)، وهو كافٍ لشعور "تلقائي" عمليًا
// لأننا أيضًا نُشغّل فحصًا فوريًا عند بدء التشغيل وعند فتح أي واجهة.
export const PULL_INTERVAL_MINUTES = 2;

/**
 * وضع "السحب" (كيف تُدمَج بيانات الملف مع بيانات هذا المتصفح):
 *  - MERGE (افتراضي وآمن): يُضيف فقط ما هو جديد في الملف (تصنيفات/مواقع لم
 *    تكن موجودة هنا بعد)؛ لا يحذف أي شيء موجود محليًا أبدًا. هذا يعني أن
 *    عمليات الحذف التي تمّت في متصفح آخر لن تنتقل تلقائيًا بهذا الوضع —
 *    مقايضة مقصودة لتفادي فقدان بيانات المستخدم بصمت.
 *  - REPLACE (متقدّم): يجعل محتوى الملف هو "الحقيقة الوحيدة" ويستبدل به
 *    بيانات هذا المتصفح بالكامل، بما يشمل نقل الحذف أيضًا. مناسب فقط لمن
 *    يستخدم متصفحًا واحدًا فعليًا في كل مرة ويعتبر الملف مرجعًا كاملًا.
 */
export const PULL_MODE = Object.freeze({
  MERGE: "merge",
  REPLACE: "replace",
});

// إعدادات قاعدة IndexedDB التي تُخزَّن فيها مقابض (handles) المجلد المحلي.
// FileSystemDirectoryHandle قابل للتخزين مباشرة في IndexedDB (structured
// clone) منذ إصدارات Chrome الحديثة — هذا هو المكان الوحيد الذي يُخزَّن فيه.
export const DB_NAME = "keepit-local-sync";
export const DB_VERSION = 1;
export const DB_STORE = "handles";
export const DB_HANDLE_KEY = "projectDirectory";

/** الأخطاء المعروفة التي قد يرجعها writer.js/reader.js، لعرض رسالة مناسبة لكل حالة. */
export const SYNC_ERRORS = Object.freeze({
  NOT_CONFIGURED: "not-configured",
  PERMISSION_REQUIRED: "permission-required",
  FOLDER_MISSING: "folder-missing",
  WRITE_FAILED: "write-failed",
  READ_FAILED: "read-failed",
  INVALID_FILE: "invalid-file",
  TIMEOUT: "timeout",
  INTERNAL_ERROR: "internal-error",
  NO_RESPONSE: "no-response",
});

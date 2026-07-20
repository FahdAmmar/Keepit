"use strict";
/**
 * background/local-sync-sw/constants.js
 * ---------------------------------------------------------------------------
 * ثوابت ميزة "المزامنة المحلية" الخاصة بسياق service worker (سكربت كلاسيكي
 * يُحمَّل عبر importScripts، وليس ES module — لذلك لا يمكنه استيراد
 * local-sync/constants.js مباشرة). القيم هنا يجب أن تبقى مطابقة تمامًا
 * لنظيراتها في local-sync/constants.js (نسخة ES module المستخدمة داخل
 * صفحة الخيارات والمستند الخفي offscreen).
 *
 * سبب الازدواجية: منصّة الإضافات لا تسمح بمشاركة وحدات ES بين سكربت
 * classic (service worker الحالي، غير مبني كـ module لتفادي أي مخاطرة
 * بكسر الحزمة الأصلية المضغوطة) وبين مستندات DOM. بدل إدخال أداة تجميع
 * (bundler) لهذه الميزة الصغيرة، تم قبول هذا التكرار المحدود عمدًا.
 */
self.KeepitLocalSyncConstants = {
  // المفتاح الذي يخزّن تحته التطبيق الأصلي كامل الحالة (التصنيفات + المواقع).
  // هذا هو نقطة الربط الوحيدة مع الحزمة الأصلية: لا نعدّل أي كود موجود،
  // فقط نستمع لتغيّر هذا المفتاح تحديدًا.
  KEEPIT_STATE_KEY: "keepit:state",

  // مفتاح تخزين إعدادات/حالة ميزة المزامنة المحلية (مُفعّلة؟ اسم الملف؟
  // آخر مزامنة ناجحة؟ آخر خطأ؟) — يُقرأ من قِبل صفحة الخيارات لعرض الحالة.
  STATUS_KEY: "keepit:fsSync",

  // اسم الملف الافتراضي المُقترح عند أول إعداد للميزة.
  DEFAULT_FILE_NAME: "keepit-data.json",

  // مسار مستند offscreen (نسبةً إلى جذر الإضافة).
  OFFSCREEN_URL: "offscreen/offscreen.html",

  // نوع الرسالة التي يرسلها service worker إلى مستند offscreen لطلب الكتابة.
  MSG_WRITE: "keepit-local-sync/write",

  // نوع الرسالة التي يرسلها service worker إلى مستند offscreen لطلب "السحب"
  // (قراءة الملف المحلي ودمج أي تغييرات خارجية لم تصل بعد إلى هذا المتصفح).
  MSG_PULL: "keepit-local-sync/pull",

  // اسم منبّه chrome.alarms المسؤول عن تكرار فحص "السحب" في الخلفية.
  PULL_ALARM_NAME: "keepit-local-sync/pull-alarm",

  // الفاصل الزمني بين كل فحص دوري (دقائق).
  PULL_INTERVAL_MINUTES: 2,

  // أقصى مهلة انتظار لرد مستند offscreen قبل اعتبار الطلب فاشلاً (مللي ثانية).
  WRITE_TIMEOUT_MS: 8000,

  // نفس المهلة لكن لطلبات "السحب" (قد تكون أبطأ قليلًا: قراءة ملف + دمج).
  PULL_TIMEOUT_MS: 8000,

  // قيم وضع الدمج عند "السحب" — انظر PULL_MODE في local-sync/constants.js
  // للشرح الكامل. القيمة الافتراضية الآمنة هي MERGE (لا حذف أبدًا).
  PULL_MODE_MERGE: "merge",
  PULL_MODE_REPLACE: "replace",

  // مهلة تجميع (debounce) للتغيّرات المتتالية السريعة قبل الكتابة الفعلية.
  DEBOUNCE_MS: 250,
};

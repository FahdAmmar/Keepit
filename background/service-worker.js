"use strict";
/**
 * background/service-worker.js
 * ---------------------------------------------------------------------------
 * نقطة الدخول الفعلية لـ service worker (مُشار إليها من manifest.json).
 *
 * سبب وجود هذا الملف: لا نريد تعديل background/index.js (الحزمة الأصلية
 * المبنية/المضغوطة) يدويًا لإضافة أي ميزة جديدة، لتفادي أي خطر كسر منطق
 * موجود ومُختبَر. بدلاً من ذلك نُحمِّل الحزمة الأصلية كما هي عبر
 * importScripts، ثم نُحمِّل بعدها ملفات كل ميزة إضافية في نفس السياق
 * العام (global scope) لكن دون أي تعارض في الأسماء، لأن background/index.js
 * يُغلِّف كل شيء داخل IIFE ولا يُسرِّب أي متغير إلى النطاق العام.
 *
 * الميزات الإضافية المُحمَّلة هنا، كل واحدة مستقلة تمامًا عن الأخرى (تستمع
 * جميعها لنفس chrome.storage.onChanged.addListener بمستمعين منفصلين، بلا
 * أي تعارض):
 *   - local-sync-sw: مزامنة ملف محلي بين متصفحات على نفس الجهاز.
 *   - trash-sw: سلة محذوفات — يسجّل كل حذف تصنيف أو موقع لإتاحة التراجع عنه.
 *   - snapshots-sw: نسخ احتياطية دورية كاملة للحالة (تحمي من التعديلات
 *     أيضًا، لا الحذف فقط).
 *
 * الترتيب مهم داخل كل مجموعة: يجب تحميل ثوابت الميزة قبل controller.js
 * الخاص بها لأنه يعتمد عليها.
 */
importScripts(
  "index.js",
  "action-popup-sw.js",
  "local-sync-sw/constants.js",
  "local-sync-sw/controller.js",
  "trash-sw/constants.js",
  "trash-sw/diff.js",
  "trash-sw/controller.js",
  "snapshots-sw/constants.js",
  "snapshots-sw/controller.js",
);

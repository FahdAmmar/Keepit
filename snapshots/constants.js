/**
 * snapshots/constants.js
 * ---------------------------------------------------------------------------
 * ثوابت ميزة "النسخ الاحتياطية التلقائية" لسياقات المستندات (صفحة
 * الخيارات). يجب أن تبقى القيم المشتركة مطابقة تمامًا لنظيراتها في
 * background/snapshots-sw/constants.js — راجع التعليق هناك لشرح سبب هذا
 * التكرار المحدود والمقصود.
 */
export const KEEPIT_STATE_KEY = "keepit:state";
export const KEEPIT_LOCALE_KEY = "keepit:locale";
export const SNAPSHOTS_KEY = "keepit:snapshots";

export const KEEP_RECENT_COUNT = 10;
export const KEEP_DAILY_DAYS = 20;
export const MAX_AGE_DAYS = 45;
export const MAX_SNAPSHOTS = 40;

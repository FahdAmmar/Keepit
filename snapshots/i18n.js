/**
 * snapshots/i18n.js
 * ---------------------------------------------------------------------------
 * نصوص لوحة "النسخ الاحتياطية" بالعربية والإنجليزية، عبر محرّك الترجمة
 * العام shared/i18n-engine.js (نفس نمط local-sync/i18n.js).
 */
import { createTranslator } from "../shared/i18n-engine.js";

const STRINGS = {
  ar: {
    triggerLabel: "النسخ الاحتياطية",
    panelTitle: "النسخ الاحتياطية",
    panelIntro:
      "يأخذ Keepit تلقائيًا نسخة كاملة من كل تصنيفاتك ومواقعك بين الحين والآخر — تحميك أيضًا من التعديلات (تسمية، لون، ملاحظة) لا الحذف فقط، بعكس سلة المحذوفات. كل النسخ محلية بالكامل، لا تُرسل لأي خادم.",
    takeSnapshotAction: "إنشاء نسخة الآن",
    emptyTitle: "لا توجد نسخ بعد",
    emptyDesc: "ستظهر النسخ التلقائية هنا تدريجيًا مع استخدامك للإضافة، أو أنشئ نسخة يدويًا الآن.",
    snapshotSummary: "{collections} تصنيف، {items} موقع",
    triggerAuto: "تلقائية",
    triggerManual: "يدوية",
    restoreAction: "استرجاع",
    downloadAction: "تنزيل كملف",
    deleteAction: "حذف",
    restoreDialogTitle: "استرجاع نسخة من {time}",
    restoreModeLabel: "طريقة الاسترجاع",
    restoreModeMergeTitle: "دمج آمن",
    restoreModeMergeDesc: "يضيف فقط ما هو موجود في النسخة وغير موجود حاليًا. لا يحذف أي شيء لديك الآن.",
    restoreModeReplaceTitle: "استبدال كامل",
    restoreModeReplaceDesc: "يجعل محتوى النسخة هو الحالة الكاملة، ويحذف أي تصنيف أو موقع أُضيف بعد أخذها.",
    confirm: "تأكيد",
    cancel: "إلغاء",
    close: "إغلاق",
    confirmDeleteTitle: "حذف هذه النسخة؟",
    confirmDeleteDesc: "لا يمكن التراجع عن هذا الإجراء.",
    snapshotTakenToast: "تم إنشاء نسخة احتياطية",
    restoredToast: "تم الاسترجاع بنجاح",
    deletedToast: "تم حذف النسخة",
    downloadedToast: "بدأ تنزيل الملف",
    errorGeneric: "حدث خطأ غير متوقع، حاول مرة أخرى",
    retentionNote: "يُحتفَظ بآخر {recent} نسخة دائمًا، ونسخة واحدة يوميًا لمدة {daily} يومًا، وتُحذف أي نسخة أقدم من {maxAge} يومًا.",
  },
  en: {
    triggerLabel: "Backups",
    panelTitle: "Backups",
    panelIntro:
      "Keepit automatically takes a full snapshot of all your collections and sites every so often — this also protects you from edits (renames, colors, notes), not just deletions, unlike the trash. All snapshots stay fully local and are never sent anywhere.",
    takeSnapshotAction: "Take a snapshot now",
    emptyTitle: "No snapshots yet",
    emptyDesc: "Automatic snapshots will appear here gradually as you use the extension, or create one manually now.",
    snapshotSummary: "{collections} collections, {items} sites",
    triggerAuto: "Automatic",
    triggerManual: "Manual",
    restoreAction: "Restore",
    downloadAction: "Download as file",
    deleteAction: "Delete",
    restoreDialogTitle: "Restore snapshot from {time}",
    restoreModeLabel: "Restore method",
    restoreModeMergeTitle: "Safe merge",
    restoreModeMergeDesc: "Only adds what's in the snapshot and missing now. Never deletes anything you currently have.",
    restoreModeReplaceTitle: "Full replace",
    restoreModeReplaceDesc: "Makes the snapshot's content the complete state, deleting anything added since it was taken.",
    confirm: "Confirm",
    cancel: "Cancel",
    close: "Close",
    confirmDeleteTitle: "Delete this snapshot?",
    confirmDeleteDesc: "This action cannot be undone.",
    snapshotTakenToast: "Snapshot created",
    restoredToast: "Restored successfully",
    deletedToast: "Snapshot deleted",
    downloadedToast: "File download started",
    errorGeneric: "An unexpected error occurred, please try again",
    retentionNote: "The last {recent} snapshots are always kept, plus one per day for {daily} days; anything older than {maxAge} days is removed.",
  },
};

export const { t, resolveLocale } = createTranslator(STRINGS);

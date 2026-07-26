/**
 * trash/i18n.js
 * ---------------------------------------------------------------------------
 * نصوص لوحة "سلة المحذوفات" بالعربية والإنجليزية، بنفس نمط local-sync/i18n.js
 * تمامًا (نفس منطق resolveLocale ونفس أسلوب استبدال {param})، عبر محرّك
 * الترجمة العام shared/i18n-engine.js.
 */
import { createTranslator } from "../shared/i18n-engine.js";

const STRINGS = {
  ar: {
    triggerLabel: "سلة المحذوفات",
    panelTitle: "سلة المحذوفات",
    panelIntro: "كل تصنيف أو موقع تحذفه يبقى هنا مؤقتًا ({days} يومًا) قبل حذفه نهائيًا — يشمل ذلك أيضًا أي حذف وصل عبر المزامنة المحلية في وضع الاستبدال.",
    emptyTitle: "السلة فارغة",
    emptyDesc: "لا توجد عناصر محذوفة حاليًا.",
    itemFromCollection: "من: {collection}",
    collectionWithCount: "{count} موقع",
    restoreAction: "استعادة",
    deleteForeverAction: "حذف نهائي",
    emptyTrashAction: "إفراغ السلة",
    confirmDeleteForeverTitle: "حذف نهائي؟",
    confirmDeleteForeverDesc: "لا يمكن التراجع عن هذا الإجراء.",
    confirmEmptyTrashTitle: "إفراغ السلة بالكامل؟",
    confirmEmptyTrashDesc: "سيُحذف كل ما في السلة نهائيًا ولا يمكن التراجع عن هذا.",
    confirm: "تأكيد",
    cancel: "إلغاء",
    close: "إغلاق",
    restoredToast: "تمت الاستعادة",
    restoredMergedToast: "تمت الاستعادة ودُمجت مع تصنيف موجود بنفس الاسم",
    restoredRecreatedToast: "تمت الاستعادة (أُعيد إنشاء التصنيف)",
    alreadyExistsToast: "هذا الموقع محفوظ بالفعل، لم تتم إضافته مجددًا",
    deletedForeverToast: "تم الحذف نهائيًا",
    emptiedToast: "تم إفراغ السلة",
    errorGeneric: "حدث خطأ غير متوقع، حاول مرة أخرى",
    undoToastDeletedCollection: 'تم حذف تصنيف "{name}"',
    undoToastDeletedItem: 'تم حذف "{name}"',
    undoAction: "تراجع",
    undoToastMultiple: "تم حذف {count} عنصر",
    openTrashAction: "فتح السلة",
  },
  en: {
    triggerLabel: "Trash",
    panelTitle: "Trash",
    panelIntro: "Every collection or site you delete stays here temporarily ({days} days) before being permanently removed — this also covers anything removed via local sync in replace mode.",
    emptyTitle: "Trash is empty",
    emptyDesc: "No deleted items right now.",
    itemFromCollection: "From: {collection}",
    collectionWithCount: "{count} sites",
    restoreAction: "Restore",
    deleteForeverAction: "Delete forever",
    emptyTrashAction: "Empty trash",
    confirmDeleteForeverTitle: "Delete forever?",
    confirmDeleteForeverDesc: "This action cannot be undone.",
    confirmEmptyTrashTitle: "Empty the whole trash?",
    confirmEmptyTrashDesc: "Everything in the trash will be permanently deleted. This cannot be undone.",
    confirm: "Confirm",
    cancel: "Cancel",
    close: "Close",
    restoredToast: "Restored",
    restoredMergedToast: "Restored and merged into an existing collection with the same name",
    restoredRecreatedToast: "Restored (collection re-created)",
    alreadyExistsToast: "This site is already saved, it wasn't added again",
    deletedForeverToast: "Permanently deleted",
    emptiedToast: "Trash emptied",
    errorGeneric: "An unexpected error occurred, please try again",
    undoToastDeletedCollection: 'Deleted collection "{name}"',
    undoToastDeletedItem: 'Deleted "{name}"',
    undoAction: "Undo",
    undoToastMultiple: "Deleted {count} items",
    openTrashAction: "Open trash",
  },
};

export const { t, resolveLocale } = createTranslator(STRINGS);

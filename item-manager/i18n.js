/**
 * item-manager/i18n.js
 * ---------------------------------------------------------------------------
 * نصوص ميزة إدارة عناصر التصنيف، بنفس نمط باقي ملفات i18n في المشروع عبر
 * shared/i18n-engine.js.
 */
import { createTranslator } from "../shared/i18n-engine.js";

const STRINGS = {
  ar: {
    triggerLabel: "إدارة عناصر التصنيف",
    panelTitle: "إدارة عناصر التصنيف",
    close: "إغلاق",

    collectionPickerLabel: "التصنيف",
    noCollectionsYet: "لا توجد تصنيفات بعد",
    emptyCollectionNote: "لا مواقع في هذا التصنيف بعد",

    selectAllLabel: "تحديد الكل",
    selectedCountLabel: "{count} محدد",

    moveToLabel: "نقل إلى",
    moveAction: "نقل",
    deleteSelectedAction: "حذف المحدد",

    moveUpAriaLabel: 'نقل "{title}" لأعلى',
    moveDownAriaLabel: 'نقل "{title}" لأسفل',
    dragHandleAriaLabel: 'اسحب لإعادة ترتيب "{title}"',
    itemCheckboxAriaLabel: 'تحديد "{title}"',

    moveSuccessToast: "تم نقل {count} موقع",
    deleteSuccessToast: "تم حذف {count} موقع — يمكن استعادته من سلة المحذوفات",
    reorderSuccessToast: "تم حفظ الترتيب الجديد",
    noTargetCollectionToast: "اختر تصنيفًا مختلفًا للنقل إليه",
    errorGeneric: "حدث خطأ غير متوقع، حاول مرة أخرى",
  },
  en: {
    triggerLabel: "Manage collection items",
    panelTitle: "Manage collection items",
    close: "Close",

    collectionPickerLabel: "Collection",
    noCollectionsYet: "No collections yet",
    emptyCollectionNote: "No sites in this collection yet",

    selectAllLabel: "Select all",
    selectedCountLabel: "{count} selected",

    moveToLabel: "Move to",
    moveAction: "Move",
    deleteSelectedAction: "Delete selected",

    moveUpAriaLabel: 'Move "{title}" up',
    moveDownAriaLabel: 'Move "{title}" down',
    dragHandleAriaLabel: 'Drag to reorder "{title}"',
    itemCheckboxAriaLabel: 'Select "{title}"',

    moveSuccessToast: "Moved {count} sites",
    deleteSuccessToast: "Deleted {count} sites — you can restore them from Trash",
    reorderSuccessToast: "New order saved",
    noTargetCollectionToast: "Choose a different collection to move to",
    errorGeneric: "An unexpected error occurred, please try again",
  },
};

export const { t, resolveLocale } = createTranslator(STRINGS);

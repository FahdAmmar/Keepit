/**
 * bookmarks-bridge/i18n.js
 * ---------------------------------------------------------------------------
 * نصوص ميزة "جسر إشارات Chrome المرجعية" بالعربية والإنجليزية، بنفس نمط
 * trash/i18n.js وsnapshots/i18n.js تمامًا عبر shared/i18n-engine.js.
 */
import { createTranslator } from "../shared/i18n-engine.js";

const STRINGS = {
  ar: {
    triggerLabel: "جسر إشارات Chrome المرجعية",
    panelTitle: "استيراد وتصدير الإشارات المرجعية",
    close: "إغلاق",

    importFromChromeTitle: "استيراد من إشارات Chrome المرجعية",
    importFromChromeDesc:
      "اختر مجلدًا من إشاراتك المرجعية الحالية في المتصفح. المجلدات الفرعية تُستورَد كل واحد منها كتصنيف مستقل. لا يُحذف أو يُستبدَل أي شيء — العملية دمج آمن دائمًا.",
    folderPickerLabel: "المجلد",
    folderPickerEmpty: "لا توجد إشارات مرجعية لاستيرادها",
    folderCountSuffix: "{count} إشارة",
    importFromChromeAction: "استيراد",

    htmlFileTitle: "ملف HTML قياسي (Netscape Bookmark File)",
    htmlFileDesc:
      "الصيغة القياسية التي يدعمها كل متصفح تقريبًا (Firefox، Safari، Edge...) — استورد ملفًا صدّرته من أي مكان، أو صدّر مجموعاتك الحالية لاستخدامها في مكان آخر.",
    htmlFileImportLabel: "استيراد ملف",
    htmlFileImportAction: "استيراد",
    htmlFileExportAction: "تصدير الكل كملف HTML",

    exportToChromeTitle: "تصدير إلى إشارات Chrome المرجعية",
    exportToChromeDesc:
      'يُنشئ مجلد "Keepit" (إن لم يكن موجودًا) داخل شريط الإشارات المرجعية، ومجلدًا فرعيًا باسم التصنيف. إشارة مرجعية موجودة أصلاً بنفس الرابط لا تتكرر عند التصدير المتكرر.',
    collectionPickerLabel: "التصنيف",
    allCollectionsOption: "كل التصنيفات ({count} تصنيف، {items} موقع)",
    exportToChromeAction: "تصدير",

    noCollectionsYet: "لا توجد تصنيفات بعد",

    importSuccessToast: "تم الاستيراد: {collections} تصنيف، {items} موقع",
    importSuccessWithSkippedToast: "تم الاستيراد: {collections} تصنيف، {items} موقع (تم تجاوز {skipped} مكرر)",
    importEmptyToast: "لا توجد إشارات مرجعية صالحة لاستيرادها",
    exportSuccessToast: "تم التصدير: {created} إشارة جديدة",
    exportAlreadyUpToDateToast: "كل إشارات هذا التصنيف موجودة بالفعل في Chrome",
    invalidFileToast: "هذا الملف ليس بصيغة إشارات مرجعية صالحة",
    fileTooLargeToast: "الملف كبير جدًا",
    errorGeneric: "حدث خطأ غير متوقع، حاول مرة أخرى",
  },
  en: {
    triggerLabel: "Chrome Bookmarks Bridge",
    panelTitle: "Import & export bookmarks",
    close: "Close",

    importFromChromeTitle: "Import from Chrome bookmarks",
    importFromChromeDesc:
      "Pick a folder from your browser's existing bookmarks. Each sub-folder is imported as its own collection. Nothing is ever deleted or replaced — this is always a safe merge.",
    folderPickerLabel: "Folder",
    folderPickerEmpty: "No bookmarks available to import",
    folderCountSuffix: "{count} bookmarks",
    importFromChromeAction: "Import",

    htmlFileTitle: "Standard HTML file (Netscape Bookmark File)",
    htmlFileDesc:
      "The standard format supported by nearly every browser (Firefox, Safari, Edge...) — import a file exported from anywhere, or export your current collections for use elsewhere.",
    htmlFileImportLabel: "Import file",
    htmlFileImportAction: "Import",
    htmlFileExportAction: "Export all as HTML file",

    exportToChromeTitle: "Export to Chrome bookmarks",
    exportToChromeDesc:
      'Creates a "Keepit" folder (if missing) in your bookmarks bar, with a sub-folder per collection name. A bookmark that already exists at the same URL won\'t be duplicated on repeated exports.',
    collectionPickerLabel: "Collection",
    allCollectionsOption: "All collections ({count} collections, {items} sites)",
    exportToChromeAction: "Export",

    noCollectionsYet: "No collections yet",

    importSuccessToast: "Imported: {collections} collections, {items} sites",
    importSuccessWithSkippedToast: "Imported: {collections} collections, {items} sites ({skipped} duplicates skipped)",
    importEmptyToast: "No valid bookmarks to import",
    exportSuccessToast: "Exported: {created} new bookmarks",
    exportAlreadyUpToDateToast: "All bookmarks in this collection already exist in Chrome",
    invalidFileToast: "This file isn't a valid bookmarks file",
    fileTooLargeToast: "File is too large",
    errorGeneric: "An unexpected error occurred, please try again",
  },
};

export const { t, resolveLocale } = createTranslator(STRINGS);

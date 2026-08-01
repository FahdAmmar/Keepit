/**
 * quick-add-preview/i18n.js
 * ---------------------------------------------------------------------------
 * نصوص لوحة "الروابط المحفوظة في هذا التصنيف" التي تظهر أسفل بطاقة
 * الإضافة السريعة فور اختيار تصنيف من القائمة المنسدلة.
 */
import { createTranslator } from "../shared/i18n-engine.js";

const STRINGS = {
  ar: {
    previewHeading: "الروابط المحفوظة في هذا التصنيف",
    emptyNote: "لا مواقع في هذا التصنيف بعد",
  },
  en: {
    previewHeading: "Sites saved in this collection",
    emptyNote: "No sites in this collection yet",
  },
};

export const { t, resolveLocale } = createTranslator(STRINGS);

/**
 * search-enhance/i18n.js
 * ---------------------------------------------------------------------------
 * نصوص لوحة "التصنيفات المطابقة" الإضافية أسفل حقل البحث.
 */
import { createTranslator } from "../shared/i18n-engine.js";

const STRINGS = {
  ar: {
    matchingCollectionsTitle: "التصنيفات المطابقة",
    emptyCollectionNote: "لا مواقع في هذا التصنيف بعد",
    expandAriaLabel: 'عرض مواقع تصنيف "{name}"',
    collapseAriaLabel: 'إخفاء مواقع تصنيف "{name}"',
  },
  en: {
    matchingCollectionsTitle: "Matching collections",
    emptyCollectionNote: "No sites in this collection yet",
    expandAriaLabel: 'Show sites in "{name}"',
    collapseAriaLabel: 'Hide sites in "{name}"',
  },
};

export const { t, resolveLocale } = createTranslator(STRINGS);

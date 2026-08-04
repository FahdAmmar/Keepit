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
    moreMatchesNote: "+ {count} نتيجة أخرى في هذا التصنيف",
  },
  en: {
    matchingCollectionsTitle: "Matching collections",
    emptyCollectionNote: "No sites in this collection yet",
    expandAriaLabel: 'Show sites in "{name}"',
    collapseAriaLabel: 'Hide sites in "{name}"',
    moreMatchesNote: "+ {count} more matches in this collection",
  },
};

export const { t, resolveLocale } = createTranslator(STRINGS);

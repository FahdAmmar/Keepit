/**
 * quick-add-preview/constants.js
 * ---------------------------------------------------------------------------
 * ثوابت ميزة "معاينة روابط التصنيف المختار داخل بطاقة الإضافة السريعة".
 * القيم المشتركة (مفاتيح التخزين) مكرَّرة هنا عمدًا ومحدودة، مطابقة تمامًا
 * لنظيراتها في باقي وحدات popup/options الإضافية (راجع التعليق المماثل في
 * search-enhance/constants.js لشرح سبب هذا التكرار المقصود بدل استيراد
 * مشترك بين مجلدات الميزات المستقلة).
 */
export const KEEPIT_STATE_KEY = "keepit:state";
export const KEEPIT_LOCALE_KEY = "keepit:locale";

/** المحدِّدان اللذان تُبنى عليهما بطاقة "الإضافة السريعة" — نفس البنية
 *  تمامًا (className) في شاشتي القائمة والتفاصيل داخل popup/main.js
 *  (المضغوطة)، دالة ge(). لا نظير لهذه البطاقة في صفحة الإعدادات إطلاقًا. */
export const CARD_SELECTOR = ".quick-add";
export const SELECT_SELECTOR = ".quick-add__select";

/**
 * shared/i18n-engine.js
 * ---------------------------------------------------------------------------
 * محرّك ترجمة صغير وعام تمامًا (لا يعرف شيئًا عن Keepit تحديدًا) — نفس
 * منطق resolveLocale/t الموجود في local-sync/i18n.js، مستخرَج هنا ليُستخدم
 * من أكثر من ميزة (سلة المحذوفات + النسخ الاحتياطية) دون تكرار منطق
 * الاستبدال {param} والرجوع للعربية عند غياب الترجمة، في كل مرة.
 *
 * لا يُعدَّل local-sync/i18n.js إطلاقًا (يبقى مستقلاً كما هو تمامًا)؛ هذا
 * ملف جديد بالكامل لا يُغيّر أي سلوك موجود.
 */

/** @param {string} lang */
export function detectSystemLocale(lang = typeof navigator !== "undefined" ? navigator.language : "ar") {
  return (lang || "ar").toLowerCase().startsWith("ar") ? "ar" : "en";
}

/**
 * @param {{ar: Record<string,string>, en: Record<string,string>}} strings
 * @returns {{
 *   t: (locale: string, key: string, params?: Record<string, string|number>) => string,
 *   resolveLocale: (pref: unknown) => "ar" | "en",
 * }}
 */
export function createTranslator(strings) {
  /**
   * @param {unknown} pref - قيمة خام من chrome.storage، قد لا تكون string
   *   صالحة أصلاً (تخزين تالف، أو قيمة من إصدار قديم من الإضافة) — لهذا
   *   unknown لا string، هذه الدالة تحديدًا مصمَّمة للتحقق من مدخل غير موثوق.
   * @returns {"ar" | "en"}
   */
  function resolveLocale(pref) {
    if (pref === "ar" || pref === "en") return pref;
    return detectSystemLocale(); // "system"، أو undefined، أو أي قيمة تالفة غير "ar"/"en" — كلها تُعامَل بنفس الطريقة
  }

  function t(locale, key, params) {
    let value = strings[locale]?.[key] ?? strings.ar[key] ?? key;
    if (params) {
      for (const [name, val] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${name}\\}`, "g"), String(val));
      }
    }
    return value;
  }

  return { t, resolveLocale };
}

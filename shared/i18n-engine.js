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
 *   resolveLocale: (pref: string | undefined) => string,
 * }}
 */
export function createTranslator(strings) {
  function resolveLocale(pref) {
    return pref === "system" || !pref ? detectSystemLocale() : pref;
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

/**
 * shared/safe-favicon.js
 * ---------------------------------------------------------------------------
 * تحقّق دفاعي بسيط قبل استخدام faviconUrl كمصدر <img>. القيمة قد تأتي من
 * بيانات استُعيدت من سلة المحذوفات أو نسخة احتياطية أو ملف مزامنة كتبه
 * متصفح آخر — أي مصدر خارج التعديل المباشر داخل الواجهة نفسها. نقبل فقط
 * http(s) أو data:image/*‎؛ أي شيء آخر (javascript:, data:text/html...) يُرفض
 * ويُستبدَل باحتياطي آمن. دفاع متعمّق (defense in depth): المتصفح أصلاً لا
 * يُنفّذ javascript: كمصدر <img>، لكن التحقق الصريح هنا أوضح وأكثر أمانًا
 * من الاعتماد على هذا السلوك ضمنيًا فقط.
 */
export function isSafeFaviconUrl(value) {
  if (typeof value !== "string" || !value) return false;
  if (value.startsWith("data:image/")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

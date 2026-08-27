/**
 * shared/safe-favicon.js
 * ---------------------------------------------------------------------------
 * تحقّق دفاعي بسيط قبل استخدام faviconUrl كمصدر <img>. القيمة قد تأتي من
 * بيانات استُعيدت من سلة المحذوفات أو نسخة احتياطية أو ملف مزامنة كتبه
 * متصفح آخر — أي مصدر خارج التعديل المباشر داخل الواجهة نفسها. نقبل فقط
 * http(s) أو data:image/*‎ (باستثناء svg+xml صراحةً)؛ أي شيء آخر
 * (javascript:, data:text/html...) يُرفض ويُستبدَل باحتياطي آمن.
 */
export function isSafeFaviconUrl(value) {
  if (typeof value !== "string" || !value) return false;
  // svg+xml مقصود الاستبعاد رغم أن <img src="data:image/svg+xml..."> آمن
  // فعليًا (المتصفح يمنع تنفيذ أي سكربت مضمَّن في هذا السياق تحديدًا) —
  // كل نقاط الاستخدام الأربع الحالية تفترض ضمنيًا سياق <img>؛ منعها هنا
  // يُزيل اعتمادًا ضمنيًا على ذلك الافتراض بلا أي كلفة حقيقية (لا حالة
  // استخدام مشروعة تحتاج SVG لأيقونة موقع فعليًا).
  if (value.startsWith("data:image/") && !value.startsWith("data:image/svg+xml")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

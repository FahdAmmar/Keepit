/**
 * shared/format-time.js
 * ---------------------------------------------------------------------------
 * تنسيق وقت نسبي ("قبل 5 دقائق"...) — نفس الفكرة الموجودة أصلاً كنسخة
 * خاصة داخل options/local-sync-panel.js (formatRelativeTime)، لكن مُستخرجة
 * هنا لأن لوحتي "سلة المحذوفات" و"النسخ الاحتياطية" الجديدتين تحتاجانها
 * كلتاهما. لا تُعدَّل نسخة local-sync-panel.js الأصلية — تبقى كما هي؛ هذا
 * ملف جديد مستقل تمامًا.
 */

const LABELS = {
  ar: { now: "الآن", minutes: "قبل {n} دقيقة", hours: "قبل {n} ساعة", days: "قبل {n} يوم" },
  en: { now: "just now", minutes: "{n}m ago", hours: "{n}h ago", days: "{n}d ago" },
};

/**
 * @param {number} timestampMs
 * @param {"ar" | "en"} locale
 */
export function formatRelativeTime(timestampMs, locale) {
  const labels = LABELS[locale] || LABELS.ar;
  const diffMin = Math.max(0, Math.round((Date.now() - timestampMs) / 60000));

  if (diffMin < 1) return labels.now;
  if (diffMin < 60) return labels.minutes.replace("{n}", String(diffMin));

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return labels.hours.replace("{n}", String(diffHr));

  const diffDay = Math.round(diffHr / 24);
  return labels.days.replace("{n}", String(diffDay));
}

/**
 * @param {number} timestampMs
 * @param {"ar" | "en"} locale
 */
export function formatAbsoluteDateTime(timestampMs, locale) {
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestampMs));
  } catch {
    return new Date(timestampMs).toLocaleString();
  }
}

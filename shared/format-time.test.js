import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRelativeTime, formatAbsoluteDateTime } from "./format-time.js";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('يعرض "الآن" لفارق أقل من 30 ثانية (يُقرَّب لأقل من نصف دقيقة)', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 10_000, "ar")).toBe("الآن");
  });

  it("يعرض الدقائق بين دقيقة وأقل من ساعة", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 5 * 60_000, "ar")).toBe("قبل 5 دقيقة");
    expect(formatRelativeTime(now - 5 * 60_000, "en")).toBe("5m ago");
  });

  it("يعرض الساعات بين ساعة وأقل من يوم", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 3 * 3_600_000, "ar")).toBe("قبل 3 ساعة");
  });

  it("يعرض الأيام لما فوق 24 ساعة", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 5 * 86_400_000, "en")).toBe("5d ago");
  });

  it("لا يعرض قيمة سالبة لطابع زمني مستقبلي (انحراف ساعة بين الأجهزة)", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    // طابع زمني بعد 10 دقائق من "الآن" — يحدث فعليًا عند اختلاف ساعة
    // النظام بين جهازين يتشاركان نفس بيانات المزامنة المحلية.
    expect(formatRelativeTime(now + 10 * 60_000, "ar")).toBe("الآن");
  });

  it("يرجع لعربي افتراضيًا للغة غير مدعومة", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    expect(formatRelativeTime(now - 5 * 60_000, /** @type {any} */ ("fr"))).toBe("قبل 5 دقيقة");
  });
});

describe("formatAbsoluteDateTime", () => {
  it("لا يرمي خطأ لطابع زمني صالح بأي من اللغتين", () => {
    const ts = new Date("2026-01-15T10:30:00Z").getTime();
    expect(() => formatAbsoluteDateTime(ts, "ar")).not.toThrow();
    expect(() => formatAbsoluteDateTime(ts, "en")).not.toThrow();
    expect(formatAbsoluteDateTime(ts, "en")).toEqual(expect.any(String));
  });

  it("لا يرمي خطأ حتى لطابع زمني غير صالح (NaN) — يقع في المسار الاحتياطي", () => {
    expect(() => formatAbsoluteDateTime(NaN, "ar")).not.toThrow();
  });
});

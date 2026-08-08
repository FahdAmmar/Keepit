import { describe, it, expect } from "vitest";
import { stableStringify, exportCollectionsEqual } from "./compare.js";

describe("stableStringify", () => {
  it("ينتج نفس النص بصرف النظر عن ترتيب المفاتيح", () => {
    const a = { b: 1, a: 2 };
    const b = { a: 2, b: 1 };
    expect(stableStringify(a)).toBe(stableStringify(b));
  });

  it("يطبّع المفاتيح بعمق داخل مصفوفات متداخلة", () => {
    const a = { items: [{ z: 1, a: 2 }] };
    const b = { items: [{ a: 2, z: 1 }] };
    expect(stableStringify(a)).toBe(stableStringify(b));
  });

  it("يحافظ على ترتيب عناصر المصفوفة نفسها (ذو معنى، لا يُطبَّع)", () => {
    const a = [{ id: 1 }, { id: 2 }];
    const b = [{ id: 2 }, { id: 1 }];
    expect(stableStringify(a)).not.toBe(stableStringify(b));
  });

  it("يتعامل مع القيم البدائية والفارغة بلا رمي خطأ", () => {
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(42)).toBe("42");
    expect(stableStringify("x")).toBe('"x"');
    expect(stableStringify([])).toBe("[]");
  });
});

describe("exportCollectionsEqual", () => {
  it("يعتبر مصفوفتين متطابقتين محتوى (بترتيب مفاتيح مختلف) متساويتين", () => {
    const a = [{ name: "A", color: "indigo", items: [] }];
    const b = [{ color: "indigo", name: "A", items: [] }];
    expect(exportCollectionsEqual(a, b)).toBe(true);
  });

  it("يعتبر مصفوفتين مختلفتين فعليًا غير متساويتين", () => {
    const a = [{ name: "A", items: [] }];
    const b = [{ name: "B", items: [] }];
    expect(exportCollectionsEqual(a, b)).toBe(false);
  });

  it("يعامل null/undefined كمصفوفة فارغة", () => {
    expect(exportCollectionsEqual(null, undefined)).toBe(true);
    expect(exportCollectionsEqual([], null)).toBe(true);
    expect(exportCollectionsEqual([{ name: "A" }], null)).toBe(false);
  });

  it("حساس لترتيب عناصر المواقع داخل التصنيف (إعادة الترتيب تغيير حقيقي)", () => {
    const a = [{ name: "A", items: [{ url: "https://x.com" }, { url: "https://y.com" }] }];
    const b = [{ name: "A", items: [{ url: "https://y.com" }, { url: "https://x.com" }] }];
    expect(exportCollectionsEqual(a, b)).toBe(false);
  });
});

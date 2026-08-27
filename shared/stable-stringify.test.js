import { describe, it, expect } from "vitest";
import { stableStringify } from "./stable-stringify.js";

describe("stableStringify", () => {
  it("ينتج نفس النص بصرف النظر عن ترتيب المفاتيح", () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
  });

  it("يطبّع المفاتيح بعمق داخل مصفوفات وكائنات متداخلة", () => {
    const a = { items: [{ z: 1, a: { y: 2, x: 1 } }] };
    const b = { items: [{ a: { x: 1, y: 2 }, z: 1 }] };
    expect(stableStringify(a)).toBe(stableStringify(b));
  });

  it("يحافظ على ترتيب عناصر المصفوفة نفسها (ذو معنى، لا يُطبَّع كالمفاتيح)", () => {
    const a = [{ id: 1 }, { id: 2 }];
    const b = [{ id: 2 }, { id: 1 }];
    expect(stableStringify(a)).not.toBe(stableStringify(b));
  });

  it("يتعامل مع القيم البدائية والفارغة بلا رمي خطأ", () => {
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(undefined)).toBe(undefined);
    expect(stableStringify(42)).toBe("42");
    expect(stableStringify("x")).toBe('"x"');
    expect(stableStringify([])).toBe("[]");
    expect(stableStringify({})).toBe("{}");
  });

  it("قيمتان مختلفتان فعليًا (لا بترتيب المفاتيح فقط) تُنتجان نصوصًا مختلفة", () => {
    expect(stableStringify({ a: 1 })).not.toBe(stableStringify({ a: 2 }));
  });
});

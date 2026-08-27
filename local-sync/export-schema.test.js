import { describe, it, expect } from "vitest";
import { buildExportPayload } from "./export-schema.js";

describe("buildExportPayload", () => {
  it("يبني الشكل الأساسي الصحيح", () => {
    const payload = buildExportPayload({ collections: [] });
    expect(payload.app).toBe("keepit");
    expect(payload.formatVersion).toBe(1);
    expect(typeof payload.exportedAt).toBe("number");
    expect(payload.collections).toEqual([]);
  });

  it("يُرتِّب عناصر كل تصنيف حسب order، لا ترتيب المصفوفة الأصلي", () => {
    const state = {
      collections: [
        {
          name: "أ",
          items: [
            { url: "https://c.com/", title: "ج", order: 2 },
            { url: "https://a.com/", title: "أ", order: 0 },
            { url: "https://b.com/", title: "ب", order: 1 },
          ],
        },
      ],
    };
    const payload = buildExportPayload(state);
    expect(payload.collections[0].items.map((i) => i.title)).toEqual(["أ", "ب", "ج"]);
  });

  it("يتجاهل id وupdatedAt عمدًا (بيانات تشغيلية بحتة)", () => {
    const state = {
      collections: [{ id: "should-not-appear", updatedAt: 12345, name: "أ", items: [] }],
    };
    const payload = buildExportPayload(state);
    expect(payload.collections[0]).not.toHaveProperty("id");
    expect(payload.collections[0]).not.toHaveProperty("updatedAt");
  });

  it("يُدرج pinned خلافًا لميزة التصدير اليدوية الأصلية (قرار مقصود موثَّق)", () => {
    const state = { collections: [{ name: "أ", pinned: true, items: [] }] };
    expect(buildExportPayload(state).collections[0].pinned).toBe(true);
  });

  it("لا يُدرج faviconUrl أو note الفارغين", () => {
    const state = {
      collections: [{ name: "أ", items: [{ url: "https://x.com/", title: "X", faviconUrl: "", note: "" }] }],
    };
    const item = buildExportPayload(state).collections[0].items[0];
    expect(item).not.toHaveProperty("faviconUrl");
    expect(item).not.toHaveProperty("note");
  });

  it("يتعامل مع state فارغة/null/تصنيفات مشوَّهة بلا رمي أي خطأ", () => {
    expect(() => buildExportPayload({})).not.toThrow();
    expect(() => buildExportPayload(/** @type {any} */ (null))).not.toThrow();
    expect(buildExportPayload(/** @type {any} */ (null)).collections).toEqual([]);
    expect(() => buildExportPayload({ collections: [null, "نص عشوائي", {}] })).not.toThrow();
  });

  it("لون افتراضي indigo لتصنيف بلا حقل color", () => {
    const payload = buildExportPayload({ collections: [{ name: "أ", items: [] }] });
    expect(payload.collections[0].color).toBe("indigo");
  });
});

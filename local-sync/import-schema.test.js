import { describe, it, expect } from "vitest";
import { extractExportCollections, toInternalCollections, ImportSchemaError } from "./import-schema.js";
import { SYNC_ERRORS } from "./constants.js";

describe("extractExportCollections", () => {
  it("يقبل ملفًا صالحًا ويُرجع مصفوفة تصنيفاته", () => {
    const file = { app: "keepit", collections: [{ name: "A" }] };
    expect(extractExportCollections(file)).toEqual([{ name: "A" }]);
  });

  it.each([
    ["ليس كائنًا", "not an object"],
    ["null", null],
    ["مصفوفة على المستوى الأعلى", []],
    ["app غير مطابق", { app: "other", collections: [] }],
    ["بلا حقل collections", { app: "keepit" }],
    ["collections ليست مصفوفة", { app: "keepit", collections: {} }],
  ])("يرفض %s برمي ImportSchemaError برمز INVALID_FILE", (_label, input) => {
    expect(() => extractExportCollections(input)).toThrow(ImportSchemaError);
    try {
      extractExportCollections(input);
    } catch (err) {
      expect(err.code).toBe(SYNC_ERRORS.INVALID_FILE);
    }
  });
});

describe("toInternalCollections", () => {
  it("يحوّل تصنيفًا صالحًا كاملًا للشكل الداخلي مع توليد id لكل تصنيف وعنصر", () => {
    const { collections, skippedCollections, skippedItems } = toInternalCollections([
      {
        name: "أدوات",
        color: "sky",
        pinned: true,
        items: [{ url: "https://example.com/", title: "مثال" }],
      },
    ]);

    expect(skippedCollections).toBe(0);
    expect(skippedItems).toBe(0);
    expect(collections).toHaveLength(1);

    const col = collections[0];
    expect(col.name).toBe("أدوات");
    expect(col.color).toBe("sky");
    expect(col.pinned).toBe(true);
    expect(typeof col.id).toBe("string");
    expect(col.id.length).toBeGreaterThan(0);
    expect(col.items).toHaveLength(1);
    expect(col.items[0].url).toBe("https://example.com/");
    expect(col.items[0].title).toBe("مثال");
    expect(col.items[0].order).toBe(0);
    expect(typeof col.items[0].id).toBe("string");
  });

  it("يهمل حقل pinned المفقود بافتراض false، ويهمل color المفقود بافتراض indigo", () => {
    const { collections } = toInternalCollections([{ name: "بلا إعدادات", items: [] }]);
    expect(collections[0].pinned).toBe(false);
    expect(collections[0].color).toBe("indigo");
  });

  it("يتجاهل تصنيفًا بلا اسم (فارغ أو غياب الحقل) بصمت ويحتسبه في skippedCollections", () => {
    const { collections, skippedCollections } = toInternalCollections([
      { name: "", items: [] },
      { items: [] }, // بلا حقل name إطلاقًا
      "ليس كائنًا",
      null,
    ]);
    expect(collections).toHaveLength(0);
    expect(skippedCollections).toBe(4);
  });

  it("يقصّ المسافات البيضاء من اسم التصنيف (trim)", () => {
    const { collections } = toInternalCollections([{ name: "  فراغات  ", items: [] }]);
    expect(collections[0].name).toBe("فراغات");
  });

  it("يرفض عنصرًا برابط javascript: (حماية أمنية جوهرية — لا يُقبل إلا http/https)", () => {
    const { collections, skippedItems } = toInternalCollections([
      {
        name: "اختبار أمان",
        items: [
          { url: "javascript:alert(1)", title: "خبيث" },
          { url: "https://safe.example.com/", title: "آمن" },
        ],
      },
    ]);
    expect(skippedItems).toBe(1);
    expect(collections[0].items).toHaveLength(1);
    expect(collections[0].items[0].url).toBe("https://safe.example.com/");
  });

  it.each(["data:text/html,<script>alert(1)</script>", "file:///etc/passwd", "ftp://example.com/", "not a url at all"])(
    "يرفض بروتوكولًا غير http/https: %s",
    (badUrl) => {
      const { collections, skippedItems } = toInternalCollections([
        { name: "اختبار", items: [{ url: badUrl, title: "عنوان" }] },
      ]);
      expect(skippedItems).toBe(1);
      expect(collections[0].items).toHaveLength(0);
    },
  );

  it("يتجاهل عنصرًا بلا عنوان (title) رغم رابط صالح، والعكس بالعكس", () => {
    const { collections, skippedItems } = toInternalCollections([
      {
        name: "اختبار",
        items: [
          { url: "https://a.com/", title: "" },
          { url: "", title: "بلا رابط" },
        ],
      },
    ]);
    expect(skippedItems).toBe(2);
    expect(collections[0].items).toHaveLength(0);
  });

  it("يقصّ حقل note الطويل عند 500 حرف بالضبط", () => {
    const longNote = "س".repeat(600);
    const { collections } = toInternalCollections([
      { name: "اختبار", items: [{ url: "https://a.com/", title: "عنوان", note: longNote }] },
    ]);
    expect(collections[0].items[0].note).toHaveLength(500);
  });

  it("يهمل حقل note الفارغ (لا يُدرجه إطلاقًا بدل سلسلة فارغة)", () => {
    const { collections } = toInternalCollections([
      { name: "اختبار", items: [{ url: "https://a.com/", title: "عنوان", note: "" }] },
    ]);
    expect(collections[0].items[0]).not.toHaveProperty("note");
  });

  it("يحافظ على createdAt الأصلي إن كان رقمًا صالحًا، ويستخدم الوقت الحالي غير ذلك", () => {
    const { collections } = toInternalCollections([
      {
        name: "اختبار",
        items: [
          { url: "https://a.com/", title: "له تاريخ", createdAt: 1700000000000 },
          { url: "https://b.com/", title: "بلا تاريخ" },
        ],
      },
    ]);
    expect(collections[0].items[0].createdAt).toBe(1700000000000);
    expect(collections[0].items[1].createdAt).toBeGreaterThan(1700000000000);
  });

  it("يُرقِّم حقل order تصاعديًا حسب ترتيب العناصر الصالحة فقط (لا يحسب المتجاهَل)", () => {
    const { collections } = toInternalCollections([
      {
        name: "اختبار",
        items: [
          { url: "https://a.com/", title: "أول" },
          { url: "javascript:bad()", title: "مرفوض" },
          { url: "https://b.com/", title: "ثاني" },
        ],
      },
    ]);
    expect(collections[0].items.map((it) => it.order)).toEqual([0, 1]);
  });

  it("مصفوفة فارغة تُنتج نتيجة فارغة بلا أي رمي خطأ", () => {
    expect(toInternalCollections([])).toEqual({ collections: [], skippedCollections: 0, skippedItems: 0 });
  });
});

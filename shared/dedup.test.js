import { describe, it, expect, beforeAll } from "vitest";

// شared/dedup.js سكربت كلاسيكي (لا ES module) يُلحق واجهته بـ globalThis.KeepitDedup
// عند التحميل — نفس ما يحدث فعليًا عبر <script src="shared/dedup.js"> في popup/options.
// دالة الترحيل التلقائي في نهايته تتحقق أولًا من وجود globalThis.chrome قبل
// استخدامه (راجع runMigration في الملف نفسه)، فتحميله بأمان هنا بلا محاكاة
// chrome.* إطلاقًا.
import "./dedup.js";

/** @type {any} */
let Dedup;

beforeAll(() => {
  Dedup = /** @type {any} */ (globalThis).KeepitDedup;
});

describe("KeepitDedup.normalizeUrl", () => {
  it("يزيل www. والـ fragment", () => {
    expect(Dedup.normalizeUrl("https://www.example.com/page#section")).toBe(Dedup.normalizeUrl("https://example.com/page"));
  });

  it("يرتّب معاملات الاستعلام (query params) بلا اعتبار للترتيب الأصلي", () => {
    expect(Dedup.normalizeUrl("https://x.com/?b=2&a=1")).toBe(Dedup.normalizeUrl("https://x.com/?a=1&b=2"));
  });

  it("يزيل معاملات التتبّع الشائعة (utm_*)", () => {
    const withTracking = Dedup.normalizeUrl("https://x.com/?utm_source=twitter&id=5");
    const withoutTracking = Dedup.normalizeUrl("https://x.com/?id=5");
    expect(withTracking).toBe(withoutTracking);
  });

  it("رابطان مختلفان فعليًا يبقيان مختلفين بعد التطبيع", () => {
    expect(Dedup.normalizeUrl("https://a.com/")).not.toBe(Dedup.normalizeUrl("https://b.com/"));
  });

  it("مدخل غير صالح (ليس رابطًا) لا يرمي خطأ", () => {
    expect(() => Dedup.normalizeUrl("ليس رابطًا")).not.toThrow();
  });
});

describe("KeepitDedup.findItemAcrossCollections", () => {
  const collections = [
    { id: "c1", name: "A", items: [{ id: "i1", url: "https://example.com/page" }] },
    { id: "c2", name: "B", items: [{ id: "i2", url: "https://other.com/x" }] },
  ];

  it("يجد الرابط في مجموعة أخرى ويعيد المجموعة والعنصر معًا", () => {
    const result = Dedup.findItemAcrossCollections(collections, "https://example.com/page");
    expect(result?.collection.id).toBe("c1");
    expect(result?.item.id).toBe("i1");
  });

  it("يطابق بعد التطبيع (www.، fragment، معاملات تتبّع)", () => {
    const result = Dedup.findItemAcrossCollections(collections, "https://www.example.com/page?utm_source=x#top");
    expect(result?.collection.id).toBe("c1");
  });

  it("يستبعد المجموعة المُمرَّرة في excludeCollectionId", () => {
    expect(Dedup.findItemAcrossCollections(collections, "https://example.com/page", "c1")).toBeNull();
  });

  it("يعيد null إذا لم يوجد الرابط في أي مجموعة", () => {
    expect(Dedup.findItemAcrossCollections(collections, "https://nowhere.com/")).toBeNull();
  });

  it("رابط غير صالح لا يرمي خطأ ويعيد null", () => {
    expect(() => Dedup.findItemAcrossCollections(collections, "ليس رابطًا")).not.toThrow();
    expect(Dedup.findItemAcrossCollections(collections, "ليس رابطًا")).toBeNull();
  });
});

describe("KeepitDedup.mergeCollections", () => {
  it("يدمج مجموعة incoming جديدة الاسم بجانب existing بلا تعارض", () => {
    const existing = [{ id: "1", name: "A", color: "indigo", pinned: false, items: [] }];
    const incoming = [{ id: "2", name: "B", color: "sky", pinned: false, items: [] }];
    const { merged, skippedCollections, skippedItems } = Dedup.mergeCollections(existing, incoming);

    expect(merged).toHaveLength(2);
    expect(skippedCollections).toBe(0);
    expect(skippedItems).toBe(0);
    // المعرّف الأصلي لكل تصنيف موجود يبقى كما هو دائمًا (راجع تعليق mergeCollections
    // في الملف نفسه — هذا بالضبط ما يمنع فقدان معرّفات موجودة أثناء الدمج).
    expect(merged.map((c) => c.id).sort()).toEqual(["1", "2"]);
  });

  it("يدمج incoming بنفس اسم existing (case-insensitive) ضمن نفس التصنيف، محتفظًا بمعرّف existing الأصلي", () => {
    const existing = [{ id: "orig-id", name: "Tools", color: "indigo", pinned: false, items: [] }];
    const incoming = [{ id: "new-id", name: "tools", color: "sky", pinned: false, items: [{ url: "https://x.com/", title: "X" }] }];
    const { merged, skippedCollections } = Dedup.mergeCollections(existing, incoming);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("orig-id"); // المعرّف الأصلي يبقى، لا معرّف incoming
    expect(merged[0].items).toHaveLength(1);
    expect(skippedCollections).toBe(1); // incoming اندمجت لا أُضيفت كتصنيف جديد
  });

  it("لا يُكرِّر رابطًا موجودًا أصلًا عند الدمج (بعد التطبيع)", () => {
    const existing = [
      { id: "1", name: "A", color: "indigo", pinned: false, items: [{ id: "i1", url: "https://x.com/", title: "X" }] },
    ];
    const incoming = [{ id: "2", name: "A", color: "sky", pinned: false, items: [{ url: "https://www.x.com/#ignored", title: "X مكرر" }] }];
    const { merged, skippedItems } = Dedup.mergeCollections(existing, incoming);

    expect(merged[0].items).toHaveLength(1); // لم يُضَف الموقع المكرر
    expect(skippedItems).toBe(1);
  });

  it("existing فارغة و incoming فقط — كل incoming يصبح النتيجة كاملة (حالة snapshots/dedup.js عند الترحيل الأول)", () => {
    const incoming = [{ id: "1", name: "A", color: "indigo", pinned: false, items: [] }];
    const { merged } = Dedup.mergeCollections([], incoming);
    expect(merged).toEqual([{ id: "1", name: "A", color: "indigo", pinned: false, items: [] }]);
  });

  it("تصنيف incoming بلا اسم صالح (فارغ) يُتجاهل ويُحتسَب في skippedCollections", () => {
    const { merged, skippedCollections } = Dedup.mergeCollections([], [{ id: "1", name: "", items: [] }]);
    expect(merged).toHaveLength(0);
    expect(skippedCollections).toBe(1);
  });
});

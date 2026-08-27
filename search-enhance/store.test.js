import { describe, it, expect } from "vitest";
import { KEEPIT_STATE_KEY, MAX_MATCHES, MAX_MATCHED_ITEMS_PER_COLLECTION } from "./constants.js";
import { searchMatchingCollections } from "./store.js";

function installChromeStorageMock(state) {
  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: async (key) => ({ [key]: state }),
      },
    },
  });
}

function col(id, name, items = []) {
  return { id, name, color: "indigo", pinned: false, createdAt: 1, updatedAt: 1, items };
}
function item(id, title, url) {
  return { id, title, url: url ?? `https://${id}.example.com/`, createdAt: 1, order: 0 };
}

describe("searchMatchingCollections", () => {
  it("يطابق حسب اسم التصنيف", async () => {
    installChromeStorageMock({ collections: [col("c1", "أدوات مفيدة"), col("c2", "أخرى")] });
    const results = await searchMatchingCollections("أدوات");
    expect(results.map((r) => r.name)).toEqual(["أدوات مفيدة"]);
    expect(results[0].nameMatches).toBe(true);
    expect(results[0].matchedItems).toEqual([]);
  });

  it("يطابق حسب عنوان أو رابط موقع داخل تصنيف لا يطابق اسمه", async () => {
    installChromeStorageMock({
      collections: [col("c1", "تصنيف عام", [item("i1", "موقع مميز"), item("i2", "آخر")])],
    });
    const results = await searchMatchingCollections("مميز");
    expect(results).toHaveLength(1);
    expect(results[0].nameMatches).toBe(false);
    expect(results[0].matchedItems.map((i) => i.id)).toEqual(["i1"]);
  });

  it("يطابق حسب الرابط أيضًا لا العنوان فقط", async () => {
    installChromeStorageMock({
      collections: [col("c1", "تصنيف", [item("i1", "بلا صلة", "https://special-domain.example.com/")])],
    });
    const results = await searchMatchingCollections("special-domain");
    expect(results[0].matchedItems.map((i) => i.id)).toEqual(["i1"]);
  });

  it("تصنيف بلا أي تطابق (اسمًا أو مواقعًا) يُستبعَد كليًا", async () => {
    installChromeStorageMock({ collections: [col("c1", "لا علاقة", [item("i1", "غير مطابق")])] });
    expect(await searchMatchingCollections("مختلف تمامًا")).toEqual([]);
  });

  it("استعلام فارغ (أو بيض فقط) يُرجع مصفوفة فارغة فورًا بلا قراءة تخزين", async () => {
    installChromeStorageMock({ collections: [col("c1", "أي شيء")] });
    expect(await searchMatchingCollections("")).toEqual([]);
    expect(await searchMatchingCollections("   ")).toEqual([]);
  });

  it("الترتيب: اسم يبدأ بالنص أولًا، ثم يحتويه فقط، ثم تطابق مواقع فقط", async () => {
    installChromeStorageMock({
      collections: [
        col("c1", "يحوي أدوات بالوسط"),
        col("c2", "أدوات في البداية"),
        col("c3", "تصنيف عادي", [item("i1", "يذكر أدوات هنا")]),
      ],
    });
    const results = await searchMatchingCollections("أدوات");
    expect(results.map((r) => r.id)).toEqual(["c2", "c1", "c3"]);
  });

  it(`يحدّ عدد المواقع المطابقة المُعادة لكل تصنيف عند ${MAX_MATCHED_ITEMS_PER_COLLECTION}، مع إجمالي دقيق`, async () => {
    const manyItems = Array.from({ length: MAX_MATCHED_ITEMS_PER_COLLECTION + 5 }, (_, i) =>
      item(`i${i}`, `مطابق رقم ${i}`),
    );
    installChromeStorageMock({ collections: [col("c1", "تصنيف", manyItems)] });
    const [result] = await searchMatchingCollections("مطابق");
    expect(result.matchedItems).toHaveLength(MAX_MATCHED_ITEMS_PER_COLLECTION);
    expect(result.matchedItemsTotal).toBe(MAX_MATCHED_ITEMS_PER_COLLECTION + 5);
  });

  it(`يحدّ عدد التصنيفات المُعادة إجمالًا عند ${MAX_MATCHES}`, async () => {
    const manyCollections = Array.from({ length: MAX_MATCHES + 5 }, (_, i) => col(`c${i}`, `تطابق رقم ${i}`));
    installChromeStorageMock({ collections: manyCollections });
    const results = await searchMatchingCollections("تطابق");
    expect(results).toHaveLength(MAX_MATCHES);
  });

  it("لا يرمي أي خطأ لتصنيفات أو عناصر مشوَّهة (بلا اسم، أو غير كائن أصلاً)", async () => {
    installChromeStorageMock({
      collections: [null, "نص عشوائي", { name: 42 }, col("c1", "سليم", [null, { title: 5 }])],
    });
    await expect(searchMatchingCollections("سليم")).resolves.not.toThrow();
  });

  it("حالة أحرف غير حسّاسة (case-insensitive) للنصوص اللاتينية", async () => {
    installChromeStorageMock({ collections: [col("c1", "My Collection")] });
    const results = await searchMatchingCollections("COLLECTION");
    expect(results).toHaveLength(1);
  });
});

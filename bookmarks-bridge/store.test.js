import { describe, it, expect, vi, beforeEach } from "vitest";
import "../shared/dedup.js"; // يُلحق globalThis.KeepitDedup
import { readExistingCollections, importNormalizedCollections } from "./store.js";
import { KEEPIT_STATE_KEY, COLOR_CYCLE } from "./constants.js";

function installChromeStorageMock(initialCollections = []) {
  const store = {
    [KEEPIT_STATE_KEY]: { schemaVersion: 1, collections: initialCollections, lastUsedCollectionId: null },
  };
  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: vi.fn(async (key) => ({ [key]: structuredClone(store[key]) })),
        set: vi.fn(async (patch) => {
          Object.assign(store, structuredClone(patch));
        }),
      },
    },
  });
  return store;
}

describe("bookmarks-bridge/store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("readExistingCollections", () => {
    it("يُرجع مصفوفة فارغة إن لم تكن هناك حالة بعد", async () => {
      installChromeStorageMock();
      expect(await readExistingCollections()).toEqual([]);
    });
  });

  describe("importNormalizedCollections", () => {
    it("يستورد مجموعات صالحة ويُسنِد لونًا دائريًا لما لا يحمل لونًا", async () => {
      const store = installChromeStorageMock();
      const result = await importNormalizedCollections([
        { name: "من Chrome", items: [{ url: "https://a.com/", title: "A" }] },
        { name: "من ملف HTML", items: [{ url: "https://b.com/", title: "B" }] },
      ]);

      expect(result).toEqual({ importedCollections: 2, importedItems: 2, skippedItems: 0 });

      const collections = store[KEEPIT_STATE_KEY].collections;
      expect(collections).toHaveLength(2);
      // كل مجموعة استُوردت بلا حقل color حصلت على لون من الدورة، لا indigo موحَّد للجميع
      expect(collections.map((c) => c.color)).toEqual([COLOR_CYCLE[0], COLOR_CYCLE[1]]);
    });

    it("يحافظ على لون مُحدَّد مسبقًا إن وُجد (مصدر chrome-bookmarks.js يُسنِد ألوانه بنفسه)", async () => {
      const store = installChromeStorageMock();
      await importNormalizedCollections([
        { name: "بلون محدَّد", color: "rose", items: [{ url: "https://a.com/", title: "A" }] },
      ]);
      expect(store[KEEPIT_STATE_KEY].collections[0].color).toBe("rose");
    });

    it("يدمج مع تصنيف Keepit موجود بنفس الاسم بدل إنشاء تصنيف مكرَّر", async () => {
      const store = installChromeStorageMock([
        {
          id: "existing",
          name: "أدوات",
          color: "indigo",
          pinned: false,
          createdAt: 1,
          updatedAt: 1,
          items: [{ id: "e1", url: "https://existing.com/", title: "موجود أصلاً", createdAt: 1, order: 0 }],
        },
      ]);

      const result = await importNormalizedCollections([
        { name: "أدوات", items: [{ url: "https://new.com/", title: "جديد" }] },
      ]);

      expect(result.importedCollections).toBe(1);
      const collections = store[KEEPIT_STATE_KEY].collections;
      expect(collections).toHaveLength(1); // لا تكرار
      expect(collections[0].id).toBe("existing"); // المعرّف الأصلي محفوظ
      expect(collections[0].items).toHaveLength(2);
    });

    it("يرفض روابط javascript: عبر نفس تحقّق toInternalCollections الصارم (حماية أمنية جوهرية)", async () => {
      installChromeStorageMock();
      const result = await importNormalizedCollections([
        {
          name: "اختبار أمان",
          items: [
            { url: "javascript:alert(1)", title: "خبيث" },
            { url: "https://safe.example.com/", title: "آمن" },
          ],
        },
      ]);
      expect(result.importedItems).toBe(1);
      expect(result.skippedItems).toBe(1);
    });

    it("مصفوفة فارغة أو كل العناصر غير صالحة تُرجع importedCollections: 0 بلا أي كتابة", async () => {
      installChromeStorageMock();
      const result = await importNormalizedCollections([]);
      expect(result).toEqual({ importedCollections: 0, importedItems: 0, skippedItems: 0 });
      expect(globalThis.chrome.storage.local.set).not.toHaveBeenCalled();
    });

    it("لا يُكرِّر رابطًا موجودًا أصلًا عند الدمج (تحقّق من skippedItems)", async () => {
      const dup = "https://dup.example.com/";
      installChromeStorageMock([
        {
          id: "c1",
          name: "أدوات",
          color: "indigo",
          pinned: false,
          createdAt: 1,
          updatedAt: 1,
          items: [{ id: "i1", url: dup, title: "الأصل", createdAt: 1, order: 0 }],
        },
      ]);

      const result = await importNormalizedCollections([{ name: "أدوات", items: [{ url: dup, title: "مكرَّر" }] }]);
      expect(result.importedItems).toBe(0);
      expect(result.skippedItems).toBe(1);
    });

    it("يُسنِد lastUsedCollectionId فقط إن لم يكن موجودًا مسبقًا (لا يُغيِّر اختيار المستخدم الحالي)", async () => {
      const store = installChromeStorageMock([
        {
          id: "existing",
          name: "مُستخدَم حاليًا",
          color: "indigo",
          pinned: false,
          createdAt: 1,
          updatedAt: 1,
          items: [],
        },
      ]);
      store[KEEPIT_STATE_KEY].lastUsedCollectionId = "existing";

      await importNormalizedCollections([{ name: "جديد", items: [{ url: "https://x.com/", title: "X" }] }]);
      expect(store[KEEPIT_STATE_KEY].lastUsedCollectionId).toBe("existing"); // لم يتغيّر
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { readCollections, reorderItems, deleteItems, moveItems } from "./store.js";
import { KEEPIT_STATE_KEY } from "./constants.js";

/**
 * محاكاة بسيطة لـ chrome.storage.local في الذاكرة — كافية تمامًا لهذه
 * الاختبارات (قراءة/كتابة مفتاح واحد)، بلا حاجة لمكتبة محاكاة خارجية.
 */
function installChromeStorageMock(initialState) {
  /** @type {Record<string, unknown>} */
  const store = { [KEEPIT_STATE_KEY]: initialState };
  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: async (key) => ({ [key]: structuredClone(store[key]) }),
        set: async (patch) => {
          Object.assign(store, structuredClone(patch));
        },
      },
    },
  });
  return store;
}

function makeState(collections) {
  return { schemaVersion: 1, collections, lastUsedCollectionId: null };
}

function makeItem(id, order) {
  return { id, url: `https://${id}.example.com/`, title: id, createdAt: Date.now(), order };
}

describe("item-manager/store", () => {
  describe("reorderItems", () => {
    it("يعيد ترتيب العناصر ويُحدِّث حقل order ليطابق الموضع الجديد", async () => {
      installChromeStorageMock(
        makeState([{ id: "c1", name: "A", color: "indigo", pinned: false, items: [makeItem("a", 0), makeItem("b", 1), makeItem("c", 2)] }]),
      );

      const ok = await reorderItems("c1", ["c", "a", "b"]);
      expect(ok).toBe(true);

      const [col] = await readCollections();
      expect(col.items.map((it) => it.id)).toEqual(["c", "a", "b"]);
      expect(col.items.map((it) => it.order)).toEqual([0, 1, 2]);
    });

    it("لا يُسقط عنصرًا غاب سهوًا عن مصفوفة الترتيب الجديدة — يُبقيه بآخر القائمة بدل حذفه صامتًا", async () => {
      installChromeStorageMock(
        makeState([{ id: "c1", name: "A", color: "indigo", pinned: false, items: [makeItem("a", 0), makeItem("b", 1)] }]),
      );

      await reorderItems("c1", ["b"]); // "a" غائب عمدًا عن الترتيب الجديد
      const [col] = await readCollections();
      expect(col.items.map((it) => it.id)).toEqual(["b", "a"]); // "a" في الآخر، لا مفقود
    });

    it("يُرجع false لتصنيف غير موجود بدل رمي خطأ", async () => {
      installChromeStorageMock(makeState([]));
      expect(await reorderItems("لا-وجود", ["x"])).toBe(false);
    });
  });

  describe("deleteItems", () => {
    it("يحذف العناصر المحدَّدة فقط ويُبقي الباقي", async () => {
      installChromeStorageMock(
        makeState([{ id: "c1", name: "A", color: "indigo", pinned: false, items: [makeItem("a", 0), makeItem("b", 1), makeItem("c", 2)] }]),
      );

      const deletedCount = await deleteItems("c1", ["a", "c"]);
      expect(deletedCount).toBe(2);

      const [col] = await readCollections();
      expect(col.items.map((it) => it.id)).toEqual(["b"]);
    });

    it("لا يمس تصنيفات أخرى إطلاقًا", async () => {
      installChromeStorageMock(
        makeState([
          { id: "c1", name: "A", color: "indigo", pinned: false, items: [makeItem("a", 0)] },
          { id: "c2", name: "B", color: "sky", pinned: false, items: [makeItem("b", 0)] },
        ]),
      );
      await deleteItems("c1", ["a"]);
      const collections = await readCollections();
      expect(collections.find((c) => c.id === "c2").items).toHaveLength(1);
    });

    it("معرّفات غير موجودة أصلًا لا تُسبِّب أي تغيير، وتُرجع 0", async () => {
      installChromeStorageMock(makeState([{ id: "c1", name: "A", color: "indigo", pinned: false, items: [makeItem("a", 0)] }]));
      expect(await deleteItems("c1", ["لا-وجود"])).toBe(0);
      const [col] = await readCollections();
      expect(col.items).toHaveLength(1);
    });
  });

  describe("moveItems", () => {
    it("ينقل العناصر المحدَّدة من المصدر للهدف", async () => {
      installChromeStorageMock(
        makeState([
          { id: "src", name: "من", color: "indigo", pinned: false, items: [makeItem("a", 0), makeItem("b", 1)] },
          { id: "dst", name: "إلى", color: "sky", pinned: false, items: [] },
        ]),
      );

      const movedCount = await moveItems("src", "dst", ["a"]);
      expect(movedCount).toBe(1);

      const collections = await readCollections();
      expect(collections.find((c) => c.id === "src").items.map((it) => it.id)).toEqual(["b"]);
      expect(collections.find((c) => c.id === "dst").items.map((it) => it.id)).toEqual(["a"]);
    });

    it("يُرقِّم order في الهدف تصاعديًا بدءًا من نهاية عناصره الحالية (لا يُصفِّر أو يتعارض)", async () => {
      installChromeStorageMock(
        makeState([
          { id: "src", name: "من", color: "indigo", pinned: false, items: [makeItem("new", 0)] },
          { id: "dst", name: "إلى", color: "sky", pinned: false, items: [makeItem("existing", 0)] },
        ]),
      );

      await moveItems("src", "dst", ["new"]);
      const [, dst] = await readCollections();
      const moved = dst.items.find((it) => it.id === "new");
      expect(moved.order).toBe(1); // بعد existing (order: 0)، لا يتصادم معه
    });

    it("النقل لنفس التصنيف (مصدر = هدف) عملية لا-تأثير (no-op) صريحة", async () => {
      installChromeStorageMock(makeState([{ id: "c1", name: "A", color: "indigo", pinned: false, items: [makeItem("a", 0)] }]));
      expect(await moveItems("c1", "c1", ["a"])).toBe(0);
    });

    it("تصنيف هدف غير موجود يُرجع 0 بلا أي تعديل على المصدر", async () => {
      installChromeStorageMock(makeState([{ id: "c1", name: "A", color: "indigo", pinned: false, items: [makeItem("a", 0)] }]));
      expect(await moveItems("c1", "لا-وجود", ["a"])).toBe(0);
      const [col] = await readCollections();
      expect(col.items).toHaveLength(1); // لم يُنقَل شيء فعليًا
    });
  });
});

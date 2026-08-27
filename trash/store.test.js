import { describe, it, expect, beforeEach } from "vitest";
import "../shared/dedup.js"; // يُلحق globalThis.KeepitDedup — تعتمد عليه دوال الاستعادة مباشرة
import { KEEPIT_STATE_KEY, TRASH_KEY } from "./constants.js";
import {
  readTrashEntries,
  restoreCollectionEntry,
  restoreItemEntry,
  deleteEntryPermanently,
  emptyTrash,
  restoreEntry,
} from "./store.js";

function installChromeStorageMock(initial) {
  const store = { ...initial };
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

function col(id, name, items = [], overrides = {}) {
  return { id, name, color: "indigo", pinned: false, createdAt: 1, updatedAt: 1, items, ...overrides };
}
function item(id, url) {
  return { id, url: url ?? `https://${id}.example.com/`, title: id, createdAt: 1, order: 0 };
}
function trashCollectionEntry(id, collection, deletedAt = 1) {
  return { id, deletedAt, kind: "collection", collection };
}
function trashItemEntry(id, itemObj, sourceCollection, deletedAt = 1) {
  return { id, deletedAt, kind: "item", item: itemObj, sourceCollection };
}

describe("trash/store", () => {
  let store;
  beforeEach(() => {
    store = installChromeStorageMock({
      [KEEPIT_STATE_KEY]: { schemaVersion: 1, collections: [], lastUsedCollectionId: null },
      [TRASH_KEY]: { entries: [] },
    });
  });

  describe("readTrashEntries", () => {
    it("يرتّب الإدخالات من الأحدث حذفًا للأقدم", async () => {
      store[TRASH_KEY] = {
        entries: [
          trashCollectionEntry("e1", col("c1", "قديم"), 100),
          trashCollectionEntry("e2", col("c2", "أحدث"), 300),
          trashCollectionEntry("e3", col("c3", "وسط"), 200),
        ],
      };
      const entries = await readTrashEntries();
      expect(entries.map((e) => e.id)).toEqual(["e2", "e3", "e1"]);
    });

    it("مفتاح تخزين فارغ (أول استخدام) يُرجع مصفوفة فارغة بلا خطأ", async () => {
      delete store[TRASH_KEY];
      expect(await readTrashEntries()).toEqual([]);
    });
  });

  describe("restoreCollectionEntry", () => {
    it("يستعيد تصنيفًا لا يتعارض اسمه مع أي شيء موجود", async () => {
      const restored = col("c1", "مستعاد", [item("i1")]);
      store[TRASH_KEY] = { entries: [trashCollectionEntry("e1", restored)] };

      const result = await restoreCollectionEntry("e1");
      expect(result).toEqual({ ok: true, mergedIntoExisting: false });

      const state = store[KEEPIT_STATE_KEY];
      expect(state.collections.map((c) => c.name)).toEqual(["مستعاد"]);
      expect(store[TRASH_KEY].entries).toEqual([]); // الإدخال حُذف من السلة بعد الاستعادة
    });

    it("يدمج مع تصنيف موجود بنفس الاسم بدل إنشاء تصنيف مكرَّر", async () => {
      store[KEEPIT_STATE_KEY] = {
        schemaVersion: 1,
        collections: [col("existing", "أدوات", [item("existing-item")])],
        lastUsedCollectionId: null,
      };
      const restored = col("c1", "أدوات", [item("i1")]);
      store[TRASH_KEY] = { entries: [trashCollectionEntry("e1", restored)] };

      const result = await restoreCollectionEntry("e1");
      expect(result).toEqual({ ok: true, mergedIntoExisting: true });

      const state = store[KEEPIT_STATE_KEY];
      expect(state.collections).toHaveLength(1); // لا تكرار
      expect(state.collections[0].id).toBe("existing"); // المعرّف الأصلي محفوظ
      expect(state.collections[0].items.map((i) => i.id).sort()).toEqual(["existing-item", "i1"]);
    });

    it("معرّف إدخال غير موجود يُرجع ok:false بلا أي تعديل على الحالة", async () => {
      const result = await restoreCollectionEntry("لا-وجود");
      expect(result).toEqual({ ok: false, mergedIntoExisting: false });
    });
  });

  describe("restoreItemEntry", () => {
    it("يستعيد الموقع لتصنيفه الأصلي إن كان لا يزال موجودًا بنفس المعرّف", async () => {
      store[KEEPIT_STATE_KEY] = {
        schemaVersion: 1,
        collections: [col("c1", "موجود", [item("stays")])],
        lastUsedCollectionId: null,
      };
      const restoredItem = item("restored-item");
      store[TRASH_KEY] = {
        entries: [trashItemEntry("e1", restoredItem, { id: "c1", name: "موجود", color: "indigo" })],
      };

      const result = await restoreItemEntry("e1");
      expect(result).toEqual({ ok: true, alreadyExists: false, recreatedCollection: false });

      const state = store[KEEPIT_STATE_KEY];
      expect(state.collections).toHaveLength(1);
      expect(state.collections[0].items.map((i) => i.id).sort()).toEqual(["restored-item", "stays"]);
    });

    it("يُعيد إنشاء التصنيف بنفس الاسم/اللون إن كان قد حُذف هو الآخر لاحقًا", async () => {
      store[TRASH_KEY] = {
        entries: [trashItemEntry("e1", item("orphan-item"), { id: "c1", name: "مُعاد إنشاؤه", color: "rose" })],
      };

      const result = await restoreItemEntry("e1");
      expect(result.ok).toBe(true);
      expect(result.recreatedCollection).toBe(true);

      const state = store[KEEPIT_STATE_KEY];
      expect(state.collections).toHaveLength(1);
      expect(state.collections[0].name).toBe("مُعاد إنشاؤه");
      expect(state.collections[0].color).toBe("rose");
      expect(state.collections[0].items.map((i) => i.id)).toEqual(["orphan-item"]);
    });

    it("لا يُكرِّر الموقع إن وُجد بالفعل رابط أو عنوان مطابق في وجهة الاستعادة", async () => {
      const duplicateUrl = "https://same.example.com/";
      store[KEEPIT_STATE_KEY] = {
        schemaVersion: 1,
        collections: [col("c1", "موجود", [item("existing-dup", duplicateUrl)])],
        lastUsedCollectionId: null,
      };
      store[TRASH_KEY] = {
        entries: [
          trashItemEntry("e1", item("restored-dup", duplicateUrl), { id: "c1", name: "موجود", color: "indigo" }),
        ],
      };

      const result = await restoreItemEntry("e1");
      expect(result).toEqual({ ok: true, alreadyExists: true, recreatedCollection: false });

      const state = store[KEEPIT_STATE_KEY];
      expect(state.collections[0].items).toHaveLength(1); // لم يُضَف الموقع المكرَّر
      expect(store[TRASH_KEY].entries).toEqual([]); // مع ذلك، الإدخال نفسه يُحذَف من السلة
    });
  });

  describe("deleteEntryPermanently / emptyTrash", () => {
    it("يحذف إدخالًا واحدًا بمعرّفه فقط، يُبقي الباقي", async () => {
      store[TRASH_KEY] = {
        entries: [trashCollectionEntry("e1", col("c1", "أ")), trashCollectionEntry("e2", col("c2", "ب"))],
      };
      await deleteEntryPermanently("e1");
      expect(store[TRASH_KEY].entries.map((e) => e.id)).toEqual(["e2"]);
    });

    it("emptyTrash يُفرِغ كل الإدخالات دفعة واحدة", async () => {
      store[TRASH_KEY] = {
        entries: [trashCollectionEntry("e1", col("c1", "أ")), trashCollectionEntry("e2", col("c2", "ب"))],
      };
      await emptyTrash();
      expect(store[TRASH_KEY].entries).toEqual([]);
    });
  });

  describe("restoreEntry (التوجيه التلقائي)", () => {
    it("يوجّه لـ restoreCollectionEntry لإدخال بنوع collection", async () => {
      store[TRASH_KEY] = { entries: [trashCollectionEntry("e1", col("c1", "أ"))] };
      const result = await restoreEntry({ id: "e1", kind: "collection" });
      expect(result).toHaveProperty("mergedIntoExisting");
    });

    it("يوجّه لـ restoreItemEntry لإدخال بنوع item", async () => {
      store[TRASH_KEY] = {
        entries: [trashItemEntry("e1", item("i1"), { id: "c1", name: "أ", color: "indigo" })],
      };
      const result = await restoreEntry({ id: "e1", kind: "item" });
      expect(result).toHaveProperty("alreadyExists");
    });
  });
});

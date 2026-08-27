import { describe, it, expect } from "vitest";
import { readCollectionById } from "./store.js";
import { KEEPIT_STATE_KEY } from "./constants.js";

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
function item(id, order) {
  return { id, url: `https://${id}.example.com/`, title: id, createdAt: 1, order };
}

describe("readCollectionById", () => {
  it("يقرأ تصنيفًا موجودًا بمعرّفه، مرتَّبًا حسب order", async () => {
    installChromeStorageMock({
      schemaVersion: 1,
      collections: [col("c1", "أدوات", [item("c", 2), item("a", 0), item("b", 1)])],
      lastUsedCollectionId: null,
    });
    const result = await readCollectionById("c1");
    expect(result.name).toBe("أدوات");
    expect(result.items.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("يُرجع null لمعرّف تصنيف غير موجود", async () => {
    installChromeStorageMock({ schemaVersion: 1, collections: [], lastUsedCollectionId: null });
    expect(await readCollectionById("لا-وجود")).toBeNull();
  });

  it("يُرجع null فورًا لمعرّف فارغ بلا أي قراءة تخزين", async () => {
    let getCalled = false;
    globalThis.chrome = /** @type {any} */ ({
      storage: { local: { get: async () => { getCalled = true; return {}; } } },
    });
    expect(await readCollectionById("")).toBeNull();
    expect(getCalled).toBe(false);
  });

  it("عناصر بلا order صالح تُعامَل كـ 0 (لا تُسقَط ولا تُكسِّر الفرز)", async () => {
    installChromeStorageMock({
      schemaVersion: 1,
      collections: [col("c1", "أدوات", [item("has-order", 5), { ...item("no-order", undefined), order: undefined }])],
      lastUsedCollectionId: null,
    });
    const result = await readCollectionById("c1");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe("no-order"); // 0 (افتراضي) يسبق 5
  });

  it("لا يُعدِّل مصفوفة عناصر الحالة الأصلية عند الفرز (نسخة مستقلة)", async () => {
    const original = [item("z", 1), item("a", 0)];
    installChromeStorageMock({
      schemaVersion: 1,
      collections: [col("c1", "أدوات", original)],
      lastUsedCollectionId: null,
    });
    await readCollectionById("c1");
    expect(original.map((i) => i.id)).toEqual(["z", "a"]); // الأصل لم يتغيّر ترتيبه
  });
});

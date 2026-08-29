import { beforeEach, describe, expect, it, vi } from "vitest";
import { orderCollectionsByIds, saveCollectionOrder, KEEPIT_STATE_KEY } from "./collection-order-store.js";

function collection(id) {
  return { id, name: id, color: "indigo", pinned: false, createdAt: 1, updatedAt: 1, items: [] };
}

function installStorage(initialState) {
  const store = { [KEEPIT_STATE_KEY]: structuredClone(initialState) };
  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: vi.fn(async (key) => ({ [key]: structuredClone(store[key]) })),
        set: vi.fn(async (patch) => Object.assign(store, structuredClone(patch))),
      },
    },
  });
  return store;
}

describe("orderCollectionsByIds", () => {
  it("يعيد ترتيب المجموعات حسب المعرفات المطلوبة", () => {
    const input = [collection("a"), collection("b"), collection("c")];
    expect(orderCollectionsByIds(input, ["c", "a", "b"]).map((item) => item.id)).toEqual(["c", "a", "b"]);
  });

  it("يتجاهل المعرفات المكررة أو غير الموجودة ويحافظ على المجموعات غير المذكورة", () => {
    const input = [collection("a"), collection("b"), collection("c")];
    expect(orderCollectionsByIds(input, ["b", "b", "غير-موجود"]).map((item) => item.id)).toEqual(["b", "a", "c"]);
  });

  it("لا يفقد البيانات غير الصالحة عند إعادة ترتيب بيانات قديمة مشوهة", () => {
    const malformed = /** @type {any} */ ({ name: "بدون معرف" });
    const input = [collection("a"), malformed, collection("b")];
    expect(orderCollectionsByIds(input, ["b", "a"])).toEqual([collection("b"), collection("a"), malformed]);
  });
});

describe("saveCollectionOrder", () => {
  beforeEach(() => vi.clearAllMocks());

  it("يحفظ ترتيب المصفوفة الجديد في chrome.storage.local", async () => {
    const store = installStorage({
      schemaVersion: 1,
      collections: [collection("a"), collection("b"), collection("c")],
      lastUsedCollectionId: "a",
    });

    await expect(saveCollectionOrder(["c", "a", "b"])).resolves.toBe(true);
    expect(store[KEEPIT_STATE_KEY].collections.map((item) => item.id)).toEqual(["c", "a", "b"]);
    expect(store[KEEPIT_STATE_KEY].lastUsedCollectionId).toBe("a");
  });

  it("لا يكتب عند عدم تغيّر الترتيب", async () => {
    installStorage({
      schemaVersion: 1,
      collections: [collection("a"), collection("b")],
      lastUsedCollectionId: null,
    });

    await expect(saveCollectionOrder(["a", "b"])).resolves.toBe(false);
    expect(globalThis.chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it("يبقي أي مجموعة وصلت بالتزامن ولا يكتب فوقها", async () => {
    const original = {
      schemaVersion: 1,
      collections: [collection("a"), collection("b")],
      lastUsedCollectionId: null,
    };
    const incoming = {
      schemaVersion: 1,
      collections: [collection("a"), collection("b"), collection("new")],
      lastUsedCollectionId: null,
    };
    const store = { [KEEPIT_STATE_KEY]: structuredClone(original) };
    let reads = 0;
    globalThis.chrome = /** @type {any} */ ({
      storage: {
        local: {
          get: vi.fn(async (key) => {
            reads += 1;
            if (reads === 2) store[KEEPIT_STATE_KEY] = structuredClone(incoming);
            return { [key]: structuredClone(store[key]) };
          }),
          set: vi.fn(async (patch) => Object.assign(store, structuredClone(patch))),
        },
      },
    });

    await expect(saveCollectionOrder(["b", "a"])).resolves.toBe(true);
    expect(store[KEEPIT_STATE_KEY].collections.map((item) => item.id)).toEqual(["b", "a", "new"]);
  });
});

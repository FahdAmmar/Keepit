import { describe, expect, it, vi } from "vitest";
import { KEEPIT_STATE_KEY } from "./collection-order-store.js";
import { COLLECTION_VIEW_KEY } from "./collection-view.js";

// انتكاسة سابقة: كان collection-reorder.js يفرض ترتيب المصفوفة الخام دائمًا،
// بلا أي وعي بنمط الفرز المختار في collection-view-ui.js. عند اختيار أي نمط
// غير "يدوي" كانت الوحدتان تتصارعان على ترتيب الصفوف: كل مرة تعيد إحداهما
// الترتيب لطريقتها، تُعيد الأخرى ترتيبه لطريقتها هي — حلقة لا نهائية من
// إعادة الترتيب تظهر للمستخدم كوميض مستمر في قائمة المجموعات.

function collection(id, name) {
  return { id, name, color: "indigo", pinned: false, createdAt: 1, updatedAt: 1, items: [] };
}

function installStorage({ collections, sortMode }) {
  const store = {
    [KEEPIT_STATE_KEY]: { schemaVersion: 1, collections, lastUsedCollectionId: null },
    [COLLECTION_VIEW_KEY]: { sortMode },
  };
  const listeners = [];
  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: vi.fn(async (keys) => {
          const list = Array.isArray(keys) ? keys : [keys];
          return Object.fromEntries(list.map((k) => [k, structuredClone(store[k])]));
        }),
      },
      onChanged: { addListener: (fn) => listeners.push(fn), removeListener: () => {} },
    },
  });
  return store;
}

function makeRow(name) {
  const row = document.createElement("div");
  row.className = "collection-row";
  const label = document.createElement("span");
  label.className = "collection-row__name";
  label.textContent = name;
  row.append(label);
  return row;
}

async function withCapturedObservers(run) {
  const RealMutationObserver = globalThis.MutationObserver;
  const created = [];
  globalThis.MutationObserver = class extends RealMutationObserver {
    constructor(callback) {
      super(callback);
      created.push(this);
    }
  };
  try {
    await run();
  } finally {
    for (const observer of created) observer.disconnect();
    globalThis.MutationObserver = RealMutationObserver;
  }
}

describe("collection-reorder.js يحترم نمط الفرز المختار", () => {
  it("لا يعيد ترتيب الصفوف عندما يكون نمط الفرز غير يدوي", async () => {
    document.body.innerHTML = `<div class="collection-list"></div>`;
    const list = document.querySelector(".collection-list");
    // ترتيب الصفوف في DOM يخالف عمدًا ترتيب المصفوفة الخام، تمامًا كما
    // يفعل collection-view-ui.js بعد تطبيق نمط فرز غير يدوي.
    list.append(makeRow("Mango"), makeRow("Apple"), makeRow("Zebra"));

    installStorage({
      collections: [collection("z", "Zebra"), collection("a", "Apple"), collection("m", "Mango")],
      sortMode: "newest",
    });

    await withCapturedObservers(async () => {
      await import("./collection-reorder.js");
      await new Promise((resolve) => setTimeout(resolve, 20));
      const names = Array.from(list.querySelectorAll(".collection-row__name")).map((el) => el.textContent);
      // يجب أن يبقى ترتيب "الأحدث أولًا" كما هو، لا أن يُعاد للترتيب الخام
      expect(names).toEqual(["Mango", "Apple", "Zebra"]);
    });
  });

  it("يعيد ترتيب الصفوف للترتيب اليدوي عندما يكون هو النمط المختار", async () => {
    document.body.innerHTML = `<div class="collection-list"></div>`;
    const list = document.querySelector(".collection-list");
    list.append(makeRow("Mango"), makeRow("Apple"), makeRow("Zebra"));

    installStorage({
      collections: [collection("z", "Zebra"), collection("a", "Apple"), collection("m", "Mango")],
      sortMode: "manual",
    });

    await withCapturedObservers(async () => {
      await import("./collection-reorder.js?manual"); // معامل وهمي لتفادي ذاكرة استيراد الوحدة من الاختبار الأول
      await new Promise((resolve) => setTimeout(resolve, 20));
      const names = Array.from(list.querySelectorAll(".collection-row__name")).map((el) => el.textContent);
      expect(names).toEqual(["Zebra", "Apple", "Mango"]);
    });
  });
});

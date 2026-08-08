import { describe, it, expect, vi, beforeEach } from "vitest";
import "../shared/dedup.js"; // يُلحق globalThis.KeepitDedup — تعتمد عليه مباشرة merge-pull.js
import { KEEPIT_STATE_KEY } from "./constants.js";

// نُحاكي reader.js فقط (طبقة I/O الفعلية عبر File System Access API غير
// متاحة في بيئة الاختبار أصلًا) — كل شيء آخر (الدمج، التحقق، المقارنة)
// منطق حقيقي غير مُحاكى.
vi.mock("./reader.js", () => ({
  readStateFromLocalFolder: vi.fn(),
}));

const { readStateFromLocalFolder } = await import("./reader.js");
const { pullFromLocalFolder } = await import("./merge-pull.js");

function makeState(collections) {
  return { schemaVersion: 1, collections, lastUsedCollectionId: collections[0]?.id ?? null };
}

function col(id, name, items = []) {
  return { id, name, color: "indigo", pinned: false, createdAt: 1, updatedAt: 1, items };
}

/**
 * محاكاة chrome.storage.local تتيح "حقن" كتابة متزامنة من سياق آخر عند
 * استدعاء get() رقم معيَّن — تحديدًا لاختبار الحماية من السباق.
 */
function installChromeStorageMock(initialState, { injectConcurrentWriteOnCallNumber, concurrentState } = {}) {
  const store = { [KEEPIT_STATE_KEY]: initialState };
  let getCallCount = 0;

  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: vi.fn(async (key) => {
          getCallCount += 1;
          if (injectConcurrentWriteOnCallNumber && getCallCount === injectConcurrentWriteOnCallNumber) {
            store[KEEPIT_STATE_KEY] = concurrentState; // "شخص آخر" كتب للتو، قبل أن نقرأ نحن هذه القراءة
          }
          return { [key]: structuredClone(store[key]) };
        }),
        set: vi.fn(async (patch) => {
          Object.assign(store, structuredClone(patch));
        }),
      },
    },
  });

  return { store, getCallCountRef: () => getCallCount };
}

describe("pullFromLocalFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("لا يفعل شيئًا إن لم يوجد ملف بعد على القرص", async () => {
    installChromeStorageMock(makeState([]));
    readStateFromLocalFolder.mockResolvedValue({ ok: true, collections: null });

    const result = await pullFromLocalFolder({ fileName: "keepit.json", mode: "merge" });
    expect(result).toEqual({ ok: true, changed: false });
  });

  it("يدمج محتوى الملف في الحالة المحلية في السيناريو العادي (بلا أي تزامن)", async () => {
    const { store } = installChromeStorageMock(makeState([col("local-1", "محلي")]));
    readStateFromLocalFolder.mockResolvedValue({
      ok: true,
      collections: [{ name: "من الملف", color: "sky", items: [{ url: "https://x.com/", title: "X" }] }],
    });

    const result = await pullFromLocalFolder({ fileName: "keepit.json", mode: "merge" });
    expect(result.ok).toBe(true);
    expect(result.changed).toBe(true);

    const names = store[KEEPIT_STATE_KEY].collections.map((c) => c.name).sort();
    expect(names).toEqual(["محلي", "من الملف"]);
  });

  it("لا يكتب شيئًا إن كان محتوى الملف مطابقًا تمامًا لما لدينا محليًا أصلًا", async () => {
    const localCollections = [col("c1", "متطابق", [{ id: "i1", url: "https://x.com/", title: "X", createdAt: 1, order: 0 }])];
    installChromeStorageMock(makeState(localCollections));
    readStateFromLocalFolder.mockResolvedValue({
      ok: true,
      collections: [{ name: "متطابق", color: "indigo", pinned: false, items: [{ url: "https://x.com/", title: "X" }] }],
    });

    const result = await pullFromLocalFolder({ fileName: "keepit.json", mode: "merge" });
    expect(result).toEqual({ ok: true, changed: false });
    expect(globalThis.chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it(
    "السباق الحقيقي المُصلَح هالجلسة: كتابة متزامنة تصل بين القراءة الأولى والكتابة النهائية " +
      "لا تُفقَد — يُعاد حساب الدمج من الحالة الجديدة بدل الكتابة فوقها",
    async () => {
      // الحالة عند بداية عملية السحب: تصنيف واحد فقط.
      const stateAtPullStart = makeState([col("old", "قديم")]);
      // "شخص آخر" (مثلًا popup) يضيف تصنيفًا جديدًا في اللحظة نفسها تقريبًا.
      const stateAfterConcurrentWrite = makeState([col("old", "قديم"), col("concurrent", "أُضيف بالتزامن")]);

      // استدعاءات get() المتوقَّعة داخل حلقة المحاولة الواحدة: 1) القراءة
      // الأولى للحساب، 2) "التحقق التفاؤلي" مباشرة قبل الكتابة. نحقن
      // الكتابة المتزامنة عند الاستدعاء الثاني تحديدًا (بعد القراءة الأولى،
      // قبل إتمام الكتابة) — أدق سيناريو ممكن لمحاكاة السباق الفعلي.
      const { store, getCallCountRef } = installChromeStorageMock(stateAtPullStart, {
        injectConcurrentWriteOnCallNumber: 2,
        concurrentState: stateAfterConcurrentWrite,
      });

      readStateFromLocalFolder.mockResolvedValue({
        ok: true,
        collections: [{ name: "من الملف", color: "rose", items: [] }],
      });

      const result = await pullFromLocalFolder({ fileName: "keepit.json", mode: "merge" });
      expect(result.ok).toBe(true);
      expect(result.changed).toBe(true);

      const finalNames = store[KEEPIT_STATE_KEY].collections.map((c) => c.name).sort();
      // الثلاثة معًا يجب أن يكونوا موجودين: القديم، المُضاف بالتزامن (لولا
      // الإصلاح لكان اختفى هنا بالضبط)، ومن الملف.
      expect(finalNames).toEqual(["أُضيف بالتزامن", "قديم", "من الملف"].sort());

      // تأكيد إضافي إن الحلقة فعلًا أعادت المحاولة (أكثر من قراءتين) لا أنها
      // كتبت بلا وعي بالتغيّر.
      expect(getCallCountRef()).toBeGreaterThan(2);
    },
  );

  it("وضع الاستبدال (replace) يتجاهل التصنيفات المحلية غير الموجودة في الملف كما هو مُوثَّق ومقصود", async () => {
    installChromeStorageMock(makeState([col("will-be-replaced", "سيُستبدَل")]));
    readStateFromLocalFolder.mockResolvedValue({
      ok: true,
      collections: [{ name: "من الملف فقط", color: "sky", items: [] }],
    });

    const result = await pullFromLocalFolder({ fileName: "keepit.json", mode: "replace" });
    expect(result.ok).toBe(true);
    const { store } = { store: globalThis.chrome.storage.local.set.mock.calls.at(-1)[0] };
    expect(store[KEEPIT_STATE_KEY].collections.map((c) => c.name)).toEqual(["من الملف فقط"]);
  });
});

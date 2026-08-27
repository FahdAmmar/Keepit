import { describe, it, expect, vi, beforeEach } from "vitest";
import { writeStateOptimistically } from "./optimistic-state-write.js";

const KEY = "test:key";

function installChromeStorageMock(initialValue, { injectConcurrentWriteOnCallNumber, concurrentValue } = {}) {
  const store = { [KEY]: initialValue };
  let getCallCount = 0;

  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: vi.fn(async (key) => {
          getCallCount += 1;
          if (injectConcurrentWriteOnCallNumber && getCallCount === injectConcurrentWriteOnCallNumber) {
            store[KEY] = concurrentValue;
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

describe("writeStateOptimistically", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يكتب بأمان في الحالة العادية (بلا أي تزامن)", async () => {
    const { store } = installChromeStorageMock({ items: ["a"] });
    const result = await writeStateOptimistically(KEY, (current) => ({ items: [...current.items, "b"] }), {
      items: [],
    });
    expect(result.written).toBe(true);
    expect(store[KEY]).toEqual({ items: ["a", "b"] });
  });

  it("لا يكتب شيئًا إن كانت mutate لا تُغيِّر المحتوى فعليًا (تجنّب كتابة لا طائل منها)", async () => {
    installChromeStorageMock({ items: ["a"] });
    const result = await writeStateOptimistically(KEY, (current) => current, { items: [] });
    expect(result.written).toBe(false);
    expect(globalThis.chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it("يستخدم defaultValue إن كان المفتاح فارغًا (أول استخدام)", async () => {
    installChromeStorageMock(undefined);
    const result = await writeStateOptimistically(KEY, (current) => ({ items: [...current.items, "أول"] }), {
      items: [],
    });
    expect(result.value).toEqual({ items: ["أول"] });
  });

  it(
    "السباق الحقيقي: كتابة متزامنة تصل بين القراءة الأولى والتحقق قبل الكتابة " +
      "لا تُفقَد — يُعاد حساب mutate من الحالة الجديدة بدل الكتابة فوقها",
    async () => {
      const before = { items: ["قديم"] };
      const concurrent = { items: ["قديم", "أُضيف بالتزامن"] };
      const { store, getCallCountRef } = installChromeStorageMock(before, {
        injectConcurrentWriteOnCallNumber: 2, // بعد القراءة الأولى، قبل التحقق الثاني
        concurrentValue: concurrent,
      });

      const result = await writeStateOptimistically(KEY, (current) => ({ items: [...current.items, "جديد"] }), {
        items: [],
      });

      expect(result.written).toBe(true);
      // النتيجة النهائية يجب أن تحتوي الثلاثة معًا: القديم، المُضاف بالتزامن
      // (لولا الإصلاح لكان اختفى هنا بالضبط)، والجديد.
      expect(store[KEY].items.sort()).toEqual(["أُضيف بالتزامن", "جديد", "قديم"].sort());
      expect(getCallCountRef()).toBeGreaterThan(2); // تأكيد إن إعادة محاولة فعلية حصلت
    },
  );

  it("يتوقف بصمت بعد استنفاد كل المحاولات بلا رمي خطأ (تزامن كثيف غير واقعي)", async () => {
    let callCount = 0;
    globalThis.chrome = /** @type {any} */ ({
      storage: {
        local: {
          // كل قراءة تُرجع قيمة مختلفة عن سابقتها — يضمن عدم استقرار الحالة أبدًا
          get: vi.fn(async (key) => {
            callCount += 1;
            return { [key]: { items: [callCount] } };
          }),
          set: vi.fn(async () => {}),
        },
      },
    });

    const result = await writeStateOptimistically(KEY, (current) => ({ items: [...current.items, "x"] }), {
      items: [],
    });
    expect(result.written).toBe(false);
    expect(globalThis.chrome.storage.local.set).not.toHaveBeenCalled();
  });
});

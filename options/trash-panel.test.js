import { afterEach, describe, expect, it, vi } from "vitest";

// انتكاسة سابقة: reattachIfDetached() كانت تُستدعى فقط عند تغيّر
// keepit:locale، بافتراض أن شريط الأدوات لا يُعاد بناؤه إلا عند تبديل
// اللغة. لكن options/main.js يستخدم نفس دالة عرض الشريط لتبديل الوضع
// الليلي/النهاري أيضًا (لعرض أيقونة شمس/قمر صحيحة)، فيُعاد بناء الشريط
// بالكامل عند تبديل الثيم أيضًا — وبلا معالجة keepit:theme هنا، تبقى
// أيقونة سلة المحذوفات (وبقية اللوحات) مفقودة حتى إعادة تحميل الصفحة.

function makeChromeStorageMock() {
  const store = { "keepit:locale": "ar", "keepit:theme": "dark", "keepit:trash": { entries: [] } };
  const listeners = [];
  return {
    local: {
      get: vi.fn((keys, cb) => {
        const list = Array.isArray(keys) ? keys : [keys];
        const result = Object.fromEntries(list.map((k) => [k, store[k]]));
        if (cb) return void setTimeout(() => cb(result), 0);
        return Promise.resolve(result);
      }),
    },
    onChanged: {
      addListener: (fn) => listeners.push(fn),
      removeListener: () => {},
      _fire: (changes) => listeners.forEach((fn) => fn(changes, "local")),
    },
  };
}

/** يحاكي بالضبط ما تفعله options/main.js عند تبديل الثيم أو اللغة: تبني
 *  عنصر .options__topbar-actions جديدًا بالكامل وتستبدل القديم به. */
function rebuildTopbar(oldContainer) {
  const fresh = document.createElement("div");
  fresh.className = "options__topbar-actions";
  oldContainer.replaceWith(fresh);
  return fresh;
}

describe("options/trash-panel.js يعيد إلحاق أيقونته بعد إعادة بناء الشريط", () => {
  afterEach(() => {
    delete globalThis.chrome;
    delete globalThis.KeepitOpenTrashPanel;
    vi.resetModules();
  });

  it("لا تختفي الأيقونة دائمًا عند تبديل الوضع الليلي/النهاري", async () => {
    document.body.innerHTML = `<div class="options__topbar-actions"></div>`;
    globalThis.chrome = { storage: makeChromeStorageMock() };

    await import("./trash-panel.js");
    await new Promise((resolve) => setTimeout(resolve, 20));

    let container = document.querySelector(".options__topbar-actions");
    expect(container.querySelector("button")).not.toBeNull();

    container = rebuildTopbar(container);
    expect(container.querySelector("button")).toBeNull(); // فُقدت مؤقتًا، كما في التطبيق الحقيقي

    globalThis.chrome.storage.onChanged._fire({ "keepit:theme": { oldValue: "dark", newValue: "light" } });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(container.querySelector("button")).not.toBeNull();
  });
});

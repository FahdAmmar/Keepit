import { describe, expect, it, vi } from "vitest";

/**
 * لا نختبر هنا سحب الفأرة فعليًا: jsdom لا يحسب تخطيطًا حقيقيًا
 * (getBoundingClientRect يُرجع أصفارًا دائمًا)، فقياس المسافات أثناء السحب
 * غير قابل للاختبار بمعزل عن متصفح حقيقي. نغطي بدلاً من ذلك ما هو فعليًا
 * قابل للاختبار بشكل موثوق: التطبيق الأولي للعرض المحفوظ، التقييد ضمن
 * الحدود، والتحكم عبر لوحة المفاتيح (المسار البديل الكامل لإمكانية الوصول).
 */

function installStorage(initial = {}) {
  const store = { ...initial };
  const setCalls = [];
  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: vi.fn(async (keys) => {
          const list = Array.isArray(keys) ? keys : [keys];
          return Object.fromEntries(list.map((k) => [k, store[k]]));
        }),
        set: vi.fn(async (values) => {
          Object.assign(store, values);
          setCalls.push(values);
        }),
      },
      onChanged: { addListener: () => {} },
    },
  });
  return { store, setCalls };
}

function setupDom() {
  document.body.innerHTML = `<div class="options__body"><aside class="options__sidebar"></aside></div>`;
  return document.querySelector(".options__sidebar");
}

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 20));
}

describe("shared/sidebar-resize.js", () => {
  it("يطبّق العرض المحفوظ ويُدرج مقبضًا متاحًا للوصول مباشرة بعد الشريط الجانبي", async () => {
    const sidebarEl = setupDom();
    installStorage({ "keepit:sidebarWidth": 400 });

    await import("./sidebar-resize.js?width-400");
    await settle();

    expect(document.documentElement.style.getPropertyValue("--keepit-sidebar-width")).toBe("400px");

    const handle = sidebarEl.nextElementSibling;
    expect(handle.className).toBe("sidebar-resize-handle");
    expect(handle.getAttribute("role")).toBe("separator");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.getAttribute("aria-valuenow")).toBe("400");
    expect(handle.tabIndex).toBe(0);
  });

  it("يستخدم عرضًا افتراضيًا معقولًا عند عدم وجود قيمة محفوظة، ويقيّد القيم الخارجة عن الحدود", async () => {
    setupDom();
    installStorage({ "keepit:sidebarWidth": 9999 }); // أكبر بكثير من الحد الأقصى المسموح

    await import("./sidebar-resize.js?width-clamped");
    await settle();

    // 560 هو الحد الأقصى الموثّق في الوحدة؛ أي قيمة فوقه يجب أن تُقيَّد إليه لا أن تُطبَّق كما هي
    expect(document.documentElement.style.getPropertyValue("--keepit-sidebar-width")).toBe("560px");
  });

  it("تتحكم أسهم لوحة المفاتيح بالعرض وتحفظ كل تغيير", async () => {
    const sidebarEl = setupDom();
    const { setCalls } = installStorage({}); // لا قيمة محفوظة، يبدأ من الافتراضي 300

    await import("./sidebar-resize.js?keyboard");
    await settle();

    const handle = sidebarEl.nextElementSibling;

    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("324"); // 300 + خطوة 24
    expect(setCalls.at(-1)).toEqual({ "keepit:sidebarWidth": 324 });

    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("300");

    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("560");
    expect(setCalls.at(-1)).toEqual({ "keepit:sidebarWidth": 560 });

    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(handle.getAttribute("aria-valuenow")).toBe("220");
  });
});

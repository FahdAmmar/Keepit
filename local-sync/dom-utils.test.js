import { afterEach, describe, expect, it } from "vitest";
import { keepAttached } from "./dom-utils.js";

// انتكاسة سابقة: كان الإصلاح الأول يعتمد على معالج chrome.storage.onChanged
// لإعادة إلحاق زر اللوحة بعد إعادة بناء شريط الأدوات. تحقّقنا في متصفح
// Chromium حقيقي أن هذا الافتراض خاطئ: حدث storage.onChanged يصل إلى نفس
// الصفحة التي كتبت القيمة *قبل* أن تنتهي إعادة بناء الشريط، لا بعده — فلا
// يجد المعالج شيئًا يُصلحه، ثم يُعاد بناء الشريط لاحقًا بلا أي حدث يُصلحه.
// keepAttached() تحل هذا جذريًا بمراقبة DOM نفسه، لا حدثًا يُفترض تزامنه.

/** يحاكي بالضبط ما تفعله options/main.js عند تبديل الثيم أو اللغة: تبني
 *  عنصر حاوية جديدًا بالكامل بنفس الصنف وتستبدل القديم به. */
function rebuildContainer(oldContainer, className) {
  const fresh = document.createElement("div");
  fresh.className = className;
  oldContainer.replaceWith(fresh);
  return fresh;
}

// keepAttached تستخدم مراقبًا مشتركًا واحدًا على مستوى الوحدة، يبقى نشطًا
// طوال حياة العملية. لتفادي تسرّب مراقبين بين الاختبارات (يتفاعل أحدها مع
// طفرات اختبار آخر)، نُوقف كل مراقب أنشأه الاختبار الحالي فور انتهائه.
let activeStops = [];
function trackedKeepAttached(...args) {
  const stop = keepAttached(...args);
  activeStops.push(stop);
  return stop;
}

describe("keepAttached", () => {
  afterEach(() => {
    activeStops.forEach((stop) => stop());
    activeStops = [];
  });

  it("يعيد إلحاق العنصر بعد إعادة بناء الحاوية بالكامل (بلا أي حدث تخزين)", async () => {
    document.body.innerHTML = `<div class="topbar"></div>`;
    let container = document.querySelector(".topbar");
    const button = document.createElement("button");
    button.textContent = "Trash";
    container.append(button);

    trackedKeepAttached(".topbar", button);

    container = rebuildContainer(container, "topbar");
    expect(button.isConnected).toBe(false); // فُقد مؤقتًا، كما في التطبيق الحقيقي

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(button.isConnected).toBe(true);
    expect(container.contains(button)).toBe(true);
  });

  it("يعمل عبر عدة دورات إعادة بناء متتالية، لا مرة واحدة فقط", async () => {
    document.body.innerHTML = `<div class="topbar"></div>`;
    let container = document.querySelector(".topbar");
    const button = document.createElement("button");
    container.append(button);
    trackedKeepAttached(".topbar", button);

    for (let i = 0; i < 3; i++) {
      container = rebuildContainer(container, "topbar");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(container.contains(button)).toBe(true);
    }
  });

  it("يحترم استراتيجية الإلحاق المخصَّصة (prepend بدل append الافتراضية)", async () => {
    document.body.innerHTML = `<div class="topbar"></div>`;
    let container = document.querySelector(".topbar");
    const button = document.createElement("button");
    button.id = "sync-btn";
    container.append(button);
    trackedKeepAttached(".topbar", button, (c, el) => c.prepend(el));

    container = rebuildContainer(container, "topbar");
    container.append(document.createElement("span")); // تُنشأ الحاوية الجديدة بمحتوى آخر أولًا، كالتطبيق الحقيقي
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(container.firstElementChild.id).toBe("sync-btn");
  });

  it("لا يفعل شيئًا إذا كان العنصر متصلًا بالفعل (لا إعادة إلحاق غير ضرورية)", async () => {
    document.body.innerHTML = `<div class="topbar"></div>`;
    const container = document.querySelector(".topbar");
    const button = document.createElement("button");
    container.append(button);
    trackedKeepAttached(".topbar", button);

    // تحريك عنصر آخر في المستند (طفرة DOM غير متعلقة) يجب ألا يزعزع الزر
    const other = document.createElement("div");
    document.body.append(other);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(container.children[0]).toBe(button);
    expect(container.children.length).toBe(1);
  });

  it("توقف المراقبة لعنصر مُعيَّن عبر دالة الإلغاء المُعادة دون التأثير على غيره", async () => {
    document.body.innerHTML = `<div class="topbar"></div>`;
    let container = document.querySelector(".topbar");
    const buttonA = document.createElement("button");
    const buttonB = document.createElement("button");
    container.append(buttonA, buttonB);

    const stopA = trackedKeepAttached(".topbar", buttonA);
    trackedKeepAttached(".topbar", buttonB);
    stopA();

    container = rebuildContainer(container, "topbar");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(container.contains(buttonA)).toBe(false);
    expect(container.contains(buttonB)).toBe(true);
  });
});

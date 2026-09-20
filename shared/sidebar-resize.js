/**
 * shared/sidebar-resize.js
 * ---------------------------------------------------------------------------
 * يضيف مقبض سحب بين الشريط الجانبي (.options__sidebar) والمحتوى الرئيسي في
 * صفحة الخيارات، لتوسيعه يدويًا فتظهر أسماء المجموعات الطويلة كاملة دون قطع.
 *
 * بنفس تقنية options/trash-panel.js وأخواتها بالضبط: ننتظر ظهور العنصر (يُبنى
 * ديناميكيًا بواسطة main.js، الحزمة الأصلية) بدل تعديل main.js نفسه.
 *
 * إلحاق واحد فقط يكفي هنا (لا حاجة لمراقب DOM دائم كـ keepAttached في
 * dom-utils.js): .options__sidebar الفعلي لا يُعاد إنشاؤه أبدًا بعد أول
 * تركيب — إعادة إنشائه هي تحديدًا الباگ الذي وثّقه main.js عند تعليق
 * refreshSidebarShellTexts (تكرار الشريط عند تبديل اللغة)، وقد تم تفاديه
 * هناك فعلاً بتحديث النصوص في مكانها بدل إعادة البناء.
 *
 * العرض المختار يُطبَّق عبر متغيّر CSS واحد على <html> (--keepit-sidebar-width)
 * ويُحفَظ في chrome.storage.local ليبقى بعد إغلاق الصفحة.
 */
import { waitForElement } from "../local-sync/dom-utils.js";
import { resolveLocale } from "../local-sync/i18n.js";
import { KEEPIT_LOCALE_KEY } from "../local-sync/constants.js";

const STORAGE_KEY = "keepit:sidebarWidth";
const MIN_WIDTH = 220;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH = 300; // يطابق القيمة الافتراضية الثابتة سابقًا في options/main.css
const KEYBOARD_STEP = 24;

const LABEL = {
  ar: "تغيير عرض الشريط الجانبي — استخدم السهمين لليمين واليسار",
  en: "Resize sidebar — use the left and right arrow keys",
};

init();

async function init() {
  const sidebarEl = await waitForElement(".options__sidebar");
  if (!sidebarEl) return; // مهلة الانتظار انتهت؛ لا نُفشل باقي الصفحة

  const [stored, localeData] = await Promise.all([
    chrome.storage.local.get(STORAGE_KEY),
    chrome.storage.local.get(KEEPIT_LOCALE_KEY),
  ]);

  let locale = resolveLocale(localeData[KEEPIT_LOCALE_KEY]);
  applyWidth(clamp(stored[STORAGE_KEY]));

  const handle = buildHandle(clamp(stored[STORAGE_KEY]), locale);
  sidebarEl.after(handle);
  wireDrag(handle, sidebarEl);
  wireKeyboard(handle);

  // يحدّث تسمية إمكانية الوصول فورًا عند تبديل اللغة من هذه الصفحة أو من
  // تبويب/نافذة أخرى، دون إعادة تحميل.
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[KEEPIT_LOCALE_KEY]) return;
    locale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
    handle.setAttribute("aria-label", LABEL[locale]);
  });
}

function clamp(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_WIDTH;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n));
}

function applyWidth(width) {
  document.documentElement.style.setProperty("--keepit-sidebar-width", `${width}px`);
}

function persistWidth(width) {
  chrome.storage.local.set({ [STORAGE_KEY]: width });
}

function currentWidth(handle) {
  return clamp(Number(handle.getAttribute("aria-valuenow")));
}

/** يطبّق العرض على الصفحة والمقبض معًا، ويُعيد القيمة المضبوطة فعليًا. */
function setWidth(handle, width) {
  const clamped = clamp(width);
  applyWidth(clamped);
  handle.setAttribute("aria-valuenow", String(clamped));
  return clamped;
}

function buildHandle(initialWidth, locale) {
  const handle = document.createElement("div");
  handle.className = "sidebar-resize-handle";
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-orientation", "vertical");
  handle.setAttribute("aria-label", LABEL[locale]);
  handle.setAttribute("aria-valuemin", String(MIN_WIDTH));
  handle.setAttribute("aria-valuemax", String(MAX_WIDTH));
  handle.setAttribute("aria-valuenow", String(initialWidth));
  handle.tabIndex = 0;
  return handle;
}

function wireDrag(handle, sidebarEl) {
  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return; // الزر الأيسر فقط؛ نتجاهل يمين/وسط الفأرة
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("is-dragging");

    const containerRect = sidebarEl.parentElement.getBoundingClientRect();
    const sidebarRect = sidebarEl.getBoundingClientRect();
    // الشريط قد يكون على اليسار (English) أو اليمين (عربي/RTL) بحسب اللغة
    // الحالية (راجع shared/dir-switch.js) — نحدد الحافة الثابتة هندسيًا من
    // موضعه الفعلي بدل افتراض اتجاه معيّن.
    const sidebarOnLeft =
      Math.abs(sidebarRect.left - containerRect.left) < Math.abs(sidebarRect.right - containerRect.right);

    const onMove = (moveEvent) => {
      const rawWidth = sidebarOnLeft
        ? moveEvent.clientX - containerRect.left
        : containerRect.right - moveEvent.clientX;
      setWidth(handle, rawWidth);
    };
    const onUp = () => {
      handle.classList.remove("is-dragging");
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      persistWidth(currentWidth(handle));
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });

  // نقرة مزدوجة تُعيد العرض الافتراضي — اختصار شائع لمقابض التحجيم.
  handle.addEventListener("dblclick", () => {
    persistWidth(setWidth(handle, DEFAULT_WIDTH));
  });
}

function wireKeyboard(handle) {
  handle.addEventListener("keydown", (event) => {
    const current = currentWidth(handle);
    /** @type {number | null} */
    let next = null;
    if (event.key === "ArrowRight") next = current + KEYBOARD_STEP;
    else if (event.key === "ArrowLeft") next = current - KEYBOARD_STEP;
    else if (event.key === "Home") next = MIN_WIDTH;
    else if (event.key === "End") next = MAX_WIDTH;
    if (next === null) return;
    event.preventDefault();
    persistWidth(setWidth(handle, next));
  });
}

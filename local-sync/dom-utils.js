/**
 * local-sync/dom-utils.js
 * ---------------------------------------------------------------------------
 * أدوات DOM عامة قابلة لإعادة الاستخدام، منفصلة عمدًا عن منطق لوحة
 * المزامنة نفسها (فصل الاهتمامات — الواجهة العامة هنا لا تعرف شيئًا عن
 * Keepit تحديدًا).
 */

/**
 * ينتظر ظهور عنصر يطابق selector داخل root، ثم يُرجعه ويفصل المراقب
 * فورًا (لا نُبقي MutationObserver يعمل إلى الأبد — أداء ونظافة ذاكرة).
 * يُستخدَم لأن صفحة الخيارات تُبنى ديناميكيًا بواسطة main.js، وقد لا يكون
 * شريط الأدوات جاهزًا بعد وقت تحميل هذا السكربت.
 *
 * @param {string} selector
 * @param {{ root?: ParentNode, timeoutMs?: number }} [options]
 * @returns {Promise<Element | null>} null إن انتهت المهلة دون ظهور العنصر
 */
export function waitForElement(selector, { root = document, timeoutMs = 15000 } = {}) {
  const existing = root.querySelector(selector);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (!el) return;
      cleanup();
      resolve(el);
    });

    const timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    function cleanup() {
      observer.disconnect();
      clearTimeout(timer);
    }

    observer.observe(root === document ? document.documentElement : root, {
      childList: true,
      subtree: true,
    });
  });
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * يبني نافذة حوار متاحة (overlay + dialog) مع حبس تركيز (focus trap)،
 * إغلاق بمفتاح Escape، إغلاق بالنقر على الخلفية، وإعادة التركيز إلى
 * العنصر الذي كان مُركَّزًا قبل الفتح عند الإغلاق. يُعيد استخدام أصناف
 * CSS الموجودة أصلاً في التطبيق (.overlay, .dialog, .dialog__header...)
 * للحفاظ على تطابق بصري كامل دون تكرار الأنماط.
 *
 * العنصر يُنشأ عند open() ويُزال بالكامل من DOM عند close() — لا نُبقي
 * عقدًا منفصلة (detached nodes) مرجعيتها حية بلا داعٍ بعد الإغلاق.
 *
 * @param {{
 *   titleId: string,
 *   titleText: string,
 *   bodyEl: HTMLElement,
 *   closeLabel: string,
 *   extraDialogClass?: string,
 *   onClose?: () => void,
 * }} config
 * @returns {{ overlayEl: HTMLDivElement, close: () => void }}
 */
export function openAccessibleDialog({ titleId, titleText, bodyEl, closeLabel, extraDialogClass, onClose }) {
  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const overlayEl = document.createElement("div");
  overlayEl.className = "overlay";

  const dialogEl = document.createElement("div");
  dialogEl.className = extraDialogClass ? `dialog ${extraDialogClass}` : "dialog";
  dialogEl.setAttribute("role", "dialog");
  dialogEl.setAttribute("aria-modal", "true");
  dialogEl.setAttribute("aria-labelledby", titleId);

  const headerEl = document.createElement("div");
  headerEl.className = "dialog__header";

  const titleEl = document.createElement("h2");
  titleEl.className = "dialog__title";
  titleEl.id = titleId;
  titleEl.textContent = titleText;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn btn--icon btn--ghost";
  closeBtn.setAttribute("aria-label", closeLabel);
  closeBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  closeBtn.addEventListener("click", () => close());

  headerEl.append(titleEl, closeBtn);
  dialogEl.append(headerEl, bodyEl);
  overlayEl.append(dialogEl);

  function onKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(dialogEl.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el instanceof HTMLElement && el.offsetParent !== null,
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onOverlayClick(event) {
    if (event.target === overlayEl) close();
  }

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKeydown, true);
    overlayEl.removeEventListener("click", onOverlayClick);
    overlayEl.remove();
    if (previouslyFocused && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
    if (onClose) onClose();
  }

  document.addEventListener("keydown", onKeydown, true);
  overlayEl.addEventListener("click", onOverlayClick);
  document.body.append(overlayEl);

  requestAnimationFrame(() => {
    const firstFocusable = dialogEl.querySelector(FOCUSABLE_SELECTOR);
    if (firstFocusable instanceof HTMLElement) firstFocusable.focus();
  });

  return { overlayEl, close };
}

/**
 * يعرض إشعارًا عابرًا (toast) بنفس أسلوب إشعارات التطبيق الأصلية. يُعيد
 * استخدام حاوية .toast-stack الموجودة أصلاً في الصفحة إن وُجدت (لتفادي
 * تكرار حاوية موازية)، وإلا يُنشئ واحدة مؤقتة.
 *
 * @param {string} message
 * @param {"success" | "error"} [variant]
 */
export function showToast(message, variant = "success") {
  let stack = document.querySelector(".toast-stack");
  let ownStack = false;
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.append(stack);
    ownStack = true;
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast toast--${variant}`;
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  toastEl.textContent = message;
  stack.append(toastEl);

  setTimeout(() => {
    toastEl.remove();
    if (ownStack && stack.childElementCount === 0) stack.remove();
  }, 2600);
}

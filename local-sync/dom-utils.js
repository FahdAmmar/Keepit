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

/**
 * يُبقي عنصرًا (عادة زر تفعيل لوحة) مُلحَقًا بأول عنصر يطابق selector،
 * حتى لو انفصل عن المستند لاحقًا. صفحة الخيارات تُعيد بناء شريط الأدوات
 * (main.js، الحزمة الأصلية) عند تبديل اللغة **أو** الوضع الليلي/النهاري —
 * كلاهما يستدعي دالة عرض شريط الأدوات نفسها، فتُنشئ عنصر DOM **جديدًا
 * بالكامل** بنفس الصنف .options__topbar-actions بدل تعديل القديم في
 * مكانه. أي زر أُلحق يدويًا بالعنصر القديم يبقى موجودًا في الذاكرة لكن
 * يصبح غير متصل بالمستند، فيختفي بصريًا بصمت.
 *
 * **لماذا مراقب DOM دائم، لا معالج storage.onChanged**: المحاولة الأولى
 * كانت استدعاء إعادة الإلحاق من داخل معالج chrome.storage.onChanged
 * لمفتاحي keepit:locale وkeepit:theme (نفس اللحظة منطقيًا التي يُعاد فيها
 * بناء الشريط). تَحقّقنا عمليًا في متصفح Chromium حقيقي (لا محاكاة) أن
 * هذا الافتراض خاطئ: حدث storage.onChanged يصل إلى مستمعي نفس الصفحة
 * التي كتبت القيمة **قبل** أن ينتهي `.then(re)` من إعادة بناء الشريط، لا
 * بعده — فيجد المعالج الزر لا يزال متصلًا (لا شيء لإصلاحه)، ثم يُعاد بناء
 * الشريط بعد ذلك بلا أي حدث لاحق يُصلحه. النتيجة: الزر يختفي فعليًا رغم
 * وجود معالجة "صحيحة" ظاهريًا لكلا المفتاحين. الحل الوحيد الموثوق هو
 * مراقبة التغيير في DOM نفسه، لا حدث تخزين يُفترض أنه يتزامن معه.
 *
 * التكلفة محدودة عمدًا: مراقب واحد **مشترك** بين كل استدعاءات هذه الدالة
 * (بغض النظر عن عدد اللوحات)، لا مراقب منفصل لكل لوحة.
 *
 * @param {string} selector
 * @param {HTMLElement} el - نفس مرجع العنصر دائمًا؛ لا يُعاد بناؤه هنا، فقط
 *   يُعاد إلحاقه، فتبقى كل مستمعات الأحداث المُسجَّلة عليه سليمة.
 * @param {(container: Element, el: HTMLElement) => void} [insert] - استراتيجية
 *   الإلحاق (افتراضيًا append)؛ مرِّر (c, el) => c.prepend(el) للوحات التي
 *   تعتمد ترتيبًا محددًا لزرها ضمن الشريط.
 * @returns {() => void} دالة لإيقاف المراقبة لهذا العنصر تحديدًا (نادرًا ما
 *   تُستخدَم، لأن أزرار اللوحات تعيش طوال عمر الصفحة).
 */
/** @type {MutationObserver | null} */
let sharedTopbarObserver = null;
const topbarWatchers = new Set();

function ensureSharedTopbarObserver() {
  if (sharedTopbarObserver) return;
  sharedTopbarObserver = new MutationObserver(() => {
    for (const tryReattach of topbarWatchers) tryReattach();
  });
  sharedTopbarObserver.observe(document.body, { childList: true, subtree: true });
}

export function keepAttached(selector, el, insert = (container, element) => container.append(element)) {
  const tryReattach = () => {
    if (el.isConnected) return;
    const container = document.querySelector(selector);
    if (container && !container.contains(el)) insert(container, el);
  };
  topbarWatchers.add(tryReattach);
  ensureSharedTopbarObserver();
  return () => topbarWatchers.delete(tryReattach);
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
      /** @returns {el is HTMLElement} */ (el) => el instanceof HTMLElement && el.offsetParent !== null,
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
 * يُعيد بناء container عبر renderFn() مع الحفاظ على تركيز لوحة المفاتيح
 * (keyboard focus) إن أمكن.
 *
 * لماذا هذه الأداة ضرورية: كل لوحاتنا (سلة المحذوفات، النسخ الاحتياطية،
 * المزامنة المحلية) تُعيد بناء محتوى الحوار بالكامل (container.replaceChildren()
 * ثم إعادة إنشاء كل عنصر من الصفر) بعد أي إجراء — نجاح أو فشل، محليًا أو
 * قادمًا من chrome.storage.onChanged. بلا هذه الأداة، الزر الذي كان
 * مُركَّزًا (وغالبًا هو نفس الزر الذي ضغطه المستخدم للتو) يُدمَّر ويُستبدل
 * بعنصر DOM جديد تمامًا، فيسقط التركيز صامتًا إلى <body>. النتيجة: مستخدم
 * لوحة المفاتيح أو قارئ الشاشة يُعاد به لأعلى الحوار من جديد بعد **كل**
 * إجراء بلا استثناء — مشكلة إتاحة نظامية حقيقية (WCAG 2.4.3)، لا حالة
 * حافة نادرة.
 *
 * الآلية: نلتقط "مفتاح تركيز" (data-focus-key، أو id كبديل) للعنصر
 * المُركَّز حاليًا داخل container قبل renderFn()، ثم نحاول إعادة التركيز
 * لعنصر بنفس المفتاح بعده. إن لم يعد ذلك العنصر موجودًا (مثلاً صف حُذف
 * نهائيًا)، ننتقل لأقرب بديل منطقي داخل نفس الحوار بدل ترك التركيز يسقط.
 *
 * العناصر التفاعلية التي يجب أن تحمل data-focus-key فريدًا ومستقرًا
 * (يُشتق من معرّف البيانات الفعلي — id الصف، لا فهرسه في القائمة، حتى لا
 * يتغيّر المفتاح لمجرد إعادة ترتيب) هي مسؤولية كل لوحة تستدعي هذه الأداة.
 *
 * @param {HTMLElement} container
 * @param {() => void} renderFn - يُنفَّذ container.replaceChildren() ثم إعادة
 *   بناء المحتوى بداخله (متزامن؛ لا يدعم renderFn غير متزامنة).
 */
export function rerenderPreservingFocus(container, renderFn) {
  const active = document.activeElement;
  const hadFocus = active instanceof HTMLElement && container.contains(active);
  const focusKey = hadFocus ? active.dataset.focusKey || active.id || null : null;

  renderFn();

  if (!hadFocus) return;

  if (focusKey) {
    const next =
      container.querySelector(`[data-focus-key="${cssEscape(focusKey)}"]`) ||
      (active.id ? document.getElementById(active.id) : null);
    if (next instanceof HTMLElement) {
      next.focus();
      return;
    }
  }

  // العنصر السابق لم يعد موجودًا (مثلاً صف حُذف نهائيًا فعليًا) — ننتقل
  // لأقرب عنصر قابل للتركيز داخل نفس الحوار بدل ترك التركيز يسقط صامتًا.
  const dialogEl = container.closest(".dialog");
  const fallback = (dialogEl || container).querySelector(FOCUSABLE_SELECTOR);
  if (fallback instanceof HTMLElement) fallback.focus();
}

export function cssEscape(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&"); // بديل بسيط للمتصفحات القديمة جدًا فقط
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

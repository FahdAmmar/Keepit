/**
 * shared/confirm-dialog.js
 * ---------------------------------------------------------------------------
 * حوار تأكيد قابل لإعادة الاستخدام لأي إجراء غير قابل للتراجع (حذف نهائي،
 * إفراغ، استبدال...). مبني فوق openAccessibleDialog من
 * local-sync/dom-utils.js — أداة عامة مصمَّمة أصلاً لإعادة الاستخدام خارج
 * ميزة المزامنة المحلية تحديدًا (راجع التعليق في رأس ذلك الملف). يُعيد
 * استخدام نفس أصناف .confirm-dialog/.confirm-dialog__icon الموجودة أصلاً
 * في main.css (تُستخدَم من حوارات الحذف المدمجة في التطبيق الأصلي نفسه)
 * لضمان تطابق بصري كامل مع بقية الصفحة.
 */
import { openAccessibleDialog } from "../local-sync/dom-utils.js";

const WARNING_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1.5 1.5 0 0 0 3.5 20.5h17a1.5 1.5 0 0 0 1.39-2.46L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z"/></svg>';

/**
 * @param {{
 *   titleId: string, titleText: string, message: string,
 *   confirmLabel: string, cancelLabel: string, closeLabel: string,
 * }} config
 * @returns {Promise<boolean>} true إن أكّد المستخدم، false إن ألغى بأي طريقة
 *   (زر الإلغاء، Escape، النقر على الخلفية، أو زر الإغلاق).
 */
export function confirmDestructive({ titleId, titleText, message, confirmLabel, cancelLabel, closeLabel }) {
  return new Promise((resolve) => {
    let settled = false;

    const bodyEl = document.createElement("div");
    bodyEl.className = "confirm-dialog";

    const iconEl = document.createElement("div");
    iconEl.className = "confirm-dialog__icon";
    iconEl.innerHTML = WARNING_ICON;

    const msgEl = document.createElement("p");
    msgEl.className = "confirm-dialog__message";
    msgEl.textContent = message;

    const actions = document.createElement("div");
    actions.className = "dialog__actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn--ghost";
    cancelBtn.textContent = cancelLabel;

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "btn btn--danger";
    confirmBtn.textContent = confirmLabel;

    actions.append(cancelBtn, confirmBtn);
    bodyEl.append(iconEl, msgEl, actions);

    const { close } = openAccessibleDialog({
      titleId,
      titleText,
      bodyEl,
      closeLabel,
      onClose: () => {
        if (!settled) {
          settled = true;
          resolve(false);
        }
      },
    });

    cancelBtn.addEventListener("click", () => close());
    confirmBtn.addEventListener("click", () => {
      settled = true;
      resolve(true);
      close();
    });

    // تركيز افتراضي على "إلغاء" (الخيار الآمن) بدل زر الإغلاق العام أو زر
    // الحذف نفسه — يُستدعى بعد openAccessibleDialog عمدًا ليَغلب تركيزها
    // التلقائي على أول عنصر قابل للتركيز داخل نفس دفعة rAF.
    requestAnimationFrame(() => cancelBtn.focus());
  });
}

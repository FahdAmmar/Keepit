/**
 * trash/undo-toast.js
 * ---------------------------------------------------------------------------
 * وحدة صغيرة تُحمَّل في كل من popup وoptions: تستمع لتغيّرات keepit:trash
 * وتعرض إشعار "تراجع" فوريًا حين يُكتشف حذف جديد حدث في هذه الصفحة نفسها
 * للتو. لا تُعدّل main.js إطلاقًا؛ التمييز بين "حدث جديد" و"حدث قديم" يتم
 * بمقارنة مجموعتي المعرّفات قبل/بعد كل تغيير (وليس بالاعتماد على الطول
 * فقط)، لتبقى صحيحة حتى لو حدثت استعادة أو حذف نهائي من لوحة السلة في نفس
 * اللحظة تقريبًا.
 *
 * لماذا لا نكتفي بـ showToast() الموجودة في local-sync/dom-utils.js؟ لأنها
 * نصّية فقط بلا إجراء قابل للنقر — هذا الإشعار يحتاج زر "تراجع" فعليًا،
 * لذا نبني عنصر toast مستقلاً هنا مع إعادة استخدام نفس أصناف CSS
 * (.toast-stack, .toast, .toast--success) للتطابق البصري الكامل.
 *
 * حذف دفعي (أكثر من عنصر في نفس التغيير، كما قد يحدث عند "سحب" وضع
 * الاستبدال في المزامنة المحلية): لا نحاول استعادة كل شيء تلقائيًا بلا
 * تأكيد — نعرض بدلاً من ذلك زر "فتح السلة" إن كانت لوحة السلة متاحة في
 * هذه الصفحة (صفحة الخيارات فقط؛ راجع options/trash-panel.js).
 */
import { TRASH_KEY, KEEPIT_LOCALE_KEY, UNDO_TOAST_FRESHNESS_MS, UNDO_TOAST_DURATION_MS } from "./constants.js";
import { restoreEntry } from "./store.js";
import { t, resolveLocale } from "./i18n.js";

let currentLocale = "ar";

init();

async function init() {
  const data = await chrome.storage.local.get(KEEPIT_LOCALE_KEY);
  currentLocale = resolveLocale(data[KEEPIT_LOCALE_KEY]);
  chrome.storage.onChanged.addListener(handleStorageChange);
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "local") return;

  if (KEEPIT_LOCALE_KEY in changes) {
    currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
  }

  if (!(TRASH_KEY in changes)) return;

  const oldEntries = changes[TRASH_KEY].oldValue?.entries;
  const newEntries = changes[TRASH_KEY].newValue?.entries;
  if (!Array.isArray(newEntries)) return;

  const oldIds = new Set(Array.isArray(oldEntries) ? oldEntries.map((e) => e.id) : []);
  const addedEntries = newEntries.filter((e) => !oldIds.has(e.id));
  if (addedEntries.length === 0) return;

  const now = Date.now();
  const fresh = addedEntries.filter((e) => now - e.deletedAt < UNDO_TOAST_FRESHNESS_MS);
  if (fresh.length === 0) return; // دفعة قديمة (مثلاً وصلت أثناء تحميل الصفحة) — لا نُزعج المستخدم بلا داعٍ

  if (fresh.length === 1) {
    showUndoToast(fresh[0]);
  } else {
    showMultiDeleteToast(fresh.length);
  }
}

function showUndoToast(entry) {
  const name = entry.kind === "collection" ? entry.collection.name : entry.item.title;
  const key = entry.kind === "collection" ? "undoToastDeletedCollection" : "undoToastDeletedItem";

  buildToast(t(currentLocale, key, { name }), {
    label: t(currentLocale, "undoAction"),
    onClick: async (dismiss) => {
      dismiss();
      try {
        await restoreEntry(entry);
      } catch (err) {
        console.error("[Keepit trash] undo failed", err);
      }
    },
  });
}

function showMultiDeleteToast(count) {
  const openPanel = /** @type {any} */ (window).KeepitOpenTrashPanel;
  buildToast(
    t(currentLocale, "undoToastMultiple", { count }),
    typeof openPanel === "function"
      ? {
          label: t(currentLocale, "openTrashAction"),
          onClick: (dismiss) => {
            dismiss();
            openPanel();
          },
        }
      : null,
  );
}

/** @param {string} message @param {{label: string, onClick: (dismiss: () => void) => void} | null} [action] */
function buildToast(message, action) {
  let stack = document.querySelector(".toast-stack");
  let ownStack = false;
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.append(stack);
    ownStack = true;
  }

  const toastEl = document.createElement("div");
  toastEl.className = "toast toast--success keepit-trash-toast";
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");

  const textEl = document.createElement("span");
  textEl.className = "keepit-trash-toast__text";
  textEl.textContent = message;
  toastEl.append(textEl);

  let timer;
  const dismiss = () => {
    clearTimeout(timer);
    toastEl.remove();
    if (ownStack && stack.childElementCount === 0) stack.remove();
  };

  if (action) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--ghost btn--sm keepit-trash-toast__action";
    btn.textContent = action.label;
    btn.addEventListener("click", () => action.onClick(dismiss));
    toastEl.append(btn);
  }

  stack.append(toastEl);
  timer = setTimeout(dismiss, UNDO_TOAST_DURATION_MS);
}

/**
 * options/trash-panel.js
 * ---------------------------------------------------------------------------
 * يُضيف نقطة دخول لسلة المحذوفات داخل شريط أدوات صفحة الخيارات، دون تعديل
 * main.js (الحزمة المضغوطة الأصلية) إطلاقًا — بنفس تقنية
 * options/local-sync-panel.js تمامًا: ننتظر ظهور .options__topbar-actions
 * (يُبنى ديناميكيًا بواسطة main.js) ثم نُلحق بها زرًّا جديدًا.
 *
 * كل القراءة/الكتابة الفعلية تمر عبر trash/store.js؛ هذا الملف مسؤول فقط
 * عن الواجهة والتحكم.
 */
import { waitForElement, openAccessibleDialog, showToast, rerenderPreservingFocus } from "../local-sync/dom-utils.js";
import { confirmDestructive } from "../shared/confirm-dialog.js";
import { formatRelativeTime } from "../shared/format-time.js";
import { isSafeFaviconUrl } from "../shared/safe-favicon.js";
import { readTrashEntries, restoreEntry, deleteEntryPermanently, emptyTrash } from "../trash/store.js";
import { t, resolveLocale } from "../trash/i18n.js";
import { TRASH_KEY, KEEPIT_LOCALE_KEY, RETENTION_DAYS } from "../trash/constants.js";

const ICON_TRASH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5M6.5 6.5v12A1.5 1.5 0 0 0 8 20h8a1.5 1.5 0 0 0 1.5-1.5v-12M10 10.5v6M14 10.5v6"/></svg>`;
const ICON_FOLDER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.25A1.75 1.75 0 0 1 5.25 5.5h3.19c.35 0 .68.14.93.39l1.13 1.13c.25.25.58.39.93.39H18.75A1.75 1.75 0 0 1 20.5 9.16v7.59a1.75 1.75 0 0 1-1.75 1.75H5.25A1.75 1.75 0 0 1 3.5 16.75z"/></svg>`;
const ICON_LINK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 14.5 9.5M8 17l-1.5 1.5a3.5 3.5 0 0 1-5-5L3 12M16 7l1.5-1.5a3.5 3.5 0 0 1 5 5L21 12"/></svg>`;
const ICON_RESTORE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5A8 8 0 1 1 5.5 15M4 9.5V4M4 9.5h5.5"/></svg>`;
const ICON_DELETE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

const TITLE_ID = "keepit-trash-title";

let currentLocale = "ar";
let currentEntries = [];
/** @type {(() => void) | null} */
let activeDialogRefresh = null;
/** @type {HTMLButtonElement | null} */
let triggerBtnEl = null;
/** @type {HTMLSpanElement | null} */
let triggerBadgeEl = null;

init();

async function init() {
  const [entries, localeData] = await Promise.all([
    readTrashEntries(),
    chrome.storage.local.get(KEEPIT_LOCALE_KEY),
  ]);
  currentEntries = entries;
  currentLocale = resolveLocale(localeData[KEEPIT_LOCALE_KEY]);

  chrome.storage.onChanged.addListener(handleStorageChange);

  const container = await waitForElement(".options__topbar-actions");
  if (!container) return; // شريط الأدوات لم يظهر خلال المهلة؛ لا نُفشل الصفحة، نتجاهل بصمت
  mountTriggerButton(container);

  // مُتاحة لوحدات أخرى في نفس الصفحة (راجع trash/undo-toast.js) لفتح
  // اللوحة برمجيًا عند حذف دفعي، دون أي اقتران مباشر بين الملفين.
  window.KeepitOpenTrashPanel = openPanel;
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "local") return;

  if (TRASH_KEY in changes) {
    const entries = changes[TRASH_KEY].newValue?.entries;
    currentEntries = Array.isArray(entries) ? entries.slice().sort((a, b) => b.deletedAt - a.deletedAt) : [];
    updateTriggerBadge();
    updateTriggerAria();
    activeDialogRefresh?.();
  }
  if (KEEPIT_LOCALE_KEY in changes) {
    currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
    updateTriggerAria();
    activeDialogRefresh?.();
  }
}

// ---------------------------------------------------------------------------
// زر التفعيل في شريط الأدوات
// ---------------------------------------------------------------------------

function mountTriggerButton(container) {
  triggerBtnEl = document.createElement("button");
  triggerBtnEl.type = "button";
  triggerBtnEl.className = "btn btn--icon";
  triggerBtnEl.innerHTML = ICON_TRASH;
  triggerBtnEl.addEventListener("click", openPanel);

  triggerBadgeEl = document.createElement("span");
  triggerBadgeEl.className = "keepit-trash-badge";
  triggerBtnEl.append(triggerBadgeEl);

  updateTriggerAria();
  updateTriggerBadge();

  container.append(triggerBtnEl);
}

function updateTriggerAria() {
  if (!triggerBtnEl) return;
  const count = currentEntries.length;
  const label =
    count > 0 ? t(currentLocale, "triggerLabelWithCount", { count }) : t(currentLocale, "triggerLabel");
  triggerBtnEl.setAttribute("aria-label", label);
  triggerBtnEl.title = label;
}

function updateTriggerBadge() {
  if (!triggerBadgeEl) return;
  const count = currentEntries.length;
  triggerBadgeEl.textContent = count > 99 ? "99+" : String(count);
  triggerBadgeEl.hidden = count === 0;
}

// ---------------------------------------------------------------------------
// نافذة اللوحة
// ---------------------------------------------------------------------------

function openPanel() {
  const bodyEl = document.createElement("div");
  bodyEl.className = "keepit-trash-body";
  renderBody(bodyEl);

  openAccessibleDialog({
    titleId: TITLE_ID,
    titleText: t(currentLocale, "panelTitle"),
    bodyEl,
    closeLabel: t(currentLocale, "close"),
    extraDialogClass: "dialog--lg keepit-trash-dialog",
    onClose: () => {
      activeDialogRefresh = null;
    },
  });

  activeDialogRefresh = () => rerenderPreservingFocus(bodyEl, () => renderBody(bodyEl));
}

function renderBody(container) {
  container.replaceChildren();
  const locale = currentLocale;

  const intro = document.createElement("p");
  intro.className = "keepit-trash-intro";
  intro.textContent = t(locale, "panelIntro", { days: RETENTION_DAYS });
  container.append(intro);

  if (currentEntries.length === 0) {
    container.append(buildEmptyState(locale));
    return;
  }

  const list = document.createElement("div");
  list.className = "keepit-trash-list";
  for (const entry of currentEntries) {
    list.append(buildEntryRow(entry, locale));
  }
  container.append(list);

  const actions = document.createElement("div");
  actions.className = "keepit-trash-footer";
  const emptyBtn = document.createElement("button");
  emptyBtn.type = "button";
  emptyBtn.className = "btn btn--ghost btn--sm btn--danger";
  emptyBtn.dataset.focusKey = "empty-trash";
  emptyBtn.textContent = t(locale, "emptyTrashAction");
  emptyBtn.addEventListener("click", () => onEmptyTrash());
  actions.append(emptyBtn);
  container.append(actions);
}

function buildEmptyState(locale) {
  const box = document.createElement("div");
  box.className = "option-card";
  const title = document.createElement("div");
  title.className = "option-card__title";
  title.textContent = t(locale, "emptyTitle");
  const desc = document.createElement("div");
  desc.className = "option-card__desc";
  desc.textContent = t(locale, "emptyDesc");
  box.append(title, desc);
  return box;
}

function buildEntryRow(entry, locale) {
  const row = document.createElement("div");
  row.className = "keepit-trash-row";

  const iconWrap = document.createElement("div");
  iconWrap.className = "keepit-trash-row__icon";
  if (entry.kind === "collection") {
    iconWrap.innerHTML = ICON_FOLDER;
  } else if (isSafeFaviconUrl(entry.item.faviconUrl)) {
    const img = document.createElement("img");
    img.src = entry.item.faviconUrl;
    img.alt = "";
    img.loading = "lazy";
    iconWrap.append(img);
  } else {
    iconWrap.innerHTML = ICON_LINK;
  }

  const textWrap = document.createElement("div");
  textWrap.className = "keepit-trash-row__text";
  const nameEl = document.createElement("div");
  nameEl.className = "keepit-trash-row__name";
  nameEl.textContent = entry.kind === "collection" ? entry.collection.name : entry.item.title;

  const metaEl = document.createElement("div");
  metaEl.className = "keepit-trash-row__meta";
  const metaParts = [
    entry.kind === "collection"
      ? t(locale, "collectionWithCount", { count: entry.collection.items.length })
      : t(locale, "itemFromCollection", { collection: entry.sourceCollection.name }),
    formatRelativeTime(entry.deletedAt, locale),
  ];
  metaEl.textContent = metaParts.join(" · ");

  textWrap.append(nameEl, metaEl);

  const actionsEl = document.createElement("div");
  actionsEl.className = "keepit-trash-row__actions";

  const restoreBtn = document.createElement("button");
  restoreBtn.type = "button";
  restoreBtn.className = "btn btn--icon";
  restoreBtn.innerHTML = ICON_RESTORE;
  restoreBtn.dataset.focusKey = `restore-${entry.id}`;
  restoreBtn.setAttribute("aria-label", t(locale, "restoreAction"));
  restoreBtn.title = t(locale, "restoreAction");
  restoreBtn.addEventListener("click", () => onRestore(entry));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn--icon btn--danger";
  deleteBtn.innerHTML = ICON_DELETE;
  deleteBtn.dataset.focusKey = `delete-${entry.id}`;
  deleteBtn.setAttribute("aria-label", t(locale, "deleteForeverAction"));
  deleteBtn.title = t(locale, "deleteForeverAction");
  deleteBtn.addEventListener("click", () => onDeleteForever(entry));

  actionsEl.append(restoreBtn, deleteBtn);
  row.append(iconWrap, textWrap, actionsEl);
  return row;
}

// ---------------------------------------------------------------------------
// إجراءات المستخدم
// ---------------------------------------------------------------------------

async function onRestore(entry) {
  try {
    const result = await restoreEntry(entry);
    if (!result.ok) return;

    if (result.mergedIntoExisting) {
      showToast(t(currentLocale, "restoredMergedToast"), "success");
    } else if (result.alreadyExists) {
      showToast(t(currentLocale, "alreadyExistsToast"), "success");
    } else if (result.recreatedCollection) {
      showToast(t(currentLocale, "restoredRecreatedToast"), "success");
    } else {
      showToast(t(currentLocale, "restoredToast"), "success");
    }
  } catch (err) {
    console.error("[Keepit trash] restore failed", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  }
}

async function onDeleteForever(entry) {
  const confirmed = await confirmDestructive({
    titleId: `${TITLE_ID}-confirm`,
    titleText: t(currentLocale, "confirmDeleteForeverTitle"),
    message: t(currentLocale, "confirmDeleteForeverDesc"),
    confirmLabel: t(currentLocale, "deleteForeverAction"),
    cancelLabel: t(currentLocale, "cancel"),
    closeLabel: t(currentLocale, "close"),
  });
  if (!confirmed) return;

  await deleteEntryPermanently(entry.id);
  showToast(t(currentLocale, "deletedForeverToast"), "success");
}

async function onEmptyTrash() {
  const confirmed = await confirmDestructive({
    titleId: `${TITLE_ID}-confirm-empty`,
    titleText: t(currentLocale, "confirmEmptyTrashTitle"),
    message: t(currentLocale, "confirmEmptyTrashDesc"),
    confirmLabel: t(currentLocale, "emptyTrashAction"),
    cancelLabel: t(currentLocale, "cancel"),
    closeLabel: t(currentLocale, "close"),
  });
  if (!confirmed) return;

  await emptyTrash();
  showToast(t(currentLocale, "emptiedToast"), "success");
}

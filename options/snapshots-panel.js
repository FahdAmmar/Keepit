/**
 * options/snapshots-panel.js
 * ---------------------------------------------------------------------------
 * يُضيف نقطة دخول لميزة "النسخ الاحتياطية" داخل شريط أدوات صفحة الخيارات،
 * دون تعديل main.js إطلاقًا — بنفس تقنية options/local-sync-panel.js
 * وoptions/trash-panel.js تمامًا: ننتظر ظهور .options__topbar-actions
 * (يُبنى ديناميكيًا بواسطة main.js) ثم نُلحق بها زرًّا جديدًا.
 *
 * كل القراءة/الكتابة الفعلية تمر عبر snapshots/store.js؛ هذا الملف مسؤول
 * فقط عن الواجهة والتحكم.
 */
import { waitForElement, openAccessibleDialog, showToast, rerenderPreservingFocus, reattachIfDetached } from "../local-sync/dom-utils.js";
import { confirmDestructive } from "../shared/confirm-dialog.js";
import { formatRelativeTime, formatAbsoluteDateTime } from "../shared/format-time.js";
import {
  readSnapshots,
  takeManualSnapshot,
  restoreSnapshot,
  deleteSnapshot,
  buildSnapshotDownloadPayload,
} from "../snapshots/store.js";
import { t, resolveLocale } from "../snapshots/i18n.js";
import {
  SNAPSHOTS_KEY,
  KEEPIT_LOCALE_KEY,
  KEEP_RECENT_COUNT,
  KEEP_DAILY_DAYS,
  MAX_AGE_DAYS,
} from "../snapshots/constants.js";

const ICON_HISTORY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5A8 8 0 1 1 5.5 15M4 9.5V4M4 9.5h5.5M12 8v4.5l3 2"/></svg>`;
const ICON_DOWNLOAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 18.5h14"/></svg>`;
const ICON_DELETE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5M6.5 6.5v12A1.5 1.5 0 0 0 8 20h8a1.5 1.5 0 0 0 1.5-1.5v-12M10 10.5v6M14 10.5v6"/></svg>`;
const ICON_RESTORE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5A8 8 0 1 1 5.5 15M4 9.5V4M4 9.5h5.5"/></svg>`;

const TITLE_ID = "keepit-snap-title";

let currentLocale = "ar";
let currentSnapshots = [];
/** @type {(() => void) | null} */
let activeDialogRefresh = null;
/** @type {HTMLButtonElement | null} */
let triggerBtnEl = null;

init();

async function init() {
  const [snapshots, localeData] = await Promise.all([
    readSnapshots(),
    chrome.storage.local.get(KEEPIT_LOCALE_KEY),
  ]);
  currentSnapshots = snapshots;
  currentLocale = resolveLocale(localeData[KEEPIT_LOCALE_KEY]);

  chrome.storage.onChanged.addListener(handleStorageChange);

  const container = await waitForElement(".options__topbar-actions");
  if (!container) return;
  mountTriggerButton(container);
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "local") return;

  if (SNAPSHOTS_KEY in changes) {
    const snapshots = changes[SNAPSHOTS_KEY].newValue?.snapshots;
    currentSnapshots = Array.isArray(snapshots) ? snapshots.slice().sort((a, b) => b.takenAt - a.takenAt) : [];
    activeDialogRefresh?.();
  }
  if (KEEPIT_LOCALE_KEY in changes) {
    currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
    updateTriggerAria();
    activeDialogRefresh?.();
    if (triggerBtnEl) void reattachIfDetached(".options__topbar-actions", triggerBtnEl);
  }
}

// ---------------------------------------------------------------------------
// زر التفعيل في شريط الأدوات
// ---------------------------------------------------------------------------

function mountTriggerButton(container) {
  triggerBtnEl = document.createElement("button");
  triggerBtnEl.type = "button";
  triggerBtnEl.className = "btn btn--icon";
  triggerBtnEl.innerHTML = ICON_HISTORY;
  triggerBtnEl.addEventListener("click", openPanel);
  updateTriggerAria();
  container.append(triggerBtnEl);
}

function updateTriggerAria() {
  if (!triggerBtnEl) return;
  triggerBtnEl.setAttribute("aria-label", t(currentLocale, "triggerLabel"));
  triggerBtnEl.title = t(currentLocale, "triggerLabel");
}

// ---------------------------------------------------------------------------
// نافذة اللوحة
// ---------------------------------------------------------------------------

function openPanel() {
  const bodyEl = document.createElement("div");
  bodyEl.className = "keepit-snap-body";
  renderBody(bodyEl);

  openAccessibleDialog({
    titleId: TITLE_ID,
    titleText: t(currentLocale, "panelTitle"),
    bodyEl,
    closeLabel: t(currentLocale, "close"),
    extraDialogClass: "dialog--lg keepit-snap-dialog",
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
  intro.className = "keepit-snap-intro";
  intro.textContent = t(locale, "panelIntro");
  container.append(intro);

  const takeBtn = document.createElement("button");
  takeBtn.type = "button";
  takeBtn.className = "btn btn--secondary btn--sm keepit-snap-take-btn";
  takeBtn.dataset.focusKey = "take-snapshot";
  takeBtn.textContent = t(locale, "takeSnapshotAction");
  takeBtn.addEventListener("click", () => onTakeSnapshot(takeBtn));
  container.append(takeBtn);

  if (currentSnapshots.length === 0) {
    container.append(buildEmptyState(locale));
  } else {
    const list = document.createElement("div");
    list.className = "keepit-snap-list";
    for (const snapshot of currentSnapshots) {
      list.append(buildSnapshotRow(snapshot, locale));
    }
    container.append(list);
  }

  const note = document.createElement("p");
  note.className = "keepit-snap-note";
  note.textContent = t(locale, "retentionNote", {
    recent: KEEP_RECENT_COUNT,
    daily: KEEP_DAILY_DAYS,
    maxAge: MAX_AGE_DAYS,
  });
  container.append(note);
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

function buildSnapshotRow(snapshot, locale) {
  const row = document.createElement("div");
  row.className = "keepit-snap-row";

  const textWrap = document.createElement("div");
  textWrap.className = "keepit-snap-row__text";

  const topLine = document.createElement("div");
  topLine.className = "keepit-snap-row__top";

  const badge = document.createElement("span");
  badge.className = `keepit-snap-badge keepit-snap-badge--${snapshot.trigger}`;
  badge.textContent = t(locale, snapshot.trigger === "manual" ? "triggerManual" : "triggerAuto");

  const timeEl = document.createElement("span");
  timeEl.className = "keepit-snap-row__time";
  timeEl.textContent = formatRelativeTime(snapshot.takenAt, locale);
  timeEl.title = formatAbsoluteDateTime(snapshot.takenAt, locale);

  topLine.append(badge, timeEl);

  const summaryEl = document.createElement("div");
  summaryEl.className = "keepit-snap-row__summary";
  summaryEl.textContent = t(locale, "snapshotSummary", {
    collections: snapshot.collectionsCount,
    items: snapshot.itemsCount,
  });

  textWrap.append(topLine, summaryEl);

  const actionsEl = document.createElement("div");
  actionsEl.className = "keepit-snap-row__actions";

  const restoreBtn = document.createElement("button");
  restoreBtn.type = "button";
  restoreBtn.className = "btn btn--icon";
  restoreBtn.innerHTML = ICON_RESTORE;
  restoreBtn.dataset.focusKey = `restore-${snapshot.id}`;
  restoreBtn.setAttribute("aria-label", t(locale, "restoreAction"));
  restoreBtn.title = t(locale, "restoreAction");
  restoreBtn.addEventListener("click", () => openRestoreDialog(snapshot));

  const downloadBtn = document.createElement("button");
  downloadBtn.type = "button";
  downloadBtn.className = "btn btn--icon";
  downloadBtn.innerHTML = ICON_DOWNLOAD;
  downloadBtn.dataset.focusKey = `download-${snapshot.id}`;
  downloadBtn.setAttribute("aria-label", t(locale, "downloadAction"));
  downloadBtn.title = t(locale, "downloadAction");
  downloadBtn.addEventListener("click", () => onDownload(snapshot));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn--icon btn--danger";
  deleteBtn.innerHTML = ICON_DELETE;
  deleteBtn.dataset.focusKey = `delete-${snapshot.id}`;
  deleteBtn.setAttribute("aria-label", t(locale, "deleteAction"));
  deleteBtn.title = t(locale, "deleteAction");
  deleteBtn.addEventListener("click", () => onDelete(snapshot));

  actionsEl.append(restoreBtn, downloadBtn, deleteBtn);
  row.append(textWrap, actionsEl);
  return row;
}

// ---------------------------------------------------------------------------
// إجراءات المستخدم
// ---------------------------------------------------------------------------

async function onTakeSnapshot(btn) {
  btn.disabled = true;
  try {
    await takeManualSnapshot();
    showToast(t(currentLocale, "snapshotTakenToast"), "success");
  } catch (err) {
    console.error("[Keepit snapshots] manual snapshot failed", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  } finally {
    btn.disabled = false;
  }
}

function openRestoreDialog(snapshot) {
  const locale = currentLocale;
  const bodyEl = document.createElement("div");
  bodyEl.className = "keepit-snap-restore-body";

  let selectedMode = "merge";
  const groupEl = document.createElement("div");
  groupEl.className = "option-card-group";

  const mergeCard = buildModeCard(
    "restore-mode",
    "merge",
    t(locale, "restoreModeMergeTitle"),
    t(locale, "restoreModeMergeDesc"),
    true,
    (value) => (selectedMode = value),
  );
  const replaceCard = buildModeCard(
    "restore-mode",
    "replace",
    t(locale, "restoreModeReplaceTitle"),
    t(locale, "restoreModeReplaceDesc"),
    false,
    (value) => (selectedMode = value),
  );
  groupEl.append(mergeCard, replaceCard);

  const actions = document.createElement("div");
  actions.className = "dialog__actions";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn--ghost";
  cancelBtn.textContent = t(locale, "cancel");

  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "btn btn--primary";
  confirmBtn.textContent = t(locale, "restoreAction");

  actions.append(cancelBtn, confirmBtn);
  bodyEl.append(groupEl, actions);

  const { close } = openAccessibleDialog({
    titleId: `${TITLE_ID}-restore`,
    titleText: t(locale, "restoreDialogTitle", { time: formatAbsoluteDateTime(snapshot.takenAt, locale) }),
    bodyEl,
    closeLabel: t(locale, "close"),
    extraDialogClass: "dialog--lg",
  });

  cancelBtn.addEventListener("click", () => close());
  confirmBtn.addEventListener("click", async () => {
    close();
    if (selectedMode === "replace") {
      const confirmed = await confirmDestructive({
        titleId: `${TITLE_ID}-restore-confirm`,
        titleText: t(locale, "restoreModeReplaceTitle"),
        message: t(locale, "restoreModeReplaceDesc"),
        confirmLabel: t(locale, "restoreAction"),
        cancelLabel: t(locale, "cancel"),
        closeLabel: t(locale, "close"),
      });
      if (!confirmed) return;
    }
    await doRestore(snapshot.id, selectedMode);
  });
}

function buildModeCard(groupName, value, title, desc, checked, onSelect) {
  const card = document.createElement("label");
  card.className = checked ? "option-card is-selected" : "option-card";

  const input = document.createElement("input");
  input.type = "radio";
  input.name = groupName;
  input.value = value;
  input.checked = checked;
  input.addEventListener("change", () => {
    onSelect(value);
    for (const el of card.parentElement?.querySelectorAll(".option-card") ?? []) {
      el.classList.remove("is-selected");
    }
    card.classList.add("is-selected");
  });

  const textWrap = document.createElement("span");
  const titleEl = document.createElement("span");
  titleEl.className = "option-card__title";
  titleEl.textContent = title;
  const descEl = document.createElement("span");
  descEl.className = "option-card__desc";
  descEl.textContent = desc;
  textWrap.append(titleEl, descEl);

  card.append(input, textWrap);
  return card;
}

async function doRestore(snapshotId, mode) {
  try {
    const result = await restoreSnapshot(snapshotId, mode);
    if (result.ok) showToast(t(currentLocale, "restoredToast"), "success");
  } catch (err) {
    console.error("[Keepit snapshots] restore failed", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  }
}

function onDownload(snapshot) {
  try {
    const payload = buildSnapshotDownloadPayload(snapshot);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date(snapshot.takenAt).toISOString().slice(0, 19).replace(/[:T]/g, "-");

    const a = document.createElement("a");
    a.href = url;
    a.download = `keepit-backup-${dateStamp}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    showToast(t(currentLocale, "downloadedToast"), "success");
  } catch (err) {
    console.error("[Keepit snapshots] download failed", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  }
}

async function onDelete(snapshot) {
  const confirmed = await confirmDestructive({
    titleId: `${TITLE_ID}-delete-confirm`,
    titleText: t(currentLocale, "confirmDeleteTitle"),
    message: t(currentLocale, "confirmDeleteDesc"),
    confirmLabel: t(currentLocale, "deleteAction"),
    cancelLabel: t(currentLocale, "cancel"),
    closeLabel: t(currentLocale, "close"),
  });
  if (!confirmed) return;

  await deleteSnapshot(snapshot.id);
  showToast(t(currentLocale, "deletedToast"), "success");
}

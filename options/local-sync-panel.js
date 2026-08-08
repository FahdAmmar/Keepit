/**
 * options/local-sync-panel.js
 * ---------------------------------------------------------------------------
 * يُضيف نقطة دخول لإعدادات "المزامنة المحلية" داخل شريط أدوات صفحة
 * الخيارات، دون تعديل main.js (الحزمة المضغوطة الأصلية) إطلاقًا.
 *
 * التقنية: ننتظر ظهور .options__topbar-actions (يُبنى ديناميكيًا بواسطة
 * main.js) ثم نُلحق بها زرًّا جديدًا. هذا اقتران ضعيف (loose coupling) على
 * اسم صنف CSS من حزمة خارجية لا نتحكم بمصدرها — موثَّق هنا بوضوح: إن
 * أُعيد بناء main.js مستقبلاً وتغيّر اسم هذا الصنف، يكفي تحديث السطر
 * الذي يستدعي waitForElement أدناه.
 *
 * كل الكتابة الفعلية على القرص تمر عبر local-sync/writer.js (نفس الدالة
 * المستخدمة من مستند offscreen) — هذا الملف مسؤول فقط عن الواجهة والتحكم.
 */
import { waitForElement, openAccessibleDialog, showToast, rerenderPreservingFocus, reattachIfDetached } from "../local-sync/dom-utils.js";
import { getDirectoryHandle, saveDirectoryHandle } from "../local-sync/handle-store.js";
import { writeStateToLocalFolder } from "../local-sync/writer.js";
import { pullFromLocalFolder } from "../local-sync/merge-pull.js";
import { t, resolveLocale } from "../local-sync/i18n.js";
import {
  STATUS_KEY,
  KEEPIT_STATE_KEY,
  KEEPIT_LOCALE_KEY,
  DEFAULT_FILE_NAME,
  PULL_MODE,
  SYNC_ERRORS,
} from "../local-sync/constants.js";

const DEFAULT_STATUS = Object.freeze({
  enabled: false,
  fileName: DEFAULT_FILE_NAME,
  folderName: /** @type {string | null} */ (null),
  lastSyncedAt: /** @type {number | null} */ (null),
  lastError: /** @type {string | null} */ (null),
  pullMode: PULL_MODE.REPLACE,
  lastPulledAt: /** @type {number | null} */ (null),
  lastPullError: /** @type {string | null} */ (null),
});

const FS_ACCESS_SUPPORTED = typeof window !== "undefined" && "showDirectoryPicker" in window;

const ICON_FOLDER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.25A1.75 1.75 0 0 1 5.25 5.5h3.19c.35 0 .68.14.93.39l1.13 1.13c.25.25.58.39.93.39H18.75A1.75 1.75 0 0 1 20.5 9.16v7.59a1.75 1.75 0 0 1-1.75 1.75H5.25A1.75 1.75 0 0 1 3.5 16.75z"/></svg>`;
const ICON_CLOSE_TITLE_ID = "keepit-ls-title";
const FILENAME_INPUT_ID = "keepit-ls-filename";

/** @type {typeof DEFAULT_STATUS} */
let currentStatus = DEFAULT_STATUS;
/** @type {"ar" | "en"} */
let currentLocale = "ar";
/** @type {HTMLButtonElement | null} */
let triggerBtnEl = null;
/** @type {HTMLSpanElement | null} */
let triggerDotEl = null;
/** يُضبط أثناء فتح الحوار فقط؛ يُستدعى لإعادة رسم محتواه عند أي تغيّر
 *  خارجي ذي صلة (حالة المزامنة أو اللغة)، ويُصفَّر عند الإغلاق. */
let activeDialogRefresh = /** @type {(() => void) | null} */ (null);

init();

async function init() {
  const [status, locale] = await Promise.all([readStatus(), readLocalePreference()]);
  currentStatus = status;
  currentLocale = locale;

  chrome.storage.onChanged.addListener(handleStorageChange);

  const container = await waitForElement(".options__topbar-actions");
  if (!container) return; // شريط الأدوات لم يظهر خلال المهلة؛ لا نُفشل الصفحة، نتجاهل بصمت
  mountTriggerButton(container);

  // فحص "سحب" فوري وصامت عند فتح صفحة الخيارات، بدل انتظار دورة المنبّه
  // التالية (قد تصل لدقيقتين). لا نعرض إشعارًا إلا إذا تغيّر شيء فعليًا،
  // حتى لا نُزعج المستخدم بإشعار "لا جديد" في كل مرة يفتح فيها الإعدادات.
  if (FS_ACCESS_SUPPORTED && currentStatus.enabled && currentStatus.folderName) {
    void checkNow(null);
  }
}

// ---------------------------------------------------------------------------
// قراءة/كتابة الحالة
// ---------------------------------------------------------------------------

async function readStatus() {
  const data = await chrome.storage.local.get(STATUS_KEY);
  return { ...DEFAULT_STATUS, ...(data[STATUS_KEY] || {}) };
}

async function persistStatus(patch) {
  const next = { ...currentStatus, ...patch };
  currentStatus = next;
  await chrome.storage.local.set({ [STATUS_KEY]: next });
  return next;
}

async function readAppState() {
  const data = await chrome.storage.local.get(KEEPIT_STATE_KEY);
  return data[KEEPIT_STATE_KEY] ?? null;
}

async function readLocalePreference() {
  const data = await chrome.storage.local.get(KEEPIT_LOCALE_KEY);
  return resolveLocale(data[KEEPIT_LOCALE_KEY]);
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "local") return;

  if (STATUS_KEY in changes) {
    currentStatus = { ...DEFAULT_STATUS, ...(changes[STATUS_KEY].newValue || {}) };
    updateTriggerDot();
    activeDialogRefresh?.();
  }
  if (KEEPIT_LOCALE_KEY in changes) {
    currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
    updateTriggerAria();
    activeDialogRefresh?.();
    if (triggerBtnEl) void reattachIfDetached(".options__topbar-actions", triggerBtnEl, (c, el) => c.prepend(el));
  }
}

// ---------------------------------------------------------------------------
// زر التفعيل في شريط الأدوات
// ---------------------------------------------------------------------------

function mountTriggerButton(container) {
  triggerBtnEl = document.createElement("button");
  triggerBtnEl.type = "button";
  triggerBtnEl.className = "btn btn--icon";
  triggerBtnEl.innerHTML = ICON_FOLDER;
  triggerBtnEl.addEventListener("click", openPanel);

  triggerDotEl = document.createElement("span");
  triggerDotEl.className = "keepit-ls-dot";
  triggerBtnEl.append(triggerDotEl);

  updateTriggerAria();
  updateTriggerDot();

  container.prepend(triggerBtnEl);
}

function updateTriggerAria() {
  if (!triggerBtnEl) return;
  triggerBtnEl.setAttribute("aria-label", t(currentLocale, "triggerLabel"));
  triggerBtnEl.title = t(currentLocale, "triggerLabel");
}

function updateTriggerDot() {
  if (!triggerDotEl) return;
  triggerDotEl.dataset.state = statusVariant();
}

function statusVariant() {
  if (!FS_ACCESS_SUPPORTED || !currentStatus.folderName || !currentStatus.enabled) return "off";
  // نأخذ بعين الاعتبار خطأ الدفع (push) أو السحب (pull) أيهما موجودًا —
  // فشل السحب فقط (مثلًا إذن قراءة/كتابة منتهي في هذا المتصفح تحديدًا)
  // كان يمر دون أي إشارة مرئية على الزر، رغم أنه هو تحديدًا سبب عدم ظهور
  // تعديلات المتصفحات الأخرى هنا.
  const activeError = currentStatus.lastError || currentStatus.lastPullError;
  if (activeError) {
    return activeError === SYNC_ERRORS.PERMISSION_REQUIRED ? "warning" : "error";
  }
  return "ok";
}

// ---------------------------------------------------------------------------
// نافذة الإعدادات
// ---------------------------------------------------------------------------

function openPanel() {
  const bodyEl = document.createElement("div");
  bodyEl.className = "keepit-ls-body";
  renderBody(bodyEl);

  const { close } = openAccessibleDialog({
    titleId: ICON_CLOSE_TITLE_ID,
    titleText: t(currentLocale, "panelTitle"),
    bodyEl,
    closeLabel: t(currentLocale, "close"),
    extraDialogClass: "dialog--lg keepit-ls-dialog",
    onClose: () => {
      activeDialogRefresh = null;
    },
  });

  activeDialogRefresh = () => rerenderPreservingFocus(bodyEl, () => renderBody(bodyEl));
  // متاحة إن احتجنا لاحقًا لإغلاق برمجي؛ غير مستخدمة حاليًا خارج هذا النطاق.
  void close;
}

function renderBody(container) {
  container.replaceChildren();
  const locale = currentLocale;

  if (!FS_ACCESS_SUPPORTED) {
    container.append(buildUnsupportedNotice(locale));
    return;
  }

  container.append(
    buildIntro(locale),
    buildStatusRow(locale),
    buildFolderCard(locale),
    buildFileNameField(locale),
    buildGitignoreNote(locale),
    buildMultiBrowserNote(locale),
    buildActions(locale, container),
  );

  if (currentStatus.folderName) {
    container.append(buildPullSection(locale, container));
  }
}

function buildUnsupportedNotice(locale) {
  const box = document.createElement("div");
  box.className = "option-card";
  const title = document.createElement("div");
  title.className = "option-card__title";
  title.textContent = t(locale, "unsupportedTitle");
  const desc = document.createElement("div");
  desc.className = "option-card__desc";
  desc.textContent = t(locale, "unsupportedBody");
  box.append(title, desc);
  return box;
}

function buildIntro(locale) {
  const p = document.createElement("p");
  p.className = "keepit-ls-intro";
  p.textContent = t(locale, "panelIntro");
  return p;
}

function buildStatusRow(locale) {
  const row = document.createElement("div");
  row.className = "keepit-ls-status";
  row.setAttribute("role", "status");
  row.setAttribute("aria-live", "polite");

  const dot = document.createElement("span");
  dot.className = "keepit-ls-dot keepit-ls-dot--inline";
  dot.dataset.state = statusVariant();

  const text = document.createElement("span");
  text.textContent = buildStatusText(locale);

  row.append(dot, text);
  return row;
}

function buildStatusText(locale) {
  if (!currentStatus.folderName) return t(locale, "statusNotConfigured");
  if (currentStatus.lastError) return t(locale, errorMessageKey(currentStatus.lastError));
  if (!currentStatus.enabled) return t(locale, "statusDisabled");
  if (!currentStatus.lastSyncedAt) return t(locale, "statusNeverSynced");
  return t(locale, "statusSyncedAt", { time: formatRelativeTime(currentStatus.lastSyncedAt, locale) });
}

function buildFolderCard(locale) {
  const card = document.createElement("div");
  card.className = "option-card";
  const title = document.createElement("div");
  title.className = "option-card__title";
  title.textContent = t(locale, "folderLabel");
  const value = document.createElement("div");
  value.className = "option-card__desc";
  value.textContent = currentStatus.folderName || t(locale, "statusNotConfigured");
  card.append(title, value);
  return card;
}

function buildFileNameField(locale) {
  const field = document.createElement("div");
  field.className = "field";

  const label = document.createElement("label");
  label.className = "field__label";
  label.htmlFor = FILENAME_INPUT_ID;
  label.textContent = t(locale, "fileNameLabel");

  const input = document.createElement("input");
  input.type = "text";
  input.id = FILENAME_INPUT_ID;
  input.className = "input";
  input.dataset.focusKey = "filename-input";
  input.value = currentStatus.fileName || DEFAULT_FILE_NAME;
  input.spellcheck = false;
  input.autocomplete = "off";
  input.addEventListener("change", () => onFileNameCommit(input.value));

  const hint = document.createElement("div");
  hint.className = "field__hint";
  hint.textContent = t(locale, "fileNameHint");

  field.append(label, input, hint);
  return field;
}

function buildGitignoreNote(locale) {
  const note = document.createElement("p");
  note.className = "keepit-ls-note";
  note.textContent = t(locale, "gitignoreNote");
  return note;
}

function buildMultiBrowserNote(locale) {
  const note = document.createElement("p");
  note.className = "keepit-ls-note";
  note.textContent = t(locale, "multiBrowserNote");
  return note;
}

function buildPullSection(locale, bodyContainer) {
  const section = document.createElement("div");
  section.className = "keepit-ls-pull-section";

  const title = document.createElement("h3");
  title.className = "keepit-ls-section-title";
  title.textContent = t(locale, "pullSectionTitle");

  const intro = document.createElement("p");
  intro.className = "keepit-ls-intro";
  intro.textContent = t(locale, "pullIntro");

  section.append(title, intro, buildPullModeGroup(locale, bodyContainer), buildPullStatusRow(locale));

  const checkNowBtn = document.createElement("button");
  checkNowBtn.type = "button";
  checkNowBtn.className = "btn btn--secondary";
  checkNowBtn.dataset.focusKey = "check-now";
  checkNowBtn.textContent = t(locale, "checkNowAction");
  checkNowBtn.disabled = !currentStatus.enabled;
  checkNowBtn.addEventListener("click", () => checkNow(bodyContainer));

  const actionsRow = document.createElement("div");
  actionsRow.className = "dialog__actions keepit-ls-actions";
  actionsRow.append(checkNowBtn);
  section.append(actionsRow);

  return section;
}

function buildPullModeGroup(locale, bodyContainer) {
  const group = document.createElement("div");
  group.className = "option-card-group";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-labelledby", "keepit-ls-pull-mode-label");

  const label = document.createElement("div");
  label.className = "field__label";
  label.id = "keepit-ls-pull-mode-label";
  label.textContent = t(locale, "pullModeLabel");
  group.append(label);

  group.append(
    buildPullModeOption(locale, bodyContainer, {
      value: PULL_MODE.MERGE,
      titleKey: "pullModeMergeTitle",
      descKey: "pullModeMergeDesc",
    }),
    buildPullModeOption(locale, bodyContainer, {
      value: PULL_MODE.REPLACE,
      titleKey: "pullModeReplaceTitle",
      descKey: "pullModeReplaceDesc",
      warningKey: "pullModeReplaceWarning",
    }),
  );

  return group;
}

/**
 * @param {string} locale
 * @param {HTMLElement} bodyContainer
 * @param {{value: string, titleKey: string, descKey: string, warningKey?: string}} option
 */
function buildPullModeOption(locale, bodyContainer, { value, titleKey, descKey, warningKey }) {
  const currentMode = currentStatus.pullMode || PULL_MODE.REPLACE;
  const isSelected = currentMode === value;

  const card = document.createElement("label");
  card.className = isSelected ? "option-card is-selected" : "option-card";

  const input = document.createElement("input");
  input.type = "radio";
  input.name = "keepit-ls-pull-mode";
  input.value = value;
  input.checked = isSelected;
  input.dataset.focusKey = `pull-mode-${value}`;
  input.addEventListener("change", () => onPullModeChange(value, bodyContainer));

  const textWrap = document.createElement("span");
  const titleEl = document.createElement("span");
  titleEl.className = "option-card__title";
  titleEl.textContent = t(locale, titleKey);
  const descEl = document.createElement("span");
  descEl.className = "option-card__desc";
  descEl.textContent = t(locale, descKey);
  textWrap.append(titleEl, descEl);

  if (warningKey && value === PULL_MODE.REPLACE) {
    const warnEl = document.createElement("span");
    warnEl.className = "option-card__desc keepit-ls-warning";
    warnEl.textContent = t(locale, warningKey);
    textWrap.append(warnEl);
  }

  card.append(input, textWrap);
  return card;
}

function buildPullStatusRow(locale) {
  const row = document.createElement("div");
  row.className = "keepit-ls-status";
  row.setAttribute("role", "status");
  row.setAttribute("aria-live", "polite");

  const dot = document.createElement("span");
  dot.className = "keepit-ls-dot keepit-ls-dot--inline";
  dot.dataset.state = currentStatus.lastPullError ? pullErrorVariant() : "ok";

  const text = document.createElement("span");
  text.textContent = buildPullStatusText(locale);

  row.append(dot, text);
  return row;
}

function pullErrorVariant() {
  return currentStatus.lastPullError === SYNC_ERRORS.PERMISSION_REQUIRED ? "warning" : "error";
}

function buildPullStatusText(locale) {
  if (currentStatus.lastPullError) return t(locale, errorMessageKey(currentStatus.lastPullError));
  if (!currentStatus.lastPulledAt) return t(locale, "statusNeverPulled");
  return t(locale, "statusPulledAt", { time: formatRelativeTime(currentStatus.lastPulledAt, locale) });
}

function buildActions(locale, bodyContainer) {
  const actions = document.createElement("div");
  actions.className = "dialog__actions keepit-ls-actions";

  const chooseBtn = document.createElement("button");
  chooseBtn.type = "button";
  chooseBtn.className = "btn btn--secondary";
  chooseBtn.dataset.focusKey = "choose-folder";
  chooseBtn.textContent = t(locale, currentStatus.folderName ? "changeFolderAction" : "chooseFolderAction");
  chooseBtn.addEventListener("click", () => onChooseFolder(bodyContainer));
  actions.append(chooseBtn);

  if (currentStatus.folderName && currentStatus.lastError === SYNC_ERRORS.PERMISSION_REQUIRED) {
    const reconnectBtn = document.createElement("button");
    reconnectBtn.type = "button";
    reconnectBtn.className = "btn btn--secondary";
    reconnectBtn.dataset.focusKey = "reconnect";
    reconnectBtn.textContent = t(locale, "reconnectAction");
    reconnectBtn.addEventListener("click", () => onReconnect(bodyContainer));
    actions.append(reconnectBtn);
  }

  if (currentStatus.folderName) {
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "btn btn--ghost";
    toggleBtn.dataset.focusKey = "toggle-enabled";
    toggleBtn.setAttribute("aria-pressed", String(currentStatus.enabled));
    toggleBtn.textContent = t(locale, currentStatus.enabled ? "disableAction" : "enableAction");
    toggleBtn.addEventListener("click", () => onToggleEnabled(bodyContainer));
    actions.append(toggleBtn);
  }

  const syncNowBtn = document.createElement("button");
  syncNowBtn.type = "button";
  syncNowBtn.className = "btn btn--primary";
  syncNowBtn.dataset.focusKey = "sync-now";
  syncNowBtn.textContent = t(locale, "syncNowAction");
  syncNowBtn.disabled =
    !currentStatus.folderName ||
    !currentStatus.enabled ||
    currentStatus.lastError === SYNC_ERRORS.PERMISSION_REQUIRED;
  syncNowBtn.addEventListener("click", () => onSyncNowClick(bodyContainer));
  actions.append(syncNowBtn);

  return actions;
}

// ---------------------------------------------------------------------------
// إجراءات المستخدم
// ---------------------------------------------------------------------------

async function onChooseFolder(bodyContainer) {
  try {
    const handle = await window.showDirectoryPicker({
      id: "keepit-local-sync-folder",
      mode: "readwrite",
    });

    // محاولة ترقية الإذن إلى دائم (يعرض المتصفح خيار "السماح في كل
    // زيارة"). ليست حرجة إن فشلت أو رفضها المستخدم — ستُطلب مجددًا عبر
    // زر "منح الإذن مجددًا" عند الحاجة.
    await handle.requestPermission({ mode: "readwrite" }).catch(() => {});

    await saveDirectoryHandle(handle);
    await persistStatus({ enabled: true, folderName: handle.name, lastError: null });

    updateTriggerDot();
    rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
    // أول اتصال فعلي بمجلد: نجبر وضع "دمج" دائمًا هنا بغضّ النظر عن الوضع
    // المُختار مستقبلًا — هذا المتصفح قد يحمل بيانات محلية لم تُزامَن مع أي
    // جهة من قبل، فلا نريد أن يمحوها أول اتصال بصمت.
    await reconcileThenPush(bodyContainer, PULL_MODE.MERGE);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return; // المستخدم أغلق النافذة، ليس خطأً
    console.error("[Keepit local sync] folder pick failed", err);
    await persistStatus({ lastError: SYNC_ERRORS.INTERNAL_ERROR });
    updateTriggerDot();
    rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
  }
}

/**
 * تُستخدَم عند أول اتصال بمجلد، أو عند إعادة الاتصال بعد انقطاع إذن. في
 * كلتا الحالتين قد يحتوي الملف بالفعل على تعديلات كتبها متصفح آخر أثناء
 * غياب هذا المتصفح (لم يُربَط بعد، أو انقطع إذنه مؤقتًا). الكتابة المباشرة
 * (push) في هذه اللحظة كانت تستبدل محتوى الملف ببيانات هذا المتصفح فقط،
 * فتمحو بصمت أي تصنيف/موقع أضافه المتصفح الآخر خلال تلك الفترة. لذلك نسحب
 * وندمج أولًا بالوضع المُمرَّر، ثم نكتب الناتج — لا فقدان بيانات عند لحظة
 * الربط/إعادة الربط تحديدًا.
 *
 * الوضع يختلف حسب السياق (راجع مواضع الاستدعاء):
 *   - أول اتصال: MERGE دائمًا (أمان — لا حذف أبدًا)، حتى لو كان الوضع
 *     المُختار للمستخدم هو "استبدال"، لأن هذا المتصفح قد يحمل بيانات محلية
 *     لم تصل للملف المشترك بعد.
 *   - إعادة الاتصال (كان متصلاً من قبل، انقطع إذنه فقط): وضع المستخدم
 *     المُختار كما هو (عادة "استبدال")، لأن هذا المتصفح جزء فعلي من مجموعة
 *     المزامنة أصلاً، ويجب أن يلتقط أي حذف حصل في غيابه، لا أن يتجاهله.
 * @param {HTMLElement} bodyContainer
 * @param {string} mode - أحد قيم PULL_MODE
 */
async function reconcileThenPush(bodyContainer, mode) {
  const pullResult = await pullFromLocalFolder({
    fileName: currentStatus.fileName,
    mode,
  });
  await persistStatus({
    lastPulledAt: Date.now(),
    lastPullError: pullResult.ok ? null : pullResult.error,
  });
  await syncNow(bodyContainer);
}

async function onReconnect(bodyContainer) {
  try {
    const handle = await getDirectoryHandle();
    if (!handle) {
      await persistStatus({ lastError: SYNC_ERRORS.NOT_CONFIGURED });
      rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
      return;
    }
    const result = await handle.requestPermission({ mode: "readwrite" });
    if (result === "granted") {
      await persistStatus({ lastError: null });
      rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
      // إعادة اتصال، وليس اتصالاً أول — نحترم وضع المستخدم المُختار (عادة
      // "استبدال") ليلتقط أي حذف حصل في متصفحات أخرى أثناء غياب هذا
      // المتصفح، بدل تجاهله كما كان يحدث بفرض "دمج" هنا سابقًا.
      await reconcileThenPush(bodyContainer, currentStatus.pullMode || PULL_MODE.REPLACE);
      return;
    }
    await persistStatus({ lastError: SYNC_ERRORS.PERMISSION_REQUIRED });
  } catch (err) {
    console.error("[Keepit local sync] reconnect failed", err);
    await persistStatus({ lastError: SYNC_ERRORS.INTERNAL_ERROR });
  }
  updateTriggerDot();
  rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
}

async function onToggleEnabled(bodyContainer) {
  const nextEnabled = !currentStatus.enabled;
  await persistStatus({ enabled: nextEnabled });
  updateTriggerDot();
  rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
  if (nextEnabled) await syncNow(bodyContainer);
}

async function onFileNameCommit(rawValue) {
  const trimmed = rawValue.trim();
  await persistStatus({ fileName: trimmed || DEFAULT_FILE_NAME });
  if (currentStatus.folderName && currentStatus.enabled) {
    await syncNow(null);
  }
}

async function onSyncNowClick(bodyContainer) {
  await syncNow(bodyContainer);
}

async function onPullModeChange(mode, bodyContainer) {
  await persistStatus({ pullMode: mode });
  rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
}

/**
 * @param {HTMLElement | null} bodyContainer - يُعاد رسمه بعد النتيجة إن مُرِّر.
 * لا يعرض إشعار "لا جديد" عند الاستدعاء الصامت التلقائي (bodyContainer === null
 * وهذا أول استدعاء عند فتح الصفحة) حتى لا يُزعج المستخدم في كل مرة يفتح فيها
 * الإعدادات دون أن يتغيّر شيء؛ لكنه يعرض إشعار النجاح دائمًا عند وجود تغيير
 * فعلي، وكذلك عند الضغط اليدوي على زر "تحقّق الآن" (bodyContainer غير null).
 */
async function checkNow(bodyContainer) {
  const result = await pullFromLocalFolder({
    fileName: currentStatus.fileName,
    mode: currentStatus.pullMode,
  });

  if (result.ok) {
    await persistStatus({ lastPulledAt: Date.now(), lastPullError: null });
    if (result.changed) {
      const detail =
        result.addedCollections || result.addedItems
          ? t(currentLocale, "pullSuccessToastDetail", {
              collections: result.addedCollections,
              items: result.addedItems,
            })
          : "";
      showToast(t(currentLocale, "pullSuccessToast") + detail, "success");
    } else if (bodyContainer) {
      showToast(t(currentLocale, "pullNoChangesToast"), "success");
    }
  } else {
    await persistStatus({ lastPullError: result.error });
    if (bodyContainer) showToast(t(currentLocale, errorMessageKey(result.error)), "error");
  }

  updateTriggerDot();
  if (bodyContainer) rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
  return result;
}

/**
 * @param {HTMLElement | null} bodyContainer - يُعاد رسمه بعد النتيجة إن مُرِّر؛
 *   null إن كان الاستدعاء من مسار لا يحتاج إعادة رسم فوري (مثل تغيير اسم الملف).
 */
async function syncNow(bodyContainer) {
  const state = await readAppState();
  const result = await writeStateToLocalFolder({ state, fileName: currentStatus.fileName });

  if (result.ok) {
    await persistStatus({ lastSyncedAt: result.syncedAt, lastError: null });
    showToast(t(currentLocale, "syncSuccessToast"), "success");
  } else {
    await persistStatus({ lastError: result.error });
    showToast(t(currentLocale, errorMessageKey(result.error)), "error");
  }

  updateTriggerDot();
  if (bodyContainer) rerenderPreservingFocus(bodyContainer, () => renderBody(bodyContainer));
  return result;
}

// ---------------------------------------------------------------------------
// أدوات نصية
// ---------------------------------------------------------------------------

function errorMessageKey(error) {
  switch (error) {
    case SYNC_ERRORS.NOT_CONFIGURED:
      return "errorNotConfigured";
    case SYNC_ERRORS.PERMISSION_REQUIRED:
      return "errorPermissionRequired";
    case SYNC_ERRORS.FOLDER_MISSING:
      return "errorFolderMissing";
    case SYNC_ERRORS.WRITE_FAILED:
      return "errorWriteFailed";
    case SYNC_ERRORS.READ_FAILED:
      return "errorReadFailed";
    case SYNC_ERRORS.INVALID_FILE:
      return "errorInvalidFile";
    case SYNC_ERRORS.TIMEOUT:
      return "errorTimeout";
    case SYNC_ERRORS.INTERNAL_ERROR:
      return "errorInternal";
    default:
      return "errorGeneric";
  }
}

function formatRelativeTime(timestampMs, locale) {
  const diffMin = Math.max(0, Math.round((Date.now() - timestampMs) / 60000));
  if (diffMin < 1) return t(locale, "syncedJustNow");
  if (diffMin < 60) return t(locale, "minutesAgo", { n: diffMin });
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return t(locale, "hoursAgo", { n: diffHr });
  const diffDay = Math.round(diffHr / 24);
  return t(locale, "daysAgo", { n: diffDay });
}

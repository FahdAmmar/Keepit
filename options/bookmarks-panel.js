/**
 * options/bookmarks-panel.js
 * ---------------------------------------------------------------------------
 * يُضيف نقطة دخول لـ"جسر إشارات Chrome المرجعية" داخل شريط أدوات صفحة
 * الخيارات، دون تعديل main.js (الحزمة المضغوطة الأصلية) إطلاقًا — بنفس
 * تقنية trash-panel.js وsnapshots-panel.js وlocal-sync-panel.js تمامًا:
 * ننتظر ظهور .options__topbar-actions ثم نُلحق بها زرًّا جديدًا.
 *
 * ثلاثة مسارات مستقلة داخل حوار واحد:
 *   1) استيراد من شجرة chrome.bookmarks الحيّة (اختيار مجلد).
 *   2) استيراد/تصدير ملف HTML بصيغة Netscape القياسية (متوافق مع أي متصفح).
 *   3) تصدير تصنيف Keepit إلى إشارات Chrome المرجعية.
 *
 * كل القراءة/الكتابة الفعلية تمر عبر bookmarks-bridge/*.js؛ هذا الملف
 * مسؤول فقط عن الواجهة والتحكم — بنفس فصل الاهتمامات المتّبع في كل لوحة
 * أخرى بالمشروع.
 */
import { waitForElement, openAccessibleDialog, showToast, rerenderPreservingFocus, reattachIfDetached } from "../local-sync/dom-utils.js";
import {
  readFoldersForPicker,
  readNormalizedCollectionsFromFolder,
  getOrCreateExportRootFolder,
  exportCollectionToBookmarks,
} from "../bookmarks-bridge/chrome-bookmarks.js";
import { parseNetscapeHtml, flattenToCollections, serializeToNetscapeHtml } from "../bookmarks-bridge/netscape-format.js";
import { readExistingCollections, importNormalizedCollections } from "../bookmarks-bridge/store.js";
import { t, resolveLocale } from "../bookmarks-bridge/i18n.js";
import { KEEPIT_STATE_KEY, KEEPIT_LOCALE_KEY, MAX_IMPORT_FILE_BYTES } from "../bookmarks-bridge/constants.js";

const ICON_BOOKMARK =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.75 4.5A1.75 1.75 0 0 1 8.5 2.75h7A1.75 1.75 0 0 1 17.25 4.5v16l-5.25-3.68-5.25 3.68z"/></svg>';

const TITLE_ID = "keepit-bookmarks-bridge-title";
/** قيمة خاصة في <select> اختيار التصنيف تعني "صدّر كل التصنيفات دفعة
 *  واحدة" — لن تتطابق أبدًا مع أي id حقيقي لتصنيف (crypto.randomUUID()
 *  لا يُنتج هذا الشكل). */
const EXPORT_ALL_VALUE = "__keepit_export_all__";

let currentLocale = "ar";
/** @type {(() => void) | null} */
let activeDialogRefresh = null;
/** @type {HTMLButtonElement | null} */
let triggerBtnEl = null;

init();

async function init() {
  const localeData = await chrome.storage.local.get(KEEPIT_LOCALE_KEY);
  currentLocale = resolveLocale(localeData[KEEPIT_LOCALE_KEY]);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (KEEPIT_LOCALE_KEY in changes) {
      currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
      updateTriggerAria();
      // صفحة الخيارات تُعيد بناء شريط الأدوات (عنصر DOM جديد بالكامل) عند
      // تبديل اللغة، فيُفصَل زرّنا المُلحَق يدويًا بالعنصر القديم عن
      // المستند بصمت — راجع تعليق reattachIfDetached في dom-utils.js.
      if (triggerBtnEl) void reattachIfDetached(".options__topbar-actions", triggerBtnEl);
    }
    if (KEEPIT_STATE_KEY in changes || KEEPIT_LOCALE_KEY in changes) {
      activeDialogRefresh?.();
    }
  });

  const container = await waitForElement(".options__topbar-actions");
  if (!container) return; // شريط الأدوات لم يظهر خلال المهلة؛ لا نُفشل الصفحة، نتجاهل بصمت
  mountTriggerButton(container);
}

function mountTriggerButton(container) {
  triggerBtnEl = document.createElement("button");
  triggerBtnEl.type = "button";
  triggerBtnEl.className = "btn btn--icon";
  triggerBtnEl.innerHTML = ICON_BOOKMARK;
  triggerBtnEl.addEventListener("click", openPanel);
  updateTriggerAria();
  container.append(triggerBtnEl);
}

function updateTriggerAria() {
  if (!triggerBtnEl) return;
  const label = t(currentLocale, "triggerLabel");
  triggerBtnEl.setAttribute("aria-label", label);
  triggerBtnEl.title = label;
}

// ---------------------------------------------------------------------------
// نافذة اللوحة
// ---------------------------------------------------------------------------

function openPanel() {
  const bodyEl = document.createElement("div");
  bodyEl.className = "keepit-bb-body";
  bodyEl.append(buildLoadingNote());

  openAccessibleDialog({
    titleId: TITLE_ID,
    titleText: t(currentLocale, "panelTitle"),
    bodyEl,
    closeLabel: t(currentLocale, "close"),
    extraDialogClass: "keepit-bb-dialog",
    onClose: () => {
      activeDialogRefresh = null;
    },
  });

  activeDialogRefresh = () => {
    void refreshAndRender(bodyEl);
  };
  activeDialogRefresh();
}

function buildLoadingNote() {
  const note = document.createElement("p");
  note.className = "keepit-bb-empty-note";
  note.setAttribute("role", "status");
  note.setAttribute("aria-live", "polite");
  note.textContent = "…";
  return note;
}

/**
 * يجلب البيانات (غير متزامن: chrome.bookmarks + chrome.storage) ثم يستدعي
 * الرسم الفعلي كخطوة متزامنة منفصلة عبر rerenderPreservingFocus — تلك
 * الأداة تتوقّع دالة رسم متزامنة بالتصميم (توثيقها في local-sync/dom-utils.js
 * صريح بهذا الشرط)؛ دمج الجلب والرسم في دالة واحدة غير متزامنة كان سيجعل
 * محاولة استعادة التركيز تُنفَّذ فور استدعاء renderFn() قبل اكتمال
 * Promise.all فعليًا، أي قبل أن يتغيّر أي شيء في DOM — عمليًا كانت ستفشل
 * بصمت في استعادة التركيز بعد كل عملية استيراد/تصدير.
 * @param {HTMLElement} container
 */
async function refreshAndRender(container) {
  const [folders, collections] = await Promise.all([
    readFoldersForPicker().catch(() => []),
    readExistingCollections().catch(() => []),
  ]);
  rerenderPreservingFocus(container, () => renderBodySync(container, folders, collections));
}

function renderBodySync(container, folders, collections) {
  const locale = currentLocale;
  container.replaceChildren(
    buildImportFromChromeSection(locale, folders),
    buildHtmlFileSection(locale, collections),
    buildExportToChromeSection(locale, collections),
  );
}

// ---------------------------------------------------------------------------
// القسم 1: استيراد من إشارات Chrome المرجعية
// ---------------------------------------------------------------------------

function buildImportFromChromeSection(locale, folders) {
  const section = document.createElement("div");
  section.className = "keepit-bb-section";

  const title = document.createElement("h3");
  title.className = "keepit-bb-section__title";
  title.textContent = t(locale, "importFromChromeTitle");

  const desc = document.createElement("p");
  desc.className = "keepit-bb-section__desc";
  desc.textContent = t(locale, "importFromChromeDesc");

  section.append(title, desc);

  if (folders.length === 0) {
    const empty = document.createElement("p");
    empty.className = "keepit-bb-empty-note";
    empty.textContent = t(locale, "folderPickerEmpty");
    section.append(empty);
    return section;
  }

  const fieldWrap = document.createElement("div");
  fieldWrap.className = "keepit-bb-field";

  const labelId = "keepit-bb-folder-label";
  const label = document.createElement("label");
  label.id = labelId;
  label.className = "keepit-bb-field__label";
  label.htmlFor = "keepit-bb-folder-select";
  label.textContent = t(locale, "folderPickerLabel");

  const select = document.createElement("select");
  select.id = "keepit-bb-folder-select";
  select.className = "input";
  select.dataset.focusKey = "import-chrome-folder-select";
  for (const folder of folders) {
    const option = document.createElement("option");
    option.value = folder.id;
    const indent = "\u2014 ".repeat(folder.depth); // "— " متكررة بعدد المستويات، تشير بصريًا للتداخل
    option.textContent = `${indent}${folder.title || "—"} (${t(locale, "folderCountSuffix", { count: folder.totalCount })})`;
    select.append(option);
  }

  fieldWrap.append(label, select);

  const importBtn = document.createElement("button");
  importBtn.type = "button";
  importBtn.className = "btn btn--primary";
  importBtn.dataset.focusKey = "import-chrome-action";
  importBtn.textContent = t(locale, "importFromChromeAction");
  importBtn.addEventListener("click", () => onImportFromChrome(select.value, importBtn));

  const actions = document.createElement("div");
  actions.className = "keepit-bb-actions";
  actions.append(importBtn);

  section.append(fieldWrap, actions);
  return section;
}

async function onImportFromChrome(folderId, triggerBtn) {
  if (!folderId) return;
  await withBusyButton(triggerBtn, async () => {
    const normalized = await readNormalizedCollectionsFromFolder(folderId);
    await runImport(normalized);
  });
}

// ---------------------------------------------------------------------------
// القسم 2: ملف HTML قياسي (استيراد + تصدير)
// ---------------------------------------------------------------------------

function buildHtmlFileSection(locale, collections) {
  const section = document.createElement("div");
  section.className = "keepit-bb-section";

  const title = document.createElement("h3");
  title.className = "keepit-bb-section__title";
  title.textContent = t(locale, "htmlFileTitle");

  const desc = document.createElement("p");
  desc.className = "keepit-bb-section__desc";
  desc.textContent = t(locale, "htmlFileDesc");

  const fieldWrap = document.createElement("div");
  fieldWrap.className = "keepit-bb-field";

  const labelId = "keepit-bb-file-label";
  const label = document.createElement("label");
  label.id = labelId;
  label.className = "keepit-bb-field__label";
  label.htmlFor = "keepit-bb-file-input";
  label.textContent = t(locale, "htmlFileImportLabel");

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "keepit-bb-file-input";
  fileInput.className = "input";
  fileInput.accept = ".html,.htm,text/html";
  fileInput.dataset.focusKey = "import-html-file-input";

  fieldWrap.append(label, fileInput);

  const importBtn = document.createElement("button");
  importBtn.type = "button";
  importBtn.className = "btn btn--primary";
  importBtn.dataset.focusKey = "import-html-action";
  importBtn.textContent = t(locale, "htmlFileImportAction");
  importBtn.addEventListener("click", () => onImportHtmlFile(fileInput, importBtn));

  const exportBtn = document.createElement("button");
  exportBtn.type = "button";
  exportBtn.className = "btn btn--secondary";
  exportBtn.dataset.focusKey = "export-html-action";
  exportBtn.textContent = t(locale, "htmlFileExportAction");
  exportBtn.disabled = collections.length === 0;
  exportBtn.addEventListener("click", () => onExportHtmlFile(collections, exportBtn));

  const actions = document.createElement("div");
  actions.className = "keepit-bb-actions";
  actions.append(importBtn, exportBtn);

  section.append(title, desc, fieldWrap, actions);
  return section;
}

async function onImportHtmlFile(fileInput, triggerBtn) {
  const file = fileInput.files?.[0];
  if (!file) return;

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    showToast(t(currentLocale, "fileTooLargeToast"), "error");
    return;
  }

  await withBusyButton(triggerBtn, async () => {
    let text;
    try {
      text = await file.text();
    } catch {
      showToast(t(currentLocale, "invalidFileToast"), "error");
      return;
    }

    const parsed = parseNetscapeHtml(text);
    if (parsed.length === 0) {
      showToast(t(currentLocale, "invalidFileToast"), "error");
      return;
    }

    const normalized = flattenToCollections(parsed, file.name.replace(/\.html?$/i, "") || "Bookmarks");
    await runImport(normalized);
    fileInput.value = "";
  });
}

function onExportHtmlFile(collections, triggerBtn) {
  withBusyButtonSync(triggerBtn, () => {
    const payload = collections.map((c) => ({
      name: c.name,
      items: [...(c.items || [])]
        .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
        .map((item) => ({ url: item.url, title: item.title, createdAt: item.createdAt })),
    }));
    const html = serializeToNetscapeHtml(payload);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);

    const a = document.createElement("a");
    a.href = url;
    a.download = `keepit-bookmarks-${dateStamp}.html`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
}

// ---------------------------------------------------------------------------
// القسم 3: تصدير إلى إشارات Chrome المرجعية
// ---------------------------------------------------------------------------

function buildExportToChromeSection(locale, collections) {
  const section = document.createElement("div");
  section.className = "keepit-bb-section";

  const title = document.createElement("h3");
  title.className = "keepit-bb-section__title";
  title.textContent = t(locale, "exportToChromeTitle");

  const desc = document.createElement("p");
  desc.className = "keepit-bb-section__desc";
  desc.textContent = t(locale, "exportToChromeDesc");

  section.append(title, desc);

  if (collections.length === 0) {
    const empty = document.createElement("p");
    empty.className = "keepit-bb-empty-note";
    empty.textContent = t(locale, "noCollectionsYet");
    section.append(empty);
    return section;
  }

  const fieldWrap = document.createElement("div");
  fieldWrap.className = "keepit-bb-field";

  const label = document.createElement("label");
  label.className = "keepit-bb-field__label";
  label.htmlFor = "keepit-bb-collection-select";
  label.textContent = t(locale, "collectionPickerLabel");

  const select = document.createElement("select");
  select.id = "keepit-bb-collection-select";
  select.className = "input";
  select.dataset.focusKey = "export-chrome-collection-select";

  const allOption = document.createElement("option");
  allOption.value = EXPORT_ALL_VALUE;
  const totalItems = collections.reduce((n, c) => n + (Array.isArray(c.items) ? c.items.length : 0), 0);
  allOption.textContent = t(locale, "allCollectionsOption", { count: collections.length, items: totalItems });
  select.append(allOption);

  for (const col of collections) {
    const option = document.createElement("option");
    option.value = col.id;
    const count = Array.isArray(col.items) ? col.items.length : 0;
    option.textContent = `${col.name} (${count})`;
    select.append(option);
  }

  fieldWrap.append(label, select);

  const exportBtn = document.createElement("button");
  exportBtn.type = "button";
  exportBtn.className = "btn btn--primary";
  exportBtn.dataset.focusKey = "export-chrome-action";
  exportBtn.textContent = t(locale, "exportToChromeAction");
  exportBtn.addEventListener("click", () => onExportToChrome(select.value, collections, exportBtn));

  const actions = document.createElement("div");
  actions.className = "keepit-bb-actions";
  actions.append(exportBtn);

  section.append(fieldWrap, actions);
  return section;
}

async function onExportToChrome(collectionId, collections, triggerBtn) {
  const targets =
    collectionId === EXPORT_ALL_VALUE ? collections : collections.filter((c) => c.id === collectionId);
  if (targets.length === 0) return;

  await withBusyButton(triggerBtn, async () => {
    const rootFolderId = await getOrCreateExportRootFolder();

    let totalCreated = 0;
    for (const collection of targets) {
      const { created } = await exportCollectionToBookmarks(rootFolderId, {
        name: collection.name,
        items: Array.isArray(collection.items) ? collection.items : [],
      });
      totalCreated += created;
    }

    if (totalCreated === 0) {
      showToast(t(currentLocale, "exportAlreadyUpToDateToast"), "success");
    } else {
      showToast(t(currentLocale, "exportSuccessToast", { created: totalCreated }), "success");
    }
    activeDialogRefresh?.();
  });
}

// ---------------------------------------------------------------------------
// أدوات مشتركة بين المسارات الثلاثة
// ---------------------------------------------------------------------------

async function runImport(normalizedCollections) {
  const { importedCollections, importedItems, skippedItems } = await importNormalizedCollections(
    normalizedCollections,
  );

  if (importedCollections === 0) {
    showToast(t(currentLocale, "importEmptyToast"), "error");
    return;
  }

  const message =
    skippedItems > 0
      ? t(currentLocale, "importSuccessWithSkippedToast", {
          collections: importedCollections,
          items: importedItems,
          skipped: skippedItems,
        })
      : t(currentLocale, "importSuccessToast", { collections: importedCollections, items: importedItems });
  showToast(message, "success");

  // مصدر خارجي (chrome.bookmarks) لا يُطلق chrome.storage.onChanged تلقائيًا
  // على keepit:state بالضرورة بنفس اللحظة من منظور هذه الصفحة دائمًا؛ نطلب
  // إعادة رسم صريحة حتى تنعكس المجموعات الجديدة فورًا في قسم التصدير أدناه.
  activeDialogRefresh?.();
}

/**
 * يمنع تنفيذ عملية غير متزامنة مرتين متزامنتين (نقر مزدوج) أثناء تنفيذها،
 * ويعيد الزر لحالته الطبيعية دائمًا عند الانتهاء (نجاحًا أو فشلًا) عبر
 * finally. أي خطأ غير متوقَّع يُسجَّل ويظهر كإشعار عام بدل كسر الواجهة بصمت.
 *
 * aria-disabled عمدًا لا disabled الفعلية: تعطيل عنصر مُركَّز عليه حاليًا
 * (btn.disabled = true) يزيل تركيزه فورًا بحكم سلوك المتصفح القياسي —
 * فبحلول لحظة إعادة الرسم اللاحقة (rerenderPreservingFocus بعد اكتمال
 * العملية)، يكون document.activeElement قد أصبح <body> أصلاً، فتُبطَل
 * آلية حفظ التركيز تمامًا لكل زر في هذه اللوحة. aria-disabled + علم busy
 * يمنعان نفس إعادة الإرسال المزدوج (تحقّق صريح في أول السطر) بلا فقدان
 * التركيز الفعلي، مع تعطيل بصري وتفاعلي عبر CSS ([aria-disabled] في
 * bookmarks-panel.css: opacity + pointer-events).
 * @param {HTMLButtonElement} btn
 * @param {() => Promise<void>} action
 */
async function withBusyButton(btn, action) {
  if (btn.dataset.busy === "1") return;
  btn.dataset.busy = "1";
  btn.setAttribute("aria-disabled", "true");
  try {
    await action();
  } catch (err) {
    console.error("[Keepit bookmarks-bridge]", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  } finally {
    delete btn.dataset.busy;
    btn.removeAttribute("aria-disabled");
  }
}

function withBusyButtonSync(btn, action) {
  if (btn.dataset.busy === "1") return;
  btn.dataset.busy = "1";
  btn.setAttribute("aria-disabled", "true");
  try {
    action();
  } catch (err) {
    console.error("[Keepit bookmarks-bridge]", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  } finally {
    delete btn.dataset.busy;
    btn.removeAttribute("aria-disabled");
  }
}

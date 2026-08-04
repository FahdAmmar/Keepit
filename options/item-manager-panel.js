/**
 * options/item-manager-panel.js
 * ---------------------------------------------------------------------------
 * يُضيف لوحة "إدارة عناصر التصنيف" داخل شريط أدوات صفحة الخيارات، دون
 * تعديل main.js إطلاقًا — بنفس تقنية كل لوحة سابقة (سلة المحذوفات، النسخ
 * الاحتياطية، المزامنة المحلية، جسر إشارات Chrome): ننتظر ظهور
 * .options__topbar-actions ثم نُلحق بها زرًّا جديدًا.
 *
 * ## لماذا لوحة منفصلة تعرض قائمتها الخاصة، لا حقن مباشر في قائمة main.js
 * main.js (الحزمة المضغوطة الأصلية) لا تحمل أي data-id أو معرّف موثوق على
 * صفوف المواقع المعروضة فعليًا (تحقّقنا عبر فحص الحزمة قبل البدء) — تعديل
 * سلوكها من خارجها (حقن مربعات تحديد أو مقابض سحب داخل صفوفها) يعني
 * الاعتماد على ربط هش بالاسم/الرابط بدل معرّف حقيقي، مع خطر حقيقي أن أي
 * تحديث مستقبلي لبنية تلك الحزمة يكسر الربط بصمت. الحل الآمن (ونفس النمط
 * المُتَّبع في كل ميزة أضيفت هذه الجلسة): لوحة مستقلة تقرأ وتكتب keepit:state
 * مباشرة وتعرض قائمتها المُتحكَّم بها بالكامل، تمامًا كما تفعل سلة
 * المحذوفات والنسخ الاحتياطية.
 *
 * ## سحب-وإفلات + أزرار لأعلى/أسفل معًا، لا سحب-وإفلات وحده
 * HTML5 drag-and-drop غير قابل للتشغيل بلوحة المفاتيح بطبيعته (لا يوجد
 * معيار وصول قياسي لتفعيله عبر لوحة مفاتيح فقط بلا مكوّن ARIA grid معقّد
 * غير متناسب هنا). أزرار "لأعلى/لأسفل" توفّر مسارًا كامل الإتاحة موازيًا،
 * لا بديلاً تجميليًا — نفس مبدأ باقي هذه الجلسة (WCAG 2.4.3 وما تلاه).
 */
import { waitForElement, openAccessibleDialog, showToast, rerenderPreservingFocus, reattachIfDetached } from "../local-sync/dom-utils.js";
import { isSafeFaviconUrl } from "../shared/safe-favicon.js";
import { readCollections, reorderItems, deleteItems, moveItems } from "../item-manager/store.js";
import { t, resolveLocale } from "../item-manager/i18n.js";
import { KEEPIT_STATE_KEY, KEEPIT_LOCALE_KEY } from "../item-manager/constants.js";

const ICON_LIST =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>';
const ICON_GRIP =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>';
const ICON_UP =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
const ICON_DOWN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
const ICON_LINK_FALLBACK =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 14.5 9.5M8 17l-1.5 1.5a3.5 3.5 0 0 1-5-5L3 12M16 7l1.5-1.5a3.5 3.5 0 0 1 5 5L21 12"/></svg>';

const TITLE_ID = "keepit-item-manager-title";

let currentLocale = "ar";
/** @type {(() => void) | null} */
let activeDialogRefresh = null;
/** @type {HTMLButtonElement | null} */
let triggerBtnEl = null;

/** معرّف التصنيف المعروض حاليًا داخل الحوار (يبقى عبر إعادات الرسم؛ يُعاد
 *  ضبطه فقط عند اختيار المستخدم تصنيفًا آخر أو إغلاق الحوار). */
let activeCollectionId = null;
/** معرّفات العناصر المحدَّدة حاليًا ضمن التصنيف المعروض. */
const selectedItemIds = new Set();
/** معرّف العنصر الجاري سحبه حاليًا (HTML5 drag-and-drop)، أو null. */
let draggedItemId = null;

init();

async function init() {
  const localeData = await chrome.storage.local.get(KEEPIT_LOCALE_KEY);
  currentLocale = resolveLocale(localeData[KEEPIT_LOCALE_KEY]);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (KEEPIT_LOCALE_KEY in changes) {
      currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
      updateTriggerAria();
      if (triggerBtnEl) void reattachIfDetached(".options__topbar-actions", triggerBtnEl);
    }
    if (KEEPIT_STATE_KEY in changes) {
      activeDialogRefresh?.();
    }
  });

  const container = await waitForElement(".options__topbar-actions");
  if (!container) return;
  mountTriggerButton(container);
}

function mountTriggerButton(container) {
  triggerBtnEl = document.createElement("button");
  triggerBtnEl.type = "button";
  triggerBtnEl.className = "btn btn--icon";
  triggerBtnEl.innerHTML = ICON_LIST;
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
  bodyEl.className = "keepit-im-body";
  renderLoadingState(bodyEl);

  openAccessibleDialog({
    titleId: TITLE_ID,
    titleText: t(currentLocale, "panelTitle"),
    bodyEl,
    closeLabel: t(currentLocale, "close"),
    extraDialogClass: "keepit-im-dialog",
    onClose: () => {
      activeDialogRefresh = null;
      activeCollectionId = null;
      selectedItemIds.clear();
    },
  });

  activeDialogRefresh = () => refreshAndRender(bodyEl);
  void refreshAndRender(bodyEl);
}

function renderLoadingState(container) {
  const p = document.createElement("p");
  p.className = "keepit-im-empty-note";
  p.textContent = "…";
  container.replaceChildren(p);
}

async function refreshAndRender(container) {
  const collections = await readCollections().catch(() => []);
  rerenderPreservingFocus(container, () => renderBodySync(container, collections));
}

function renderBodySync(container, collections) {
  const locale = currentLocale;

  if (collections.length === 0) {
    const empty = document.createElement("p");
    empty.className = "keepit-im-empty-note";
    empty.textContent = t(locale, "noCollectionsYet");
    container.replaceChildren(empty);
    return;
  }

  if (!activeCollectionId || !collections.some((c) => c.id === activeCollectionId)) {
    activeCollectionId = collections[0].id;
    selectedItemIds.clear();
  }
  const activeCollection = collections.find((c) => c.id === activeCollectionId);
  const items = Array.isArray(activeCollection?.items)
    ? activeCollection.items.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  // تنظيف: أي معرّف محدَّد لم يعد موجودًا فعليًا (حُذف من سياق آخر مثلاً)
  for (const id of Array.from(selectedItemIds)) {
    if (!items.some((it) => it.id === id)) selectedItemIds.delete(id);
  }

  container.replaceChildren(
    buildCollectionPicker(locale, collections),
    buildToolbar(locale, collections, activeCollection, items),
    buildItemsList(locale, activeCollection, items),
  );
}

// ---------------------------------------------------------------------------
// اختيار التصنيف
// ---------------------------------------------------------------------------

function buildCollectionPicker(locale, collections) {
  const wrap = document.createElement("div");
  wrap.className = "keepit-im-field";

  const label = document.createElement("label");
  label.className = "keepit-im-field__label";
  label.htmlFor = "keepit-im-collection-select";
  label.textContent = t(locale, "collectionPickerLabel");

  const select = document.createElement("select");
  select.id = "keepit-im-collection-select";
  select.className = "input";
  select.dataset.focusKey = "collection-select";
  for (const col of collections) {
    const option = document.createElement("option");
    option.value = col.id;
    option.selected = col.id === activeCollectionId;
    const count = Array.isArray(col.items) ? col.items.length : 0;
    option.textContent = `${col.name} (${count})`;
    select.append(option);
  }
  select.addEventListener("change", () => {
    activeCollectionId = select.value;
    selectedItemIds.clear();
    activeDialogRefresh?.();
  });

  wrap.append(label, select);
  return wrap;
}

// ---------------------------------------------------------------------------
// شريط التحديد والإجراءات الجماعية
// ---------------------------------------------------------------------------

function buildToolbar(locale, collections, activeCollection, items) {
  const toolbar = document.createElement("div");
  toolbar.className = "keepit-im-toolbar";

  const selectAllLabel = document.createElement("label");
  selectAllLabel.className = "keepit-im-select-all";
  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.dataset.focusKey = "select-all";
  selectAllCheckbox.checked = items.length > 0 && selectedItemIds.size === items.length;
  selectAllCheckbox.indeterminate = selectedItemIds.size > 0 && selectedItemIds.size < items.length;
  selectAllCheckbox.disabled = items.length === 0;
  selectAllCheckbox.addEventListener("change", () => {
    if (selectAllCheckbox.checked) items.forEach((it) => selectedItemIds.add(it.id));
    else selectedItemIds.clear();
    activeDialogRefresh?.();
  });
  const selectAllText = document.createElement("span");
  selectAllText.textContent = t(locale, "selectAllLabel");
  selectAllLabel.append(selectAllCheckbox, selectAllText);

  toolbar.append(selectAllLabel);

  if (selectedItemIds.size > 0) {
    const countBadge = document.createElement("span");
    countBadge.className = "count-badge";
    countBadge.textContent = t(locale, "selectedCountLabel", { count: selectedItemIds.size });
    toolbar.append(countBadge);

    const targetSelect = document.createElement("select");
    targetSelect.className = "input keepit-im-target-select";
    targetSelect.dataset.focusKey = "move-target-select";
    targetSelect.setAttribute("aria-label", t(locale, "moveToLabel"));
    for (const col of collections) {
      if (col.id === activeCollection.id) continue; // لا معنى للنقل لنفس التصنيف
      const option = document.createElement("option");
      option.value = col.id;
      option.textContent = col.name;
      targetSelect.append(option);
    }

    const moveBtn = document.createElement("button");
    moveBtn.type = "button";
    moveBtn.className = "btn btn--secondary btn--sm";
    moveBtn.dataset.focusKey = "move-action";
    moveBtn.textContent = t(locale, "moveAction");
    moveBtn.disabled = targetSelect.options.length === 0;
    moveBtn.addEventListener("click", () => onMoveSelected(activeCollection.id, targetSelect.value, moveBtn));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn--secondary btn--sm btn--danger";
    deleteBtn.dataset.focusKey = "delete-action";
    deleteBtn.textContent = t(locale, "deleteSelectedAction");
    deleteBtn.addEventListener("click", () => onDeleteSelected(activeCollection.id, deleteBtn));

    toolbar.append(targetSelect, moveBtn, deleteBtn);
  }

  return toolbar;
}

async function onMoveSelected(sourceId, targetId, triggerBtn) {
  if (!targetId) {
    showToast(t(currentLocale, "noTargetCollectionToast"), "error");
    return;
  }
  await withBusyButton(triggerBtn, async () => {
    const ids = Array.from(selectedItemIds);
    const moved = await moveItems(sourceId, targetId, ids);
    selectedItemIds.clear();
    if (moved > 0) showToast(t(currentLocale, "moveSuccessToast", { count: moved }), "success");
    activeDialogRefresh?.();
  });
}

async function onDeleteSelected(collectionId, triggerBtn) {
  await withBusyButton(triggerBtn, async () => {
    const ids = Array.from(selectedItemIds);
    const deleted = await deleteItems(collectionId, ids);
    selectedItemIds.clear();
    if (deleted > 0) showToast(t(currentLocale, "deleteSuccessToast", { count: deleted }), "success");
    activeDialogRefresh?.();
  });
}

// ---------------------------------------------------------------------------
// قائمة العناصر (تحديد + سحب-وإفلات + أزرار لأعلى/أسفل)
// ---------------------------------------------------------------------------

function buildItemsList(locale, collection, items) {
  const list = document.createElement("div");
  list.className = "keepit-im-list";

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "keepit-im-empty-note";
    empty.textContent = t(locale, "emptyCollectionNote");
    list.append(empty);
    return list;
  }

  items.forEach((item, index) => {
    list.append(buildItemRow(locale, collection, items, item, index));
  });

  return list;
}

function buildItemRow(locale, collection, items, item, index) {
  const row = document.createElement("div");
  row.className = "keepit-im-row";
  row.draggable = true;

  row.addEventListener("dragstart", (e) => {
    draggedItemId = item.id;
    row.classList.add("is-dragging");
    e.dataTransfer?.setData("text/plain", item.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  });
  row.addEventListener("dragend", () => {
    row.classList.remove("is-dragging");
    draggedItemId = null;
  });
  row.addEventListener("dragover", (e) => {
    if (!draggedItemId || draggedItemId === item.id) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    row.classList.add("is-drag-over");
  });
  row.addEventListener("dragleave", () => row.classList.remove("is-drag-over"));
  row.addEventListener("drop", (e) => {
    e.preventDefault();
    row.classList.remove("is-drag-over");
    if (!draggedItemId || draggedItemId === item.id) return;
    void onReorder(collection.id, reorderByDrag(items, draggedItemId, item.id));
  });

  const grip = document.createElement("span");
  grip.className = "keepit-im-row__grip";
  grip.innerHTML = ICON_GRIP;
  grip.setAttribute("aria-hidden", "true"); // زخرفي بحت — السحب-والإفلات غير متاح بلوحة المفاتيح أصلاً؛ أزرار لأعلى/أسفل أدناه هي المسار الكامل الإتاحة

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "keepit-im-row__checkbox";
  checkbox.dataset.focusKey = `select-${item.id}`;
  checkbox.checked = selectedItemIds.has(item.id);
  checkbox.setAttribute("aria-label", t(locale, "itemCheckboxAriaLabel", { title: item.title }));
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) selectedItemIds.add(item.id);
    else selectedItemIds.delete(item.id);
    activeDialogRefresh?.();
  });

  const link = document.createElement("a");
  link.className = "keepit-im-row__link";
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.title = item.title;
  link.draggable = false; // <a> قابل للسحب افتراضيًا في المتصفح (سحب الرابط نفسه)؛ نُعطّله صراحة حتى يتولى سحب الصف (أعلاه) التعامل مع أي سحب يبدأ فوقه
  link.append(buildFavicon(item));
  const body = document.createElement("span");
  body.className = "keepit-im-row__body";
  const titleEl = document.createElement("span");
  titleEl.className = "keepit-im-row__title";
  titleEl.textContent = item.title;
  const hostEl = document.createElement("span");
  hostEl.className = "keepit-im-row__host";
  hostEl.textContent = hostnameOf(item.url);
  body.append(titleEl, hostEl);
  link.append(body);

  const moveButtons = document.createElement("div");
  moveButtons.className = "keepit-im-row__move-buttons";

  const upBtn = document.createElement("button");
  upBtn.type = "button";
  upBtn.className = "btn btn--icon btn--sm";
  upBtn.innerHTML = ICON_UP;
  upBtn.dataset.focusKey = `move-up-${item.id}`;
  upBtn.setAttribute("aria-label", t(locale, "moveUpAriaLabel", { title: item.title }));
  upBtn.disabled = index === 0;
  upBtn.addEventListener("click", () => onReorder(collection.id, moveInArray(items, item.id, -1)));

  const downBtn = document.createElement("button");
  downBtn.type = "button";
  downBtn.className = "btn btn--icon btn--sm";
  downBtn.innerHTML = ICON_DOWN;
  downBtn.dataset.focusKey = `move-down-${item.id}`;
  downBtn.setAttribute("aria-label", t(locale, "moveDownAriaLabel", { title: item.title }));
  downBtn.disabled = index === items.length - 1;
  downBtn.addEventListener("click", () => onReorder(collection.id, moveInArray(items, item.id, 1)));

  moveButtons.append(upBtn, downBtn);
  row.append(grip, checkbox, link, moveButtons);
  return row;
}

function buildFavicon(item) {
  if (isSafeFaviconUrl(item.faviconUrl)) {
    const img = document.createElement("img");
    img.className = "favicon";
    img.src = item.faviconUrl;
    img.alt = "";
    img.loading = "lazy";
    img.draggable = false; // <img> قابلة للسحب افتراضيًا أيضًا؛ نفس سبب تعطيل السحب على الرابط أعلاه
    img.addEventListener("error", () => img.replaceWith(buildFaviconFallback()), { once: true });
    return img;
  }
  return buildFaviconFallback();
}

function buildFaviconFallback() {
  const span = document.createElement("span");
  span.className = "favicon-fallback";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = ICON_LINK_FALLBACK;
  return span;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** @param {Array<any>} items @param {string} itemId @param {1|-1} direction */
function moveInArray(items, itemId, direction) {
  const ids = items.map((it) => it.id);
  const idx = ids.indexOf(itemId);
  const newIdx = idx + direction;
  if (idx === -1 || newIdx < 0 || newIdx >= ids.length) return ids;
  [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
  return ids;
}

/** يُدرج draggedId مباشرة قبل موضع targetId الحالي. */
function reorderByDrag(items, draggedId, targetId) {
  const ids = items.map((it) => it.id).filter((id) => id !== draggedId);
  const targetIndex = ids.indexOf(targetId);
  ids.splice(targetIndex, 0, draggedId);
  return ids;
}

async function onReorder(collectionId, newOrderIds) {
  try {
    await reorderItems(collectionId, newOrderIds);
    activeDialogRefresh?.();
  } catch (err) {
    console.error("[Keepit item-manager]", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  }
}

// ---------------------------------------------------------------------------
// أداة مشتركة
// ---------------------------------------------------------------------------

/**
 * aria-disabled عمدًا لا disabled الفعلية — راجع الشرح المطوَّل لنفس
 * القرار في options/bookmarks-panel.js: تعطيل عنصر مُركَّز عليه فعليًا
 * يُفقده التركيز فورًا (سلوك متصفح قياسي)، فيُبطل rerenderPreservingFocus
 * تمامًا في هذه اللوحة أيضًا.
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
    console.error("[Keepit item-manager]", err);
    showToast(t(currentLocale, "errorGeneric"), "error");
  } finally {
    delete btn.dataset.busy;
    btn.removeAttribute("aria-disabled");
  }
}

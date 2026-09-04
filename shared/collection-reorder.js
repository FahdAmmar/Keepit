/**
 * shared/collection-reorder.js
 * ---------------------------------------------------------------------------
 * يضيف ترتيبًا يدويًا للمجموعات فوق واجهتي popup وoptions دون تعديل الحزم
 * الأصلية المجمعة. يعتمد على Pointer Events بدلاً من واجهة HTML Drag and
 * Drop لأنّها تعمل بالماوس واللمس والقلم في محركات المتصفحات الحديثة. زر
 * المقبض يدعم لوحة المفاتيح بالكامل كبديل عند عدم وجود مؤشّر دقيق.
 */
import { KEEPIT_STATE_KEY, saveCollectionOrder } from "./collection-order-store.js";
import { COLLECTION_VIEW_KEY, COLLECTION_SORT_MODES, normalizeCollectionView } from "./collection-view.js";

const LIST_SELECTOR = ".collection-list, .options__collections";
const ROW_SELECTOR = ":scope > .collection-row";
const HANDLE_CLASS = "keepit-collection-drag-handle";
const DRAG_THRESHOLD_PX = 6;

/** @type {{ pointerId: number, handle: HTMLButtonElement, row: HTMLElement, list: HTMLElement, startX: number, startY: number, previousRows: HTMLElement[], target: HTMLElement | null, moved: boolean } | null} */
let activeDrag = null;
/** @type {{ row: HTMLElement, list: HTMLElement, previousRows: HTMLElement[] } | null} */
let keyboardDrag = null;
let scheduledRefresh = false;
/** @type {HTMLDivElement | null} */
let liveRegion = null;

function isArabic() {
  return document.documentElement.lang.toLowerCase().startsWith("ar");
}

function text(key, name = "") {
  const ar = {
    handle: `اسحب لترتيب مجموعة ${name}`,
    start: `بدأ ترتيب مجموعة ${name}. استخدم السهمين للأعلى والأسفل، ثم مسافة أو Enter للحفظ، أو Escape للإلغاء.`,
    moved: `نُقلت مجموعة ${name}.`,
    saved: "تم حفظ ترتيب المجموعات.",
    unchanged: "ترتيب المجموعات لم يتغير.",
    cancelled: "أُلغي ترتيب المجموعات.",
    failed: "تعذر حفظ ترتيب المجموعات. أُعيد الترتيب السابق.",
  };
  const en = {
    handle: `Drag to reorder ${name}`,
    start: `Started reordering ${name}. Use the up and down arrows, then Space or Enter to save, or Escape to cancel.`,
    moved: `Moved ${name}.`,
    saved: "Collection order saved.",
    unchanged: "Collection order did not change.",
    cancelled: "Collection order cancelled.",
    failed: "Could not save collection order. The previous order was restored.",
  };
  return (isArabic() ? ar : en)[key];
}

function ensureLiveRegion() {
  if (liveRegion?.isConnected) return liveRegion;
  liveRegion = document.createElement("div");
  liveRegion.className = "keepit-collection-order-status";
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  document.body.append(liveRegion);
  return liveRegion;
}

function announce(message) {
  const region = ensureLiveRegion();
  region.textContent = "";
  setTimeout(() => {
    if (region.isConnected) region.textContent = message;
  }, 0);
}

/** @param {Element} list @returns {HTMLElement[]} */
function getRows(list) {
  return /** @type {HTMLElement[]} */ (Array.from(list.querySelectorAll(ROW_SELECTOR)));
}

function getRowName(row) {
  return row.querySelector(".collection-row__name")?.textContent?.trim() ?? "";
}

/** @param {Element} list @returns {string[]} */
function getRowIds(list) {
  const ids = [];
  for (const row of getRows(list)) {
    const id = row.dataset.keepitCollectionId;
    if (typeof id === "string" && id.length > 0) ids.push(id);
  }
  return ids;
}

function restoreRows(list, rowOrder) {
  if (!list.isConnected) return;
  const currentRows = getRows(list);
  const known = new Set(rowOrder);
  list.append(...rowOrder, ...currentRows.filter((row) => !known.has(row)));
}

function moveRow(row, destinationIndex) {
  const list = row.parentElement;
  if (!list) return false;
  const rows = getRows(list);
  const currentIndex = rows.indexOf(row);
  if (currentIndex < 0) return false;
  const targetIndex = Math.max(0, Math.min(destinationIndex, rows.length - 1));
  if (targetIndex === currentIndex) return false;
  const withoutRow = rows.filter((candidate) => candidate !== row);
  list.insertBefore(row, withoutRow[targetIndex] ?? null);
  return true;
}

function setHandleState(row, grabbed) {
  const handle = row.querySelector(`.${HANDLE_CLASS}`);
  if (!handle) return;
  handle.setAttribute("aria-pressed", grabbed ? "true" : "false");
  handle.setAttribute("aria-label", text("handle", getRowName(row)));
  row.classList.toggle("keepit-collection-row--keyboard-dragging", grabbed);
}

async function saveListOrder(list, previousRows) {
  const ids = getRowIds(list);
  if (ids.length !== getRows(list).length) {
    restoreRows(list, previousRows);
    announce(text("failed"));
    return false;
  }
  try {
    const changed = await saveCollectionOrder(ids);
    announce(text(changed ? "saved" : "unchanged"));
    return true;
  } catch (error) {
    console.error("[Keepit collection order] save failed", error);
    restoreRows(list, previousRows);
    announce(text("failed"));
    return false;
  }
}

/** @param {PointerEvent} event @param {boolean} [cancelled] */
function finishPointerDrag(event, cancelled = false) {
  const drag = activeDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  activeDrag = null;
  drag.row.classList.remove("keepit-collection-row--dragging");
  drag.list.classList.remove("keepit-collection-list--dragging");
  drag.target?.classList.remove("keepit-collection-row--drop-target");
  try {
    if (drag.handle.hasPointerCapture(event.pointerId)) drag.handle.releasePointerCapture(event.pointerId);
  } catch {
    // لا يحتاج فقدان/تحرير المؤشر المتزامن إلى معالجة إضافية.
  }
  if (cancelled || !drag.moved) {
    if (cancelled) restoreRows(drag.list, drag.previousRows);
    return;
  }
  void saveListOrder(drag.list, drag.previousRows);
}

/** @param {PointerEvent} event */
function updatePointerDrag(event) {
  const drag = activeDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
  if (distance < DRAG_THRESHOLD_PX) return;
  event.preventDefault();

  const rows = getRows(drag.list);
  const candidates = rows.filter((row) => row !== drag.row);
  const horizontal = getComputedStyle(drag.list).flexDirection.startsWith("row");
  const rtlHorizontal = horizontal && getComputedStyle(drag.list).direction === "rtl";
  const pointerPosition = horizontal ? event.clientX : event.clientY;
  let target = candidates[candidates.length - 1] ?? null;
  let insertBefore = false;
  for (const candidate of candidates) {
    const bounds = candidate.getBoundingClientRect();
    const midpoint = horizontal ? bounds.left + bounds.width / 2 : bounds.top + bounds.height / 2;
    const isBefore = rtlHorizontal ? pointerPosition > midpoint : pointerPosition < midpoint;
    if (isBefore) {
      target = candidate;
      insertBefore = true;
      break;
    }
  }
  if (!target) return;

  drag.target?.classList.remove("keepit-collection-row--drop-target");
  drag.target = target;
  target.classList.add("keepit-collection-row--drop-target");
  if (insertBefore) drag.list.insertBefore(drag.row, target);
  else drag.list.insertBefore(drag.row, target.nextSibling);
  drag.moved = true;
}

/** @param {PointerEvent} event */
function beginPointerDrag(event) {
  if (event.button !== 0 || keyboardDrag) return;
  const handle = /** @type {HTMLButtonElement} */ (event.currentTarget);
  const row = /** @type {HTMLElement | null} */ (handle.closest(".collection-row"));
  const list = /** @type {HTMLElement | null} */ (row?.parentElement);
  if (!row || !list || !list.matches(LIST_SELECTOR) || getRows(list).length < 2) return;

  event.preventDefault();
  activeDrag = {
    pointerId: event.pointerId,
    handle,
    row,
    list,
    startX: event.clientX,
    startY: event.clientY,
    previousRows: getRows(list),
    target: null,
    moved: false,
  };
  row.classList.add("keepit-collection-row--dragging");
  list.classList.add("keepit-collection-list--dragging");
  try {
    handle.setPointerCapture(event.pointerId);
  } catch {
    // بعض البيئات لا تمنح pointer capture للأحداث الاصطناعية؛ السحب يبقى
    // صالحًا لأن المستمعات موجودة أيضًا على المقبض نفسه.
  }
}

function endKeyboardDrag(commit) {
  const drag = keyboardDrag;
  if (!drag) return;
  keyboardDrag = null;
  setHandleState(drag.row, false);
  if (commit) void saveListOrder(drag.list, drag.previousRows);
  else {
    restoreRows(drag.list, drag.previousRows);
    announce(text("cancelled"));
  }
}

/** @param {KeyboardEvent} event */
function handleKeyboard(event) {
  const handle = /** @type {HTMLButtonElement} */ (event.currentTarget);
  const row = /** @type {HTMLElement | null} */ (handle.closest(".collection-row"));
  const list = /** @type {HTMLElement | null} */ (row?.parentElement);
  if (!row || !list || !list.matches(LIST_SELECTOR)) return;
  const isToggleKey = event.key === " " || event.key === "Enter";

  if (!keyboardDrag) {
    if (!isToggleKey || getRows(list).length < 2) return;
    event.preventDefault();
    keyboardDrag = { row, list, previousRows: getRows(list) };
    setHandleState(row, true);
    announce(text("start", getRowName(row)));
    return;
  }

  if (keyboardDrag.row !== row) return;
  if (isToggleKey) {
    event.preventDefault();
    endKeyboardDrag(true);
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    endKeyboardDrag(false);
    return;
  }

  const rows = getRows(list);
  const index = rows.indexOf(row);
  const horizontal = getComputedStyle(list).flexDirection.startsWith("row");
  const rtlHorizontal = horizontal && getComputedStyle(list).direction === "rtl";
  let destination = index;
  if (event.key === "ArrowUp" || (!horizontal && event.key === "ArrowLeft")) destination = index - 1;
  if (event.key === "ArrowDown" || (!horizontal && event.key === "ArrowRight")) destination = index + 1;
  if (horizontal && event.key === "ArrowLeft") destination = rtlHorizontal ? index + 1 : index - 1;
  if (horizontal && event.key === "ArrowRight") destination = rtlHorizontal ? index - 1 : index + 1;
  if (event.key === "Home") destination = 0;
  if (event.key === "End") destination = rows.length - 1;
  if (destination === index) return;
  event.preventDefault();
  if (moveRow(row, destination)) announce(text("moved", getRowName(row)));
}

function createHandle(row) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = HANDLE_CLASS;
  handle.setAttribute("aria-label", text("handle", getRowName(row)));
  handle.setAttribute("aria-pressed", "false");
  handle.title = text("handle", getRowName(row));
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const [cx, cy] of [[5, 3], [11, 3], [5, 8], [11, 8], [5, 13], [11, 13]]) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(cx));
    circle.setAttribute("cy", String(cy));
    circle.setAttribute("r", "1");
    svg.append(circle);
  }
  handle.append(svg);
  handle.addEventListener("pointerdown", beginPointerDrag);
  handle.addEventListener("pointermove", updatePointerDrag);
  handle.addEventListener("pointerup", finishPointerDrag);
  handle.addEventListener("pointercancel", (event) => finishPointerDrag(event, true));
  handle.addEventListener("lostpointercapture", (event) => finishPointerDrag(event, true));
  handle.addEventListener("keydown", handleKeyboard);
  handle.addEventListener("click", (event) => event.stopPropagation());
  row.prepend(handle);
}

async function synchronizeList(list) {
  if (!list.isConnected) return;
  const rows = getRows(list);
  if (rows.length === 0) return;

  const raw = /** @type {Record<string, {collections?: Array<any>} | undefined>} */ (
    await chrome.storage.local.get([KEEPIT_STATE_KEY, COLLECTION_VIEW_KEY])
  );
  if (!list.isConnected) return;
  const collections = Array.isArray(raw[KEEPIT_STATE_KEY]?.collections) ? raw[KEEPIT_STATE_KEY].collections : [];
  const unusedCollections = collections.slice();

  for (const row of rows) {
    const name = getRowName(row);
    const index = unusedCollections.findIndex((collection) => collection?.name === name && typeof collection.id === "string");
    if (index < 0) continue;
    const [collection] = unusedCollections.splice(index, 1);
    row.dataset.keepitCollectionId = collection.id;
    if (!row.querySelector(`.${HANDLE_CLASS}`)) createHandle(row);
  }

  // شاشة عرض المجموعات (collection-view-ui.js) تتولى ترتيب الصفوف بنفسها
  // كلما اختار المستخدم نمط فرز غير يدوي. فرض ترتيبنا الخام هنا أيضًا في
  // تلك الحالة يعني أن كل وحدة تُعيد ترتيب الصفوف فتُبطل ترتيب الأخرى، وكل
  // مرة تُشغِّل MutationObserver الخاص بالوحدة الأخرى من جديد — حلقة لا
  // نهائية من إعادة الترتيب تظهر للمستخدم كوميض مستمر في قائمة المجموعات.
  // الحل: لا نفرض الترتيب اليدوي إلا عندما يكون هو النمط الفعلي المختار.
  const view = normalizeCollectionView(raw[COLLECTION_VIEW_KEY]);
  if (view.sortMode !== COLLECTION_SORT_MODES.MANUAL) return;

  const orderIndex = new Map(collections.map((collection, index) => [collection?.id, index]));
  const sortableRows = getRows(list);
  if (sortableRows.some((row) => !row.dataset.keepitCollectionId)) return;
  const sortedRows = sortableRows.slice().sort((a, b) =>
    (orderIndex.get(a.dataset.keepitCollectionId) ?? Number.MAX_SAFE_INTEGER) -
    (orderIndex.get(b.dataset.keepitCollectionId) ?? Number.MAX_SAFE_INTEGER),
  );
  if (sortedRows.some((row, index) => row !== sortableRows[index])) list.append(...sortedRows);
}

function refreshLists() {
  scheduledRefresh = false;
  for (const list of document.querySelectorAll(LIST_SELECTOR)) {
    void synchronizeList(list).catch((error) => console.error("[Keepit collection order] sync failed", error));
  }
}

function scheduleRefresh() {
  if (scheduledRefresh) return;
  scheduledRefresh = true;
  setTimeout(refreshLists, 0);
}

function mount() {
  ensureLiveRegion();
  scheduleRefresh();
  new MutationObserver(scheduleRefresh).observe(document.body, { childList: true, subtree: true });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && (changes[KEEPIT_STATE_KEY] || changes[COLLECTION_VIEW_KEY])) scheduleRefresh();
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
else mount();

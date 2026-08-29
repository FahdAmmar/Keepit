import {
  COLLECTION_SORT_MODES,
  COLLECTION_VIEW_KEY,
  normalizeCollectionView,
  setCollectionSortMode,
  sortCollectionsForView,
} from "./collection-view.js";
import { KEEPIT_STATE_KEY } from "./collection-order-store.js";

const LIST_SELECTOR = ".collection-list, .options__collections";
const CONTROL_CLASS = "keepit-collection-view-control";
let currentView = { sortMode: COLLECTION_SORT_MODES.MANUAL };
let refreshQueued = false;

function isArabic() {
  return document.documentElement.lang.toLowerCase().startsWith("ar");
}

function strings() {
  return isArabic()
    ? {
        label: "ترتيب المجموعات",
        manual: "ترتيب يدوي",
        pinnedFirst: "المثبّتة أولًا",
        newest: "الأحدث أولًا",
        oldest: "الأقدم أولًا",
        alpha: "أبجديًا",
        dragDisabled: "اختر «ترتيب يدوي» لاستخدام السحب والإفلات.",
      }
    : {
        label: "Sort collections",
        manual: "Manual order",
        pinnedFirst: "Pinned first",
        newest: "Newest first",
        oldest: "Oldest first",
        alpha: "Alphabetical",
        dragDisabled: "Choose Manual order to use drag and drop.",
      };
}

function addOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.append(option);
}

function buildControl() {
  const copy = strings();
  const wrapper = document.createElement("label");
  wrapper.className = CONTROL_CLASS;
  const text = document.createElement("span");
  text.textContent = copy.label;
  const select = document.createElement("select");
  select.className = "input";
  select.setAttribute("aria-label", copy.label);
  addOption(select, COLLECTION_SORT_MODES.MANUAL, copy.manual);
  addOption(select, COLLECTION_SORT_MODES.PINNED_FIRST, copy.pinnedFirst);
  addOption(select, COLLECTION_SORT_MODES.NEWEST, copy.newest);
  addOption(select, COLLECTION_SORT_MODES.OLDEST, copy.oldest);
  addOption(select, COLLECTION_SORT_MODES.ALPHA, copy.alpha);
  select.value = currentView.sortMode;
  select.addEventListener("change", async () => {
    select.disabled = true;
    try {
      currentView = await setCollectionSortMode(select.value);
      scheduleRefresh();
    } catch (error) {
      console.error("[Keepit collection view] could not save sort mode", error);
      select.value = currentView.sortMode;
    } finally {
      select.disabled = false;
    }
  });
  wrapper.append(text, select);
  return wrapper;
}

function installControl(list) {
  const parent = list.parentElement;
  if (!parent || parent.querySelector(`:scope > .${CONTROL_CLASS}`)) return;
  const control = buildControl();
  const heading = list.previousElementSibling?.classList.contains("section-heading") ? list.previousElementSibling : null;
  if (heading) heading.append(control);
  else parent.insertBefore(control, list);
}

function getRows(list) {
  return /** @type {HTMLElement[]} */ (Array.from(list.querySelectorAll(":scope > .collection-row")));
}

function getRowName(row) {
  return row.querySelector(".collection-row__name")?.textContent?.trim() ?? "";
}

function reconcileRows(list, collections) {
  const rows = getRows(list);
  const unmatched = collections.slice();
  for (const row of rows) {
    const name = getRowName(row);
    const index = unmatched.findIndex((collection) => collection?.name === name && typeof collection.id === "string");
    if (index >= 0) row.dataset.keepitCollectionId = unmatched.splice(index, 1)[0].id;
  }
  return rows;
}

async function arrangeList(list) {
  installControl(list);
  const data = /** @type {Record<string, any>} */ (await chrome.storage.local.get([KEEPIT_STATE_KEY, COLLECTION_VIEW_KEY]));
  currentView = normalizeCollectionView(data[COLLECTION_VIEW_KEY]);
  const collections = Array.isArray(data[KEEPIT_STATE_KEY]?.collections) ? data[KEEPIT_STATE_KEY].collections : [];
  const desired = sortCollectionsForView(collections, currentView, document.documentElement.lang || "ar");
  const rows = reconcileRows(list, collections);
  const rowsById = new Map(rows.map((row) => [row.dataset.keepitCollectionId, row]));
  const orderedRows = desired.map((collection) => rowsById.get(collection.id)).filter(Boolean);
  if (orderedRows.length === rows.length && orderedRows.some((row, index) => row !== rows[index])) list.append(...orderedRows);

  const manual = currentView.sortMode === COLLECTION_SORT_MODES.MANUAL;
  list.dataset.keepitOrderMode = currentView.sortMode;
  list.classList.toggle("keepit-collection-list--sorted", !manual);
  for (const handle of list.querySelectorAll(".keepit-collection-drag-handle")) {
    handle.toggleAttribute("disabled", !manual);
    handle.setAttribute("title", manual ? handle.getAttribute("aria-label") ?? "" : strings().dragDisabled);
  }
  const select = /** @type {HTMLSelectElement | null} */ (document.querySelector(`.${CONTROL_CLASS} select`));
  if (select && select.value !== currentView.sortMode) select.value = currentView.sortMode;
}

function refresh() {
  refreshQueued = false;
  for (const list of document.querySelectorAll(LIST_SELECTOR)) {
    void arrangeList(/** @type {HTMLElement} */ (list)).catch((error) =>
      console.error("[Keepit collection view] could not arrange list", error),
    );
  }
}

function scheduleRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  setTimeout(refresh, 0);
}

function mount() {
  scheduleRefresh();
  new MutationObserver(scheduleRefresh).observe(document.body, { childList: true, subtree: true });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && (changes[KEEPIT_STATE_KEY] || changes[COLLECTION_VIEW_KEY])) scheduleRefresh();
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
else mount();

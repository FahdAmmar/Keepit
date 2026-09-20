/**
 * search-enhance/mount.js
 * ---------------------------------------------------------------------------
 * يُلحق لوحة "التصنيفات المطابقة" مباشرة أسفل حقل البحث الأصلي — في كل من
 * popup وoptions، بنفس الوحدة الواحدة (بنية الصفحتين لحقل البحث متطابقة
 * تقريبًا: عنصر `<input type="search">` داخل غلاف `.popup__search` أو
 * `.options__search`). لا تعديل على main.js إطلاقًا؛ فقط استماع لحدث
 * "input" إضافي على نفس حقل البحث (مستمعون متعددون على نفس العنصر لا
 * يتعارضون) وإدراج عنصر شقيق جديد بعد الغلاف مباشرة.
 *
 * سبب استخدام MutationObserver دائم بدل waitForElement التي تُستخدَم في
 * بقية الميزات الإضافية (مرة واحدة فقط): في النافذة المنبثقة تحديدًا،
 * `buildListScreen()` تُعيد إنشاء حقل البحث بالكامل (عنصر DOM جديد تمامًا)
 * في كل مرة يعود فيها المستخدم من شاشة "تفاصيل التصنيف" إلى شاشة القائمة.
 * لوحتنا يجب أن تُعاد ربطها بكل نسخة جديدة من الحقل، لا بالنسخة الأولى فقط.
 */
import { rerenderPreservingFocus } from "../local-sync/dom-utils.js";
import { buildItemRow } from "../shared/item-row.js";
import { searchMatchingCollections, readLocalePreference } from "./store.js";
import { t, resolveLocale } from "./i18n.js";
import { KEEPIT_STATE_KEY, KEEPIT_LOCALE_KEY, DEBOUNCE_MS } from "./constants.js";

const PANEL_CLASS = "keepit-search-enhance";
const SEARCH_WRAPPER_SELECTOR = ".popup__search, .options__search";
const ITEM_ROW_CLASSES = Object.freeze({
  rowClass: "keepit-search-enhance__item-row",
  faviconFallbackClass: "keepit-search-enhance__favicon-fallback",
});

const ICON_CHEVRON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

/** @type {HTMLInputElement | null} */
let currentInputEl = null;
/** @type {HTMLDivElement | null} */
let currentPanelEl = null;
/** مجموعة أسماء التصنيفات الموسَّعة يدويًا (بمعرّفها) — تبقى مفتوحة عبر
 *  إعادة الرسم أثناء الكتابة المتتالية، فلا تُغلَق كل حرف جديد يكتبه المستخدم. */
const expandedIds = new Set();
/** مجموعة التصنيفات المطويّة يدويًا صراحة — تتجاوز التوسيع التلقائي عند
 *  تطابق موقع (راجع isExpanded). بدونها، طيّ تصنيف وُسِّع تلقائيًا لا يعمل:
 *  حذفه من expandedIds لا أثر له لأنه أصلاً لم يكن بداخلها. */
const collapsedIds = new Set();
/** آخر نتائج معروفة، لإعادة الرسم الفوري عند تبديل التوسيع بلا قراءة جديدة
 *  من chrome.storage في كل نقرة. تُحدَّث فقط داخل updateResults(). */
let lastRenderedMatches = [];

/** @type {"ar" | "en"} */
let currentLocale = "ar";

export function mountSearchEnhance() {
  attachIfPresent();
  new MutationObserver(() => attachIfPresent()).observe(document.body, { childList: true, subtree: true });

  readLocalePreference().then((pref) => {
    currentLocale = resolveLocale(pref);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    if (KEEPIT_LOCALE_KEY in changes) {
      currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
    }
    if (!(KEEPIT_STATE_KEY in changes) && !(KEEPIT_LOCALE_KEY in changes)) return;
    if (!currentInputEl || !currentPanelEl || !document.body.contains(currentPanelEl)) return;
    if (currentInputEl.value.trim()) void updateResults(currentInputEl.value);
  });
}

function attachIfPresent() {
  const wrapper = document.querySelector(SEARCH_WRAPPER_SELECTOR);
  if (!wrapper) return;

  const input = wrapper.querySelector('input[type="search"]');
  if (!(input instanceof HTMLInputElement) || input === currentInputEl) return; // لا شيء جديد

  const panelEl = document.createElement("div");
  panelEl.className = PANEL_CLASS;
  panelEl.id = panelEl.id || `keepit-search-enhance-${Math.random().toString(36).slice(2, 9)}`;
  panelEl.hidden = true;
  panelEl.setAttribute("role", "region");
  panelEl.setAttribute("aria-live", "polite");
  wrapper.after(panelEl);

  input.setAttribute("aria-controls", panelEl.id);

  currentInputEl = input;
  currentPanelEl = panelEl;

  let debounceTimer = /** @type {ReturnType<typeof setTimeout> | null} */ (null);
  input.addEventListener("input", () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void updateResults(input.value), DEBOUNCE_MS);
  });

  if (input.value.trim()) void updateResults(input.value);
}

async function updateResults(query) {
  const panelEl = currentPanelEl;
  if (!panelEl) return;

  const trimmed = query.trim();
  if (!trimmed) {
    panelEl.hidden = true;
    panelEl.replaceChildren();
    return;
  }

  const matches = await searchMatchingCollections(trimmed);
  // فحص أمان بسيط: قد يكون المستخدم واصلًا الكتابة أو مسح الحقل أثناء
  // انتظار القراءة أعلاه (وهي async) — لا نعرض نتائج لم تعد مطابقة للقيمة
  // الحالية الفعلية للحقل.
  if (!currentInputEl || currentInputEl.value.trim() !== trimmed) return;

  if (matches.length === 0) {
    panelEl.hidden = true;
    panelEl.replaceChildren();
    return;
  }

  panelEl.hidden = false;
  lastRenderedMatches = matches;
  render(panelEl, matches);
}

function render(panelEl, matches) {
  const locale = currentLocale;
  const validIds = new Set(matches.map((c) => c.id));
  for (const id of Array.from(expandedIds)) {
    if (!validIds.has(id)) expandedIds.delete(id); // تنظيف تصنيفات لم تعد ضمن النتائج الحالية
  }
  for (const id of Array.from(collapsedIds)) {
    if (!validIds.has(id)) collapsedIds.delete(id);
  }

  const heading = document.createElement("div");
  heading.className = "keepit-search-enhance__heading";
  heading.id = `${panelEl.id}-heading`;
  const headingTitle = document.createElement("span");
  headingTitle.className = "keepit-search-enhance__heading-title";
  headingTitle.textContent = t(locale, "matchingCollectionsTitle");
  const headingCount = document.createElement("span");
  headingCount.className = "count-badge";
  headingCount.textContent = String(matches.length);
  heading.append(headingTitle, headingCount);
  panelEl.setAttribute("aria-labelledby", heading.id);

  const list = document.createElement("div");
  list.className = "item-list keepit-search-enhance__list";
  for (const collection of matches) {
    list.append(buildCollectionRow(collection, locale));
  }

  panelEl.replaceChildren(heading, list);
}

/**
 * حالة التوسيع الفعلية لتصنيف: الطيّ اليدوي الصريح يتجاوز كل شيء (يحترم
 * قرار المستخدم حتى لو كان التصنيف سيُوسَّع تلقائيًا أصلاً)، ثم التوسيع
 * اليدوي الصريح، ثم التوسيع التلقائي الافتراضي عند وجود مواقع مطابقة.
 * @param {any} collection
 * @param {Array<any>} matchedItems
 */
function isExpanded(collection, matchedItems) {
  if (collapsedIds.has(collection.id)) return false;
  if (expandedIds.has(collection.id)) return true;
  return matchedItems.length > 0;
}

function buildCollectionRow(collection, locale) {
  const matchedItems = Array.isArray(collection.matchedItems) ? collection.matchedItems : [];
  const expanded = isExpanded(collection, matchedItems);

  const wrap = document.createElement("div");
  wrap.className = "collection-row keepit-search-enhance__row";

  const mainBtn = document.createElement("button");
  mainBtn.type = "button";
  mainBtn.className = "collection-row__main";
  mainBtn.dataset.focusKey = `expand-${collection.id}`;
  mainBtn.setAttribute("aria-expanded", String(expanded));
  mainBtn.setAttribute(
    "aria-label",
    t(locale, expanded ? "collapseAriaLabel" : "expandAriaLabel", { name: collection.name }),
  );

  const dot = document.createElement("span");
  dot.className = "color-dot";
  dot.dataset.color = collection.color;

  const nameEl = document.createElement("span");
  nameEl.className = "collection-row__name";
  nameEl.textContent = collection.name;
  nameEl.title = collection.name;

  const countEl = document.createElement("span");
  countEl.className = "count-badge";
  countEl.textContent = String(collection.items?.length ?? 0);

  const chevron = document.createElement("span");
  chevron.className = "collection-row__chevron keepit-search-enhance__chevron";
  chevron.innerHTML = ICON_CHEVRON;
  if (expanded) chevron.classList.add("is-expanded");

  mainBtn.append(dot, nameEl, countEl, chevron);
  mainBtn.addEventListener("click", () => {
    if (expanded) {
      expandedIds.delete(collection.id);
      collapsedIds.add(collection.id);
    } else {
      collapsedIds.delete(collection.id);
      expandedIds.add(collection.id);
    }
    // إعادة رسم فورية بدل انتظار "input" جديد — نعتمد على آخر نتائج معروفة
    // بدل استدعاء الشبكة/التخزين مجددًا لمجرد تبديل التوسيع. نحافظ على
    // تركيز زر التوسيع نفسه (rerenderPreservingFocus) بدل أن يفقده مستخدم
    // لوحة المفاتيح بعد كل ضغطة — render() تُعيد بناء اللوحة بالكامل
    // (panelEl.replaceChildren) فيُستبدل mainBtn بعنصر جديد تمامًا لولا ذلك.
    if (currentPanelEl) rerenderPreservingFocus(currentPanelEl, () => render(currentPanelEl, lastRenderedMatches));
  });

  wrap.append(mainBtn);

  if (expanded) {
    // إن طابق البحث مواقع محددة، اعرضها هي فقط (نتيجة بحث دقيقة، لا إغراق
    // بكل محتوى التصنيف)؛ غير ذلك (تطابق بالاسم فقط) اعرض كل المواقع كما
    // كان الحال قبل هذه التوسعة تمامًا — لا تغيير في ذلك المسار.
    const items = matchedItems.length > 0 ? matchedItems : Array.isArray(collection.items) ? collection.items : [];
    const itemsWrap = document.createElement("div");
    itemsWrap.className = "item-list keepit-search-enhance__items";

    if (items.length === 0) {
      const emptyNote = document.createElement("p");
      emptyNote.className = "keepit-search-enhance__empty-note";
      emptyNote.textContent = t(locale, "emptyCollectionNote");
      itemsWrap.append(emptyNote);
    } else {
      for (const item of items) {
        itemsWrap.append(buildItemRow(item, ITEM_ROW_CLASSES));
      }
      const remaining = (collection.matchedItemsTotal ?? 0) - matchedItems.length;
      if (matchedItems.length > 0 && remaining > 0) {
        const moreNote = document.createElement("p");
        moreNote.className = "keepit-search-enhance__empty-note";
        moreNote.textContent = t(locale, "moreMatchesNote", { count: remaining });
        itemsWrap.append(moreNote);
      }
    }

    wrap.append(itemsWrap);
  }

  return wrap;
}

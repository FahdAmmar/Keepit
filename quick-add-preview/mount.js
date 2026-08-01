/**
 * quick-add-preview/mount.js
 * ---------------------------------------------------------------------------
 * يُلحق لوحة "الروابط المحفوظة في هذا التصنيف" مباشرة أسفل بطاقة الإضافة
 * السريعة (.quick-add) في النافذة المنبثقة فقط — صفحة الإعدادات لا تحتوي
 * على هذه البطاقة إطلاقًا (لا مفهوم "تبويب حالي" هناك)، فلا حاجة لمحدِّد
 * مزدوج كما في search-enhance/mount.js.
 *
 * لماذا هذه الميزة تحديدًا ممكنة بسهولة: عنصر <select class="quick-add__
 * select"> داخل popup/main.js (المضغوطة) هو <select> حقيقي أصيل، وليس
 * قائمة منسدلة مخصَّصة — كل <option> فيه قيمته (value) هي معرّف التصنيف
 * ذاته، ويُطلق حدث "change" أصيلًا عند تبديل الاختيار. نستمع لهذا الحدث
 * مباشرة بلا أي وسيط أو محاكاة. لا تعديل على main.js إطلاقًا؛ فقط مستمع
 * حدث إضافي على نفس العنصر (مستمعون متعددون على نفس العنصر لا يتعارضون)
 * وإدراج عنصر شقيق جديد بعد بطاقة .quick-add كاملة.
 *
 * سبب استخدام MutationObserver دائم بدل "مرة واحدة فقط": main.js تعيد بناء
 * بطاقة .quick-add بالكامل (عنصر <select> جديد تمامًا في الذاكرة) عند أي
 * تغيير حالة تقريبًا — تبديل الشاشة (قائمة ↔ تفاصيل)، تبديل السمة أو
 * اللغة، أو نجاح عملية إضافة. يجب إعادة الربط مع كل نسخة جديدة من العنصر،
 * تمامًا كما يوثّق تعليق search-enhance/mount.js لنفس السبب بالضبط.
 *
 * لماذا نتجاهل الحالة التي يحتوي فيها <select> على خيار واحد فقط: هذا
 * يحدث حصرًا داخل شاشة "تفاصيل التصنيف" (حيث تُقفَل البطاقة على التصنيف
 * المفتوح أصلاً، ولا معنى لتبديل الاختيار). وفي هذه الحالة تُعرض روابط
 * ذلك التصنيف بالفعل مباشرة أسفل الشاشة — إظهار معاينة هنا سيكون تكرارًا
 * بصريًا لمحتوى ظاهر أصلاً، بلا أي فائدة إضافية.
 */
import { buildItemRow } from "../shared/item-row.js";
import { readCollectionById } from "./store.js";
import { t, resolveLocale } from "./i18n.js";
import { KEEPIT_STATE_KEY, KEEPIT_LOCALE_KEY, CARD_SELECTOR, SELECT_SELECTOR } from "./constants.js";

const PANEL_CLASS = "keepit-quick-add-preview";
const ITEM_ROW_CLASSES = Object.freeze({
  rowClass: "keepit-quick-add-preview__item-row",
  faviconFallbackClass: "keepit-quick-add-preview__favicon-fallback",
});

/** @type {HTMLSelectElement | null} */
let currentSelectEl = null;
/** @type {HTMLDivElement | null} */
let currentPanelEl = null;
/** رقم تسلسلي لآخر طلب قراءة — يمنع عرض نتيجة قراءة متأخرة (قديمة) تصل
 *  بعد تبديل الاختيار مرة أخرى أثناء انتظارها (سباق حالات كلاسيكي مع
 *  عملية async)، دون الحاجة لإلغاء الطلب نفسه فعليًا. */
let requestToken = 0;

let currentLocale = "ar";

export function mountQuickAddPreview() {
  attachIfPresent();
  new MutationObserver(() => attachIfPresent()).observe(document.body, { childList: true, subtree: true });

  chrome.storage.local.get(KEEPIT_LOCALE_KEY).then((data) => {
    currentLocale = resolveLocale(data[KEEPIT_LOCALE_KEY]);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    if (KEEPIT_LOCALE_KEY in changes) {
      currentLocale = resolveLocale(changes[KEEPIT_LOCALE_KEY].newValue);
      if (currentSelectEl && currentPanelEl?.hidden === false) void updatePreview(currentSelectEl.value);
    }

    if (!(KEEPIT_STATE_KEY in changes)) return;
    // تحديث فوري للمعاينة عند إضافة رابط جديد (مثلًا بعد الضغط على
    // "إضافة")، فيظهر مباشرة بلا حاجة لإعادة اختيار التصنيف يدويًا.
    if (currentSelectEl && document.body.contains(currentSelectEl) && currentSelectEl.value) {
      void updatePreview(currentSelectEl.value);
    }
  });
}

function attachIfPresent() {
  const card = document.querySelector(CARD_SELECTOR);
  const select = card?.querySelector(SELECT_SELECTOR);
  if (!(select instanceof HTMLSelectElement) || select === currentSelectEl) return; // لا شيء جديد

  // العنصر القديم (إن وُجد) كان شقيقًا لبطاقة .quick-add السابقة التي
  // استبدلتها main.js بالكامل الآن. "استبدال" main.js للبطاقة لا يزيل
  // تلقائيًا عنصرًا شقيقًا أضفناه نحن خارج نطاقها، فيبقى معلَّقًا (يعرض
  // بيانات قديمة) ما لم نزله صراحةً هنا. إزالة عنصر منفصل أصلاً عن الشجرة
  // فعليًا (كما يحدث أحيانًا حين تستبدل main.js حاوية أكبر دفعة واحدة)
  // عملية آمنة بلا أي تأثير (no-op).
  currentPanelEl?.remove();

  const panelEl = document.createElement("div");
  panelEl.className = PANEL_CLASS;
  panelEl.id = panelEl.id || `keepit-quick-add-preview-${Math.random().toString(36).slice(2, 9)}`;
  panelEl.hidden = true;
  panelEl.setAttribute("role", "region");
  panelEl.setAttribute("aria-live", "polite");
  card.after(panelEl);

  currentSelectEl = select;
  currentPanelEl = panelEl;

  select.addEventListener("change", () => void updatePreview(select.value));

  if (select.value) void updatePreview(select.value);
}

async function updatePreview(collectionId) {
  const panelEl = currentPanelEl;
  const selectEl = currentSelectEl;
  if (!panelEl || !selectEl) return;

  // تجاهل شاشة التفاصيل (خيار واحد فقط في القائمة) — راجع الشرح أعلى الملف.
  if (selectEl.options.length <= 1) {
    panelEl.hidden = true;
    panelEl.replaceChildren();
    return;
  }

  const token = ++requestToken;
  const collection = await readCollectionById(collectionId);

  // فحص سباق حالات: قد يكون المستخدم بدَّل الاختيار مرة أخرى، أو تغيّرت
  // شاشة التطبيق بالكامل (فاستُبدل العنصر ذاته)، أثناء انتظار القراءة
  // أعلاه (وهي async).
  if (token !== requestToken) return;
  if (currentSelectEl !== selectEl || selectEl.value !== collectionId) return;

  if (!collection) {
    panelEl.hidden = true;
    panelEl.replaceChildren();
    return;
  }

  panelEl.hidden = false;
  render(panelEl, collection);
}

function render(panelEl, collection) {
  const locale = currentLocale;

  const heading = document.createElement("div");
  heading.className = "keepit-quick-add-preview__heading";
  heading.id = `${panelEl.id}-heading`;
  const headingTitle = document.createElement("span");
  headingTitle.className = "keepit-quick-add-preview__heading-title";
  headingTitle.textContent = t(locale, "previewHeading");
  const headingCount = document.createElement("span");
  headingCount.className = "count-badge";
  headingCount.textContent = String(collection.items.length);
  heading.append(headingTitle, headingCount);
  panelEl.setAttribute("aria-labelledby", heading.id);

  if (collection.items.length === 0) {
    const emptyNote = document.createElement("p");
    emptyNote.className = "keepit-quick-add-preview__empty-note";
    emptyNote.textContent = t(locale, "emptyNote");
    panelEl.replaceChildren(heading, emptyNote);
    return;
  }

  const list = document.createElement("div");
  list.className = "item-list keepit-quick-add-preview__list";
  for (const item of collection.items) {
    list.append(buildItemRow(item, ITEM_ROW_CLASSES));
  }

  panelEl.replaceChildren(heading, list);
}

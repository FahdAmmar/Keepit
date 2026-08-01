/**
 * shared/item-row.js
 * ---------------------------------------------------------------------------
 * بناء صف "رابط محفوظ" (أيقونة مفضّلة + عنوان + اسم النطاق) — مُستخرَج من
 * تكرار حرفي كامل كان موجودًا في كل من quick-add-preview/mount.js
 * وsearch-enhance/mount.js (نفس الدوال الأربع: buildItemRow، buildFavicon،
 * buildFaviconFallback، hostnameOf، بلا أي فرق سوى اسم صنف CSS إضافي).
 * توحيدها هنا يعني أن أي تحسين مستقبلي (كإتاحة، أو أمان الروابط) يُطبَّق
 * مرة واحدة فقط ويظهر أثره في كلا الميزتين تلقائيًا.
 *
 * لا يُعدَّل أي من main.js/index.js (الحزمتان المضغوطتان الأصليتان)
 * — ملف جديد بالكامل، تُحدَّث الميزتان لاستيراده بدل نسختيهما المحليتين.
 */
import { isSafeFaviconUrl } from "./safe-favicon.js";

const ICON_LINK_FALLBACK =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 14.5 9.5M8 17l-1.5 1.5a3.5 3.5 0 0 1-5-5L3 12M16 7l1.5-1.5a3.5 3.5 0 0 1 5 5L21 12"/></svg>';

/**
 * @param {{url: string, title: string, faviconUrl?: string}} item
 * @param {{rowClass?: string, faviconFallbackClass?: string}} [classes] - أصناف
 *   CSS إضافية خاصة بكل ميزة (تُضاف فوق الأصناف العامة المشتركة)، للحفاظ
 *   على التطابق البصري الحالي لكل ميزة كما هو دون أي تغيير.
 * @returns {HTMLDivElement}
 */
export function buildItemRow(item, classes = {}) {
  const link = document.createElement("a");
  link.className = "item-row__link";
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.title = item.title;

  link.append(buildFavicon(item, classes.faviconFallbackClass));

  const body = document.createElement("span");
  body.className = "item-row__body";
  const titleEl = document.createElement("p");
  titleEl.className = "item-row__title";
  titleEl.textContent = item.title;
  const hostEl = document.createElement("p");
  hostEl.className = "item-row__host";
  hostEl.textContent = hostnameOf(item.url);
  body.append(titleEl, hostEl);
  link.append(body);

  const row = document.createElement("div");
  row.className = classes.rowClass ? `item-row ${classes.rowClass}` : "item-row";
  row.append(link);
  return row;
}

function buildFavicon(item, faviconFallbackClass) {
  if (isSafeFaviconUrl(item.faviconUrl)) {
    const img = document.createElement("img");
    img.className = "favicon";
    img.src = item.faviconUrl;
    img.alt = "";
    img.loading = "lazy";
    img.addEventListener(
      "error",
      () => {
        img.replaceWith(buildFaviconFallback(faviconFallbackClass));
      },
      { once: true },
    );
    return img;
  }
  return buildFaviconFallback(faviconFallbackClass);
}

function buildFaviconFallback(faviconFallbackClass) {
  const span = document.createElement("span");
  span.className = faviconFallbackClass ? `favicon-fallback ${faviconFallbackClass}` : "favicon-fallback";
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

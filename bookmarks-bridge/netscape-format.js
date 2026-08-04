/**
 * bookmarks-bridge/netscape-format.js
 * ---------------------------------------------------------------------------
 * تحليل وبناء صيغة Netscape Bookmark File HTML القياسية غير الرسمية —
 * نفس الصيغة التي يُصدِّرها ويستوردها كل متصفح رئيسي (Chrome، Firefox،
 * Safari، Edge) منذ التسعينيات، وما زالت القاسم المشترك الوحيد للتنقّل
 * بين أدوات إدارة الإشارات المرجعية المختلفة.
 *
 * ## لماذا التحليل عبر DOMParser لا عبر Regex أو تحليل نصي يدوي
 * بنية الصيغة تاريخيًا "غير منضبطة" (وسوم <DT>/<P> غير مُغلَقة عمدًا حسب
 * التعريف الأصلي)، لكنها **صالحة تمامًا** حسب خوارزمية تحليل HTML5
 * القياسية (كل متصفح يُصحِّحها تلقائيًا بنفس الطريقة المتوقَّعة عبر قواعد
 * الإغلاق الضمني لعناصر <dt>). الاعتماد على DOMParser (لا `innerHTML` على
 * محتوى غير موثوق، ولا `eval`) يعني الاستفادة من نفس محرّك التحليل الذي
 * يستخدمه Chrome لتصدير هذه الملفات أصلاً، بدل إعادة اختراع محلّل نصي هش
 * عرضة لكسر أول ملف حقيقي معقّد (تعليقات، أسطر متعددة، ترميزات مختلفة).
 *
 * البنية الناتجة فعليًا بعد التحليل (مُتحقَّق منها تجريبيًا): كل <DT> يصبح
 * عنصرًا مستقلاً (لا متداخلاً داخل DT سابق)، ويحوي إما <A> (إشارة مرجعية)
 * أو <H3> (مجلد) + <DL> متداخلة **داخل نفس الـ DT** (لا كشقيقة له) تمثّل
 * محتوى ذلك المجلد.
 */
import { isSafeFaviconUrl } from "../shared/safe-favicon.js";

/**
 * @typedef {{type: "bookmark", title: string, url: string, faviconUrl?: string, addedAt?: number}} BookmarkNode
 * @typedef {{type: "folder", title: string, children: Array<BookmarkNode | FolderNode>}} FolderNode
 */

/**
 * @param {string} htmlText
 * @returns {Array<BookmarkNode | FolderNode>} العقد على المستوى الأعلى (جذر الملف)
 */
export function parseNetscapeHtml(htmlText) {
  const doc = new DOMParser().parseFromString(htmlText, "text/html");
  const rootDl = doc.querySelector("dl");
  if (!rootDl) return [];
  return parseDl(rootDl);
}

function parseDl(dlElement) {
  /** @type {Array<BookmarkNode | FolderNode>} */
  const nodes = [];
  for (const child of dlElement.children) {
    if (child.tagName !== "DT") continue; // يتجاهل <p> والعناصر الطارئة الأخرى بأمان

    const anchor = child.querySelector(":scope > a");
    if (anchor) {
      const url = anchor.getAttribute("href") || "";
      const title = anchor.textContent.trim() || url;
      const icon = anchor.getAttribute("icon");
      const addDate = anchor.getAttribute("add_date");
      nodes.push({
        type: "bookmark",
        title,
        url,
        ...(icon && isSafeFaviconUrl(icon) ? { faviconUrl: icon } : {}),
        ...(addedAtFrom(addDate) ? { addedAt: addedAtFrom(addDate) } : {}),
      });
      continue;
    }

    const heading = child.querySelector(":scope > h3");
    if (heading) {
      const nestedDl = child.querySelector(":scope > dl");
      nodes.push({
        type: "folder",
        title: heading.textContent.trim(),
        children: nestedDl ? parseDl(nestedDl) : [],
      });
    }
  }
  return nodes;
}

/** ADD_DATE في الصيغة القياسية ثوانٍ منذ Unix epoch، لا مللي ثانية. */
function addedAtFrom(rawSeconds) {
  const n = Number(rawSeconds);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 1000);
}

/**
 * يحوّل شجرة عقد (كما يُنتجها parseNetscapeHtml) إلى مصفوفة "مجموعات"
 * بالصيغة الموحَّدة المتوافقة مع local-sync/import-schema.js#toInternalCollections
 * — كل مجلد يحوي إشارة مرجعية مباشرة واحدة على الأقل يصبح مجموعة مستقلة،
 * بما يشمل الجذر نفسه (يُمثَّل باسم افتراضي، راجع rootName)، بنفس منطق
 * التسطيح المستخدَم في chrome-bookmarks.js (لا تصنيفات متداخلة في Keepit).
 *
 * @param {Array<BookmarkNode | FolderNode>} nodes
 * @param {string} rootName - اسم يُستخدَم للإشارات المرجعية المباشرة في
 *   جذر الملف (خارج أي مجلد) إن وُجدت.
 * @returns {Array<{name: string, items: Array<{url:string,title:string,faviconUrl?:string,createdAt?:number}>}>}
 */
export function flattenToCollections(nodes, rootName) {
  const collections = [];

  function collectDirectBookmarks(list) {
    return list
      .filter((n) => n.type === "bookmark")
      .map((n) => ({
        url: n.url,
        title: n.title,
        ...(n.faviconUrl ? { faviconUrl: n.faviconUrl } : {}),
        ...(n.addedAt ? { createdAt: n.addedAt } : {}),
      }));
  }

  function walk(list, folderTitle) {
    const items = collectDirectBookmarks(list);
    if (items.length > 0) collections.push({ name: folderTitle, items });
    for (const node of list) {
      if (node.type === "folder") walk(node.children, node.title);
    }
  }

  walk(nodes, rootName);
  return collections;
}

// ---------------------------------------------------------------------------
// التصدير: بناء ملف Netscape Bookmark File HTML من مجموعات Keepit
// ---------------------------------------------------------------------------

/**
 * @param {Array<{name: string, items: Array<{url:string, title:string, createdAt?:number}>}>} collections
 * @returns {string} نص HTML كامل صالح للحفظ كملف .html وإعادة استيراده في
 *   أي متصفح آخر.
 */
export function serializeToNetscapeHtml(collections) {
  const body = collections.map((col) => serializeFolder(col.name, col.items)).join("\n");
  return (
    `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n` +
    `<!-- تصدير من Keepit — صيغة Netscape Bookmark File القياسية، متوافقة مع أي متصفح -->\n` +
    `<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n` +
    `<TITLE>Bookmarks</TITLE>\n` +
    `<H1>Bookmarks</H1>\n` +
    `<DL><p>\n${body}\n</DL><p>\n`
  );
}

function serializeFolder(name, items) {
  const addDate = Math.round(Date.now() / 1000);
  const rows = items
    .map((item) => {
      const itemDate = item.createdAt ? Math.round(item.createdAt / 1000) : addDate;
      return `        <DT><A HREF="${escapeHtml(item.url)}" ADD_DATE="${itemDate}">${escapeHtml(item.title)}</A>`;
    })
    .join("\n");
  return (
    `    <DT><H3 ADD_DATE="${addDate}">${escapeHtml(name)}</H3>\n` + `    <DL><p>\n${rows}\n    </DL><p>`
  );
}

/** إفلات (escape) صريح لكل قيمة نصية من بيانات المستخدم قبل إدراجها في نص
 *  HTML مبني يدويًا — لا فرق هنا عن أي إدراج innerHTML؛ ملف مُصدَّر سيُفتَح
 *  لاحقًا في متصفح آخر (أو يُعاد استيراده هنا نفسه)، فإفلات ناقص يعني حقن
 *  HTML/سكربت محتمل في تلك اللحظة. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

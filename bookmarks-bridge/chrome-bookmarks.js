/**
 * bookmarks-bridge/chrome-bookmarks.js
 * ---------------------------------------------------------------------------
 * كل التعامل المباشر مع chrome.bookmarks الأصلية معزول هنا فقط — لا يمر أي
 * كود آخر في المشروع عبر هذه الواجهة. يتطلب صلاحية "bookmarks" في
 * manifest.json (لا host_permissions؛ هذه الواجهة بيانات المتصفح نفسه، لا
 * محتوى أي موقع).
 */
import { EXPORT_ROOT_FOLDER_TITLE, COLOR_CYCLE } from "./constants.js";

function dedupApi() {
  const api = /** @type {any} */ (globalThis).KeepitDedup;
  if (!api) throw new Error("KeepitDedup غير متاح — تأكد من تحميل shared/dedup.js قبل هذه الوحدة");
  return api;
}

/**
 * يبني قائمة مسطَّحة (flat) بكل مجلدات الإشارات المرجعية القابلة للاختيار
 * كنقطة بدء للاستيراد، بترتيب الشجرة الطبيعي (تصفّح بالعمق أولًا)، مع عدد
 * الإشارات المباشرة والإجمالي (بما فيها المجلدات الفرعية) لكل مجلد — حتى
 * يعرف المستخدم حجم ما سيستورده قبل الاختيار. المجلدات الفارغة تمامًا
 * (بلا إشارات مرجعية في أي عمق) تُستبعد؛ لا فائدة من عرضها.
 *
 * @returns {Promise<Array<{id: string, title: string, depth: number, directCount: number, totalCount: number}>>}
 */
export async function readFoldersForPicker() {
  const roots = await chrome.bookmarks.getTree();

  // تمريرة أولى (بعدية: الأبناء قبل الأب) لحساب عدد الإشارات المباشر
  // والإجمالي لكل مجلد — لا يمكن معرفة إجمالي مجلد قبل معرفة إجماليات كل
  // أبنائه.
  const totals = new Map();
  function computeTotals(node) {
    if (node.url) return { direct: 0, total: 0 };
    let direct = 0;
    let total = 0;
    for (const child of node.children || []) {
      if (child.url) {
        direct += 1;
        total += 1;
      } else {
        total += computeTotals(child).total;
      }
    }
    totals.set(node.id, { direct, total });
    return { direct, total };
  }
  for (const root of roots) computeTotals(root);

  // تمريرة ثانية (قبلية: الأب قبل أبنائه) لبناء قائمة العرض بترتيب
  // الشجرة الطبيعي كما يتوقّعه أي مستخدم من قائمة منسدلة هرمية — أب ثم
  // أبناؤه بالترتيب، لا أبناء ثم أب.
  const out = [];
  function collectOrdered(node, depth) {
    if (node.url) return;
    const t = totals.get(node.id);
    if (node.id !== "0" && t && t.total > 0) {
      out.push({ id: node.id, title: node.title || "", depth, directCount: t.direct, totalCount: t.total });
    }
    for (const child of node.children || []) collectOrdered(child, depth + 1);
  }
  for (const root of roots) collectOrdered(root, -1);

  return out;
}

/**
 * يقرأ مجلدًا واحدًا (وكل ما تحته من مجلدات فرعية) ويحوّله لمصفوفة
 * "مجموعات" بالصيغة الموحَّدة (نفس صيغة التصدير القياسية في
 * local-sync/export-schema.js: {name, color, pinned, items:[{url,title}]}) —
 * كل مجلد يحوي إشارة مرجعية مباشرة واحدة على الأقل يصبح مجموعة مستقلة،
 * بما في ذلك المجلد الجذري نفسه إن حوى إشارات مباشرة. Keepit لا يدعم
 * تصنيفات متداخلة، فهذا التسطيح (flattening) هو التمثيل الأمين الوحيد
 * الممكن لبنية مجلدات متداخلة.
 *
 * @param {string} rootFolderId
 * @returns {Promise<Array<{name: string, color: string, pinned: boolean, items: Array<{url:string, title:string, faviconUrl?:string}>}>>}
 */
export async function readNormalizedCollectionsFromFolder(rootFolderId) {
  const [rootNode] = await chrome.bookmarks.getSubTree(rootFolderId);
  if (!rootNode) return [];

  const collections = [];
  let colorIndex = 0;
  const nextColor = () => COLOR_CYCLE[colorIndex++ % COLOR_CYCLE.length];

  function walk(node) {
    if (node.url) return; // لا شيء لفعله هنا؛ الإشارات المفردة تُجمَع عبر أبيها
    const items = [];
    const subFolders = [];
    for (const child of node.children || []) {
      if (child.url) {
        items.push({ url: child.url, title: child.title || child.url });
      } else {
        subFolders.push(child);
      }
    }
    if (items.length > 0) {
      collections.push({ name: node.title || "", color: nextColor(), pinned: false, items });
    }
    for (const sub of subFolders) walk(sub);
  }

  walk(rootNode);
  return collections;
}

/**
 * يجد مجلد التصدير الجذري ("Keepit") تحت شريط الإشارات المرجعية، أو ينشئه
 * إن لم يكن موجودًا. البحث بالاسم فقط (لا نخزّن id في chrome.storage —
 * المستخدم قد يحذف المجلد يدويًا من إدارة الإشارات المرجعية في أي وقت،
 * ولا نريد إعادة إنشائه بمعرّف يتيم لا يطابق أي شيء فعلي).
 * @returns {Promise<string>} معرّف المجلد
 */
export async function getOrCreateExportRootFolder() {
  const tree = await chrome.bookmarks.getTree();
  const bookmarksBar = tree[0]?.children?.[0];
  if (!bookmarksBar) throw new Error("تعذّر تحديد شريط الإشارات المرجعية");

  const existing = (bookmarksBar.children || []).find((c) => !c.url && c.title === EXPORT_ROOT_FOLDER_TITLE);
  if (existing) return existing.id;

  const created = await chrome.bookmarks.create({ parentId: bookmarksBar.id, title: EXPORT_ROOT_FOLDER_TITLE });
  return created.id;
}

/**
 * يصدّر مجموعة واحدة كمجلد فرعي تحت مجلد التصدير الجذري. عملية idempotent
 * قدر الإمكان: يعيد استخدام المجلد الفرعي إن وُجد بنفس الاسم بدل إنشاء
 * نسخة مكرَّرة منه في كل مرة، ويتخطى أي إشارة مرجعية موجودة أصلاً بنفس
 * الرابط (بعد تطبيع عبر KeepitDedup.normalizeUrl) بدل تكرارها عند تصدير
 * متكرر لنفس المجموعة.
 *
 * @param {string} rootFolderId
 * @param {{name: string, items: Array<{url:string, title:string}>}} collection
 * @returns {Promise<{created: number, skipped: number}>}
 */
export async function exportCollectionToBookmarks(rootFolderId, collection) {
  const [rootNode] = await chrome.bookmarks.getSubTree(rootFolderId);
  const children = rootNode?.children || [];

  let subFolder = children.find((c) => !c.url && c.title === collection.name);
  if (!subFolder) {
    subFolder = await chrome.bookmarks.create({ parentId: rootFolderId, title: collection.name });
  }

  const existingSubTree = subFolder.children
    ? subFolder
    : (await chrome.bookmarks.getSubTree(subFolder.id))[0];
  const existingUrls = new Set(
    (existingSubTree.children || []).filter((c) => c.url).map((c) => dedupApi().normalizeUrl(c.url)),
  );

  let created = 0;
  let skipped = 0;
  for (const item of collection.items) {
    const normalized = dedupApi().normalizeUrl(item.url);
    if (normalized && existingUrls.has(normalized)) {
      skipped += 1;
      continue;
    }
    await chrome.bookmarks.create({ parentId: subFolder.id, title: item.title, url: item.url });
    if (normalized) existingUrls.add(normalized);
    created += 1;
  }

  return { created, skipped };
}

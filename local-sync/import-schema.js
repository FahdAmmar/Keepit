/**
 * local-sync/import-schema.js
 * ---------------------------------------------------------------------------
 * الاتجاه المعاكس لـ export-schema.js: يحوّل محتوى الملف المحلي (بصيغة
 * "تصدير" Keepit القياسية) إلى كائنات "تصنيف/موقع" بالشكل الداخلي الذي
 * يتوقعه التطبيق في keepit:state.
 *
 * الشكل الداخلي أُخِذ من نفس منطق الاستيراد المدمج في options/main.js
 * (الحزمة الأصلية المضغوطة) — تحديدًا حقول id (crypto.randomUUID())، وحقل
 * pinned/updatedAt على مستوى التصنيف فقط (وليس لكل عنصر)، وحقل order لكل
 * عنصر داخل التصنيف. الالتزام بنفس الشكل تمامًا ضروري: أي حقل ناقص أو زائد
 * قد يكسر عرض main.js لهذه البيانات لاحقًا.
 *
 * فلسفة التحقق: هذا الملف هو مخرَج ميزتنا نفسها في الغالب الأعظم من
 * الحالات (كُتب بواسطة writer.js في هذا المتصفح أو في متصفح آخر لنفس
 * الإضافة)، لذا لا نُطبّق نفس صرامة التحقق التي يطبّقها حوار الاستيراد
 * اليدوي على ملف قد يرفعه المستخدم من أي مصدر. نتجاهل بصمت أي عنصر/تصنيف
 * غير صالح بدل رفض الملف كله — هذا مسار خلفية تلقائي بلا مستخدم يشاهد رسالة
 * خطأ لحظة حدوثها.
 */
import { SYNC_ERRORS } from "./constants.js";

const VALID_URL_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * يتحقق من الشكل العام للملف ويُرجع مصفوفة التصنيفات الخام (بصيغة التصدير)
 * كما هي، أو يرمي خطأً مصنّفًا إن كان الملف غير صالح إطلاقًا.
 * @param {unknown} parsedJson
 * @returns {Array<any>}
 */
export function extractExportCollections(parsedJson) {
  if (
    typeof parsedJson !== "object" ||
    parsedJson === null ||
    Array.isArray(parsedJson) ||
    /** @type {any} */ (parsedJson).app !== "keepit" ||
    !Array.isArray(/** @type {any} */ (parsedJson).collections)
  ) {
    throw new ImportSchemaError(SYNC_ERRORS.INVALID_FILE);
  }
  return /** @type {any} */ (parsedJson).collections;
}

/**
 * يحوّل مصفوفة تصنيفات بصيغة التصدير إلى كائنات بالشكل الداخلي، مع توليد
 * معرّفات وحقول تشغيلية جديدة تمامًا (id، order، pinned، updatedAt).
 * التصنيفات/العناصر غير الصالحة تُتجاهَل بصمت وتُحتسَب في العدّاد المُرجَع.
 *
 * @param {Array<any>} exportCollections
 * @returns {{ collections: Array<any>, skippedCollections: number, skippedItems: number }}
 */
export function toInternalCollections(exportCollections) {
  const collections = [];
  let skippedCollections = 0;
  let skippedItems = 0;

  for (const raw of exportCollections) {
    if (typeof raw !== "object" || raw === null) {
      skippedCollections += 1;
      continue;
    }
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!name) {
      skippedCollections += 1;
      continue;
    }

    const items = Array.isArray(raw.items) ? raw.items : [];
    const internalItems = [];
    for (const item of items) {
      const converted = toInternalItem(item, internalItems.length);
      if (converted) {
        internalItems.push(converted);
      } else {
        skippedItems += 1;
      }
    }

    const now = Date.now();
    collections.push({
      id: crypto.randomUUID(),
      name,
      color: typeof raw.color === "string" && raw.color ? raw.color : "indigo",
      pinned: false,
      createdAt: now,
      updatedAt: now,
      items: internalItems,
    });
  }

  return { collections, skippedCollections, skippedItems };
}

/**
 * @param {any} raw
 * @param {number} order
 * @returns {any | null} null إن كان العنصر غير صالح (سيُتجاهل)
 */
function toInternalItem(raw, order) {
  if (typeof raw !== "object" || raw === null) return null;

  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!url || !title || !isValidHttpUrl(url)) return null;

  const faviconUrl = typeof raw.faviconUrl === "string" && raw.faviconUrl ? raw.faviconUrl : undefined;
  const note = typeof raw.note === "string" && raw.note ? raw.note.slice(0, 500) : undefined;
  const createdAt = typeof raw.createdAt === "number" && Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now();

  return {
    id: crypto.randomUUID(),
    url,
    title,
    ...(faviconUrl ? { faviconUrl } : {}),
    ...(note ? { note } : {}),
    createdAt,
    order,
  };
}

/** @param {string} url */
function isValidHttpUrl(url) {
  try {
    return VALID_URL_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

export class ImportSchemaError extends Error {
  /** @param {string} code - أحد قيم SYNC_ERRORS */
  constructor(code) {
    super(code);
    this.code = code;
  }
}

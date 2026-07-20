/**
 * local-sync/writer.js
 * ---------------------------------------------------------------------------
 * منطق الكتابة الفعلي على القرص. مُستخدَم من مكانين:
 *   - offscreen/offscreen.js: للكتابة التلقائية في الخلفية، حتى إن كانت
 *     صفحة الإعدادات والنافذة المنبثقة مغلقتين كلتاهما.
 *   - options/local-sync-panel.js: للكتابة الفورية عند اختيار المجلد لأول
 *     مرة أو عند الضغط على "مزامنة الآن".
 *
 * كلا السياقين مستندان (Document) حقيقيان، لذا File System Access API
 * متاحة في كليهما بنفس الطريقة تمامًا — هذا ما يجعل تقاسم نفس الدالة
 * ممكنًا وآمنًا (لا تكرار للمنطق، مصدر واحد للحقيقة).
 */
import { getDirectoryHandle } from "./handle-store.js";
import { buildExportPayload } from "./export-schema.js";
import { DEFAULT_FILE_NAME, SYNC_ERRORS } from "./constants.js";

const UNSAFE_FILENAME_CHARS = /[\/\\:*?"<>|\u0000-\u001F]/;

/**
 * @param {{ state: any, fileName?: string }} params
 * @returns {Promise<{ ok: true, syncedAt: number, fileName: string } | { ok: false, error: string }>}
 */
export async function writeStateToLocalFolder({ state, fileName }) {
  try {
    const dirHandle = await getDirectoryHandle();
    if (!dirHandle) {
      return { ok: false, error: SYNC_ERRORS.NOT_CONFIGURED };
    }

    // queryPermission لا يحتاج بادرة مستخدم (user gesture) — فقط يقرأ
    // الحالة الحالية للإذن الممنوح مسبقًا. إن لم يكن "granted" فلا يمكننا
    // إعادة طلبه من هنا تلقائيًا (سواء من offscreen أو حتى من صفحة
    // الإعدادات دون نقرة فعلية)، لذلك نُرجع خطأ واضحًا تعرضه الواجهة مع
    // زر "امنح الإذن مجددًا".
    const permission = await dirHandle.queryPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      return { ok: false, error: SYNC_ERRORS.PERMISSION_REQUIRED };
    }

    const safeName = sanitizeFileName(fileName) || DEFAULT_FILE_NAME;
    const payload = buildExportPayload(state);
    const json = JSON.stringify(payload, null, 2);

    const fileHandle = await dirHandle.getFileHandle(safeName, { create: true });
    const writable = await fileHandle.createWritable();
    try {
      await writable.write(json);
    } finally {
      await writable.close();
    }

    return { ok: true, syncedAt: Date.now(), fileName: safeName };
  } catch (err) {
    return { ok: false, error: mapDomError(err) };
  }
}

/**
 * يمنع محارف المسار/الأدلة لإبقاء الملف داخل المجلد المُختار فقط، ويفرض
 * امتداد .json. دفاع إضافي (defense in depth): حتى أن getFileHandle على
 * FileSystemDirectoryHandle لا يسمح أصلاً بالخروج من المجلد عبر "..", لكن
 * نتحقق يدويًا لأن اسم الملف قيمة يُدخلها المستخدم عبر حقل نصي.
 * @param {unknown} name
 */
function sanitizeFileName(name) {
  if (typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") return "";
  if (UNSAFE_FILENAME_CHARS.test(trimmed)) return "";
  if (trimmed.length > 200) return "";
  return trimmed.toLowerCase().endsWith(".json") ? trimmed : `${trimmed}.json`;
}

/** @param {unknown} err */
function mapDomError(err) {
  const name = err && typeof err === "object" && "name" in err ? String(err.name) : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return SYNC_ERRORS.PERMISSION_REQUIRED;
  }
  if (name === "NotFoundError") {
    return SYNC_ERRORS.FOLDER_MISSING;
  }
  console.error("[Keepit local sync] write failed", err);
  return SYNC_ERRORS.WRITE_FAILED;
}

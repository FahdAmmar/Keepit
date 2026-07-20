/**
 * local-sync/reader.js
 * ---------------------------------------------------------------------------
 * القراءة الفعلية من القرص — نظير writer.js تمامًا لكن بالاتجاه المعاكس.
 * مُستخدَم من نفس مكانين: offscreen/offscreen.js (السحب التلقائي في
 * الخلفية) وoptions/local-sync-panel.js (زر "تحقّق الآن").
 *
 * ملاحظة تصميم مهمة: عدم وجود الملف إطلاقًا (أول تشغيل قبل أي كتابة، أو
 * المستخدم حذفه يدويًا) ليس خطأً من منظور هذه الدالة — تُرجع ok:true مع
 * collections:null ليقرر الطرف المستدعي ماذا يعني ذلك (عادة: لا شيء
 * لسحبه بعد).
 */
import { getDirectoryHandle } from "./handle-store.js";
import { extractExportCollections, ImportSchemaError } from "./import-schema.js";
import { DEFAULT_FILE_NAME, SYNC_ERRORS } from "./constants.js";

/**
 * @param {{ fileName?: string }} params
 * @returns {Promise<
 *   | { ok: true, collections: Array<any> | null }
 *   | { ok: false, error: string }
 * >}
 */
export async function readStateFromLocalFolder({ fileName }) {
  try {
    const dirHandle = await getDirectoryHandle();
    if (!dirHandle) {
      return { ok: false, error: SYNC_ERRORS.NOT_CONFIGURED };
    }

    // queryPermission لا يحتاج بادرة مستخدم — نفس المنطق الموثَّق في writer.js.
    const permission = await dirHandle.queryPermission({ mode: "readwrite" });
    if (permission !== "granted") {
      return { ok: false, error: SYNC_ERRORS.PERMISSION_REQUIRED };
    }

    const safeName = fileName && fileName.trim() ? fileName.trim() : DEFAULT_FILE_NAME;

    /** @type {FileSystemFileHandle} */
    let fileHandle;
    try {
      fileHandle = await dirHandle.getFileHandle(safeName, { create: false });
    } catch (err) {
      if (err && typeof err === "object" && err.name === "NotFoundError") {
        return { ok: true, collections: null }; // لا يوجد ملف بعد؛ ليس خطأً
      }
      throw err;
    }

    const file = await fileHandle.getFile();
    const text = await file.text();
    if (!text.trim()) {
      return { ok: true, collections: null }; // ملف فارغ (مثلاً أُنشئ يدويًا) يُعامَل كعدم وجود بيانات
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: SYNC_ERRORS.INVALID_FILE };
    }

    const collections = extractExportCollections(parsed);
    return { ok: true, collections };
  } catch (err) {
    if (err instanceof ImportSchemaError) {
      return { ok: false, error: err.code };
    }
    return { ok: false, error: mapDomError(err) };
  }
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
  console.error("[Keepit local sync] read failed", err);
  return SYNC_ERRORS.READ_FAILED;
}

/**
 * local-sync/handle-store.js
 * ---------------------------------------------------------------------------
 * تخزين/استرجاع FileSystemDirectoryHandle عبر IndexedDB.
 *
 * لماذا IndexedDB وليس chrome.storage؟ chrome.storage (بنوعيه local وsync)
 * يقبل فقط بيانات قابلة للتسلسل كـ JSON، بينما FileSystemDirectoryHandle
 * كائن حي (structured-cloneable) لا يمكن تحويله إلى JSON. المتصفح يدعم
 * تخزين هذا النوع من الكائنات مباشرة في IndexedDB، وهذه هي الطريقة
 * القياسية الموصى بها (نفس ما يفعله VS Code for Web على سبيل المثال).
 *
 * تنبيه أمني/خصوصية متعمّد: هذا التخزين محلي بحت (IndexedDB الخاص بأصل
 * الإضافة chrome-extension://<id>) ولا يمر أبدًا عبر chrome.storage.sync،
 * لذلك لا يُرفَع أي شيء متعلق ببنية ملفات جهاز المستخدم إلى حساب Google.
 */
import { DB_NAME, DB_VERSION, DB_STORE, DB_HANDLE_KEY } from "./constants.js";

/** @returns {Promise<IDBDatabase>} */
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) {
        request.result.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

/**
 * @template T
 * @param {IDBDatabase} db
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest<T>} executor
 * @returns {Promise<T>}
 */
function runTransaction(db, mode, executor) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, mode);
    const store = tx.objectStore(DB_STORE);
    const request = executor(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB transaction failed"));
  });
}

/** @param {FileSystemDirectoryHandle} handle */
export async function saveDirectoryHandle(handle) {
  const db = await openDb();
  try {
    await runTransaction(db, "readwrite", (store) => store.put(handle, DB_HANDLE_KEY));
  } finally {
    db.close();
  }
}

/** @returns {Promise<FileSystemDirectoryHandle | null>} */
export async function getDirectoryHandle() {
  const db = await openDb();
  try {
    const handle = await runTransaction(db, "readonly", (store) => store.get(DB_HANDLE_KEY));
    return handle ?? null;
  } finally {
    db.close();
  }
}

export async function clearDirectoryHandle() {
  const db = await openDb();
  try {
    await runTransaction(db, "readwrite", (store) => store.delete(DB_HANDLE_KEY));
  } finally {
    db.close();
  }
}

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearDirectoryHandle, getDirectoryHandle, saveDirectoryHandle } from "./handle-store.js";

/**
 * jsdom (بيئة الاختبار المستخدمة في vitest.config.js) لا يوفّر IndexedDB
 * إطلاقًا. هذا هو الملف الوحيد في المشروع الذي يحتاجه فعليًا (تحقّقنا:
 * لا مستهلك آخر)، فإضافة مكتبة كاملة (fake-indexeddb) لأجل ملف واحد صغير
 * غير مبرَّرة — بديل بسيط داخلي يكفي: نفس العمليات الأربع فقط التي
 * يستخدمها handle-store.js (open/transaction/objectStore/put/get/delete)،
 * لا واجهة IndexedDB كاملة.
 */
function installFakeIndexedDB() {
  const databases = new Map(); // اسم القاعدة → Map(مفتاح → قيمة) — يحاكي بقاء البيانات بين اتصالات open() المتعددة

  globalThis.indexedDB = {
    open(name) {
      const request = /** @type {any} */ ({ result: null, onupgradeneeded: null, onsuccess: null, onerror: null });
      queueMicrotask(() => {
        if (!databases.has(name)) databases.set(name, new Map());
        const table = databases.get(name);
        const db = {
          objectStoreNames: { contains: () => true }, // مبسَّط: قاعدة بمخزن واحد فقط، كافٍ لهذا الاستخدام
          createObjectStore() {},
          close() {},
          transaction: () => ({
            objectStore: () => ({
              put(value, key) {
                const req = /** @type {any} */ ({ result: undefined, onsuccess: null, onerror: null });
                queueMicrotask(() => {
                  table.set(key, value);
                  req.onsuccess?.();
                });
                return req;
              },
              get(key) {
                const req = /** @type {any} */ ({ result: undefined, onsuccess: null, onerror: null });
                queueMicrotask(() => {
                  req.result = table.get(key);
                  req.onsuccess?.();
                });
                return req;
              },
              delete(key) {
                const req = /** @type {any} */ ({ result: undefined, onsuccess: null, onerror: null });
                queueMicrotask(() => {
                  table.delete(key);
                  req.onsuccess?.();
                });
                return req;
              },
            }),
          }),
        };
        request.result = db;
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };

  return () => {
    databases.clear();
    delete /** @type {any} */ (globalThis).indexedDB;
  };
}

describe("local-sync/handle-store.js", () => {
  let uninstall;

  beforeEach(() => {
    uninstall = installFakeIndexedDB();
  });

  afterEach(() => {
    uninstall();
  });

  it("تُرجع null عند عدم وجود أي مقبض محفوظ بعد", async () => {
    expect(await getDirectoryHandle()).toBeNull();
  });

  it("تحفظ المقبض وتُرجعه كما هو في اتصال لاحق منفصل", async () => {
    const fakeHandle = { kind: "directory", name: "keepit-sync" };

    await saveDirectoryHandle(fakeHandle);
    expect(await getDirectoryHandle()).toEqual(fakeHandle);
  });

  it("تمسح المقبض المحفوظ، فتُرجع القراءة التالية null مجددًا", async () => {
    await saveDirectoryHandle({ kind: "directory", name: "keepit-sync" });
    await clearDirectoryHandle();
    expect(await getDirectoryHandle()).toBeNull();
  });
});

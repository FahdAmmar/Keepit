import { beforeEach, describe, expect, it, vi } from "vitest";
import { SYNC_ERRORS } from "./constants.js";

// نُحاكي طبقة تخزين المقبض فقط (IndexedDB غير متاحة في بيئة الاختبار أصلًا)؛
// FileSystemDirectoryHandle/FileSystemFileHandle نُزوّدهما بأنفسنا أدناه
// بقدر ما تحتاجه reader.js فقط، بنفس أسلوب محاكاة reader.js في merge-pull.test.js.
vi.mock("./handle-store.js", () => ({
  getDirectoryHandle: vi.fn(),
}));

const { getDirectoryHandle } = await import("./handle-store.js");
const { readStateFromLocalFolder } = await import("./reader.js");

/** @param {string} name */
function notFoundError(name = "NotFoundError") {
  const err = new Error(name);
  err.name = name;
  return err;
}

function makeDirHandle({ permission = "granted", fileText = "", fileMissing = false } = {}) {
  return {
    queryPermission: vi.fn(async () => permission),
    getFileHandle: vi.fn(async () => {
      if (fileMissing) throw notFoundError();
      return { getFile: async () => ({ text: async () => fileText }) };
    }),
  };
}

describe("local-sync/reader.js — readStateFromLocalFolder", () => {
  beforeEach(() => {
    getDirectoryHandle.mockReset();
  });

  it("تُرجع NOT_CONFIGURED عند عدم وجود مجلد مُعَدّ أصلًا", async () => {
    getDirectoryHandle.mockResolvedValue(null);
    expect(await readStateFromLocalFolder({})).toEqual({ ok: false, error: SYNC_ERRORS.NOT_CONFIGURED });
  });

  it("تُرجع PERMISSION_REQUIRED عندما لا يكون الإذن granted", async () => {
    getDirectoryHandle.mockResolvedValue(makeDirHandle({ permission: "prompt" }));
    expect(await readStateFromLocalFolder({})).toEqual({ ok: false, error: SYNC_ERRORS.PERMISSION_REQUIRED });
  });

  it("تُعامل عدم وجود الملف كنجاح بلا بيانات (collections: null)، لا كخطأ", async () => {
    getDirectoryHandle.mockResolvedValue(makeDirHandle({ fileMissing: true }));
    expect(await readStateFromLocalFolder({})).toEqual({ ok: true, collections: null });
  });

  it("تُعامل الملف الفارغ (أو الحاوي مسافات فقط) كنجاح بلا بيانات أيضًا", async () => {
    getDirectoryHandle.mockResolvedValue(makeDirHandle({ fileText: "   \n  " }));
    expect(await readStateFromLocalFolder({})).toEqual({ ok: true, collections: null });
  });

  it("تُرجع INVALID_FILE عندما يفشل تحليل JSON نفسه", async () => {
    getDirectoryHandle.mockResolvedValue(makeDirHandle({ fileText: "{ not valid json" }));
    expect(await readStateFromLocalFolder({})).toEqual({ ok: false, error: SYNC_ERRORS.INVALID_FILE });
  });

  it("تُرجع INVALID_FILE أيضًا عندما يكون JSON صحيحًا لكن الشكل غير متوقَّع (app/collections مفقودان)", async () => {
    getDirectoryHandle.mockResolvedValue(makeDirHandle({ fileText: JSON.stringify({ some: "other-shape" }) }));
    expect(await readStateFromLocalFolder({})).toEqual({ ok: false, error: SYNC_ERRORS.INVALID_FILE });
  });

  it("تُرجع التصنيفات الفعلية عند نجاح القراءة والتحقق من الشكل", async () => {
    const collections = [{ id: "x", name: "Test", color: "indigo", pinned: false, updatedAt: 1, items: [] }];
    getDirectoryHandle.mockResolvedValue(
      makeDirHandle({ fileText: JSON.stringify({ app: "keepit", collections }) }),
    );
    expect(await readStateFromLocalFolder({})).toEqual({ ok: true, collections });
  });

  it("تستخدم اسم الملف الافتراضي عند عدم تمرير fileName، وتُمرّر الاسم المُعطى كما هو خلاف ذلك", async () => {
    const dirHandle = makeDirHandle({ fileMissing: true });
    getDirectoryHandle.mockResolvedValue(dirHandle);

    await readStateFromLocalFolder({});
    expect(dirHandle.getFileHandle).toHaveBeenCalledWith("keepit-data.json", { create: false });

    await readStateFromLocalFolder({ fileName: "custom.json" });
    expect(dirHandle.getFileHandle).toHaveBeenCalledWith("custom.json", { create: false });
  });
});

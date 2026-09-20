import { beforeEach, describe, expect, it, vi } from "vitest";
import { SYNC_ERRORS } from "./constants.js";
import { buildExportPayload } from "./export-schema.js";

// نفس أسلوب reader.test.js: نُحاكي طبقة تخزين المقبض فقط، ونزوّد
// FileSystemDirectoryHandle/FileSystemFileHandle/FileSystemWritableFileStream
// بأنفسنا بقدر ما تحتاجه writer.js فقط.
vi.mock("./handle-store.js", () => ({
  getDirectoryHandle: vi.fn(),
}));

const { getDirectoryHandle } = await import("./handle-store.js");
const { writeStateToLocalFolder } = await import("./writer.js");

/** @param {string} name */
function domError(name) {
  const err = new Error(name);
  err.name = name;
  return err;
}

function makeDirHandle({ permission = "granted", getFileHandleImpl, writeImpl } = {}) {
  const writable = {
    write: vi.fn(writeImpl ?? (async () => {})),
    close: vi.fn(async () => {}),
  };
  const fileHandle = { getFile: async () => ({ text: async () => "" }), createWritable: vi.fn(async () => writable) };
  return {
    queryPermission: vi.fn(async () => permission),
    getFileHandle: vi.fn(getFileHandleImpl ?? (async () => fileHandle)),
    _writable: writable,
    _fileHandle: fileHandle,
  };
}

function sampleState() {
  return { schemaVersion: 1, collections: [], lastUsedCollectionId: null };
}

describe("local-sync/writer.js — writeStateToLocalFolder", () => {
  beforeEach(() => {
    getDirectoryHandle.mockReset();
  });

  it("تُرجع NOT_CONFIGURED عند عدم وجود مجلد مُعَدّ أصلًا", async () => {
    getDirectoryHandle.mockResolvedValue(null);
    expect(await writeStateToLocalFolder({ state: sampleState() })).toEqual({
      ok: false,
      error: SYNC_ERRORS.NOT_CONFIGURED,
    });
  });

  it("تُرجع PERMISSION_REQUIRED عندما لا يكون الإذن granted، ولا تحاول الكتابة إطلاقًا", async () => {
    const dirHandle = makeDirHandle({ permission: "prompt" });
    getDirectoryHandle.mockResolvedValue(dirHandle);
    expect(await writeStateToLocalFolder({ state: sampleState() })).toEqual({
      ok: false,
      error: SYNC_ERRORS.PERMISSION_REQUIRED,
    });
    expect(dirHandle.getFileHandle).not.toHaveBeenCalled();
  });

  it("تكتب المحتوى الصحيح (مطابقًا لـ buildExportPayload) وتُغلق الملف، وتُرجع syncedAt واسم الملف", async () => {
    const dirHandle = makeDirHandle();
    getDirectoryHandle.mockResolvedValue(dirHandle);
    const state = sampleState();

    const result = await writeStateToLocalFolder({ state, fileName: "my-data" });

    expect(dirHandle.getFileHandle).toHaveBeenCalledWith("my-data.json", { create: true });

    // exportedAt طابع زمني حي (Date.now()) داخل buildExportPayload نفسها، لذا
    // نقارن المحتوى المكتوب بنيويًا بدل سلسلة JSON حرفية (لتفادي هشاشة توقيت).
    const written = JSON.parse(dirHandle._writable.write.mock.calls[0][0]);
    const expectedPayload = buildExportPayload(state);
    expect({ ...written, exportedAt: expect.any(Number) }).toEqual({
      ...expectedPayload,
      exportedAt: expect.any(Number),
    });
    expect(dirHandle._writable.close).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.fileName).toBe("my-data.json");
    expect(typeof result.syncedAt).toBe("number");
  });

  it("تستخدم اسم الملف الافتراضي عند اسم غير آمن (محارف مسار) أو فارغ", async () => {
    const dirHandle = makeDirHandle();
    getDirectoryHandle.mockResolvedValue(dirHandle);

    await writeStateToLocalFolder({ state: sampleState(), fileName: "../secret" });
    expect(dirHandle.getFileHandle).toHaveBeenCalledWith("keepit-data.json", { create: true });

    await writeStateToLocalFolder({ state: sampleState(), fileName: "   " });
    expect(dirHandle.getFileHandle).toHaveBeenLastCalledWith("keepit-data.json", { create: true });
  });

  it("لا تكرّر امتداد .json إن كان موجودًا أصلًا (بغضّ النظر عن حالة الأحرف)", async () => {
    const dirHandle = makeDirHandle();
    getDirectoryHandle.mockResolvedValue(dirHandle);

    await writeStateToLocalFolder({ state: sampleState(), fileName: "backup.JSON" });
    expect(dirHandle.getFileHandle).toHaveBeenCalledWith("backup.JSON", { create: true });
  });

  it("تُغلق الملف حتى لو فشلت الكتابة نفسها (finally)، وتُرجع خطأً مصنَّفًا", async () => {
    const dirHandle = makeDirHandle({ writeImpl: () => Promise.reject(domError("QuotaExceededError")) });
    getDirectoryHandle.mockResolvedValue(dirHandle);

    const result = await writeStateToLocalFolder({ state: sampleState() });

    expect(dirHandle._writable.close).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, error: SYNC_ERRORS.WRITE_FAILED });
  });

  it("تُترجم NotAllowedError من getFileHandle إلى PERMISSION_REQUIRED عبر mapDomError المشترك", async () => {
    const dirHandle = makeDirHandle({
      getFileHandleImpl: () => Promise.reject(domError("NotAllowedError")),
    });
    getDirectoryHandle.mockResolvedValue(dirHandle);

    expect(await writeStateToLocalFolder({ state: sampleState() })).toEqual({
      ok: false,
      error: SYNC_ERRORS.PERMISSION_REQUIRED,
    });
  });
});

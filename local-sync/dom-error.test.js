import { describe, expect, it, vi } from "vitest";
import { mapDomError } from "./dom-error.js";

describe("local-sync/dom-error.js", () => {
  it("يحوّل أخطاء الإذن (NotAllowedError وSecurityError) إلى permission-required", () => {
    expect(mapDomError({ name: "NotAllowedError" }, "read-failed", "test")).toBe("permission-required");
    expect(mapDomError({ name: "SecurityError" }, "read-failed", "test")).toBe("permission-required");
  });

  it("يحوّل NotFoundError إلى folder-missing", () => {
    expect(mapDomError({ name: "NotFoundError" }, "read-failed", "test")).toBe("folder-missing");
  });

  it("يستخدم كود الخطأ الاحتياطي المُمرَّر عند عدم التعرّف على اسم الاستثناء، ويسجّل التفاصيل في console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(mapDomError({ name: "QuotaExceededError" }, "write-failed", "write failed")).toBe("write-failed");
    expect(mapDomError(new Error("boom"), "read-failed", "read failed")).toBe("read-failed");
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it("لا يرمي خطأ عند تمرير قيمة غير كائن (undefined، نص، رقم...)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(mapDomError(undefined, "read-failed", "test")).toBe("read-failed");
    expect(mapDomError("plain string", "read-failed", "test")).toBe("read-failed");
    spy.mockRestore();
  });
});

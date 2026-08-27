import { describe, it, expect, vi, afterEach } from "vitest";
import { detectSystemLocale, createTranslator } from "./i18n-engine.js";

describe("detectSystemLocale", () => {
  it('يكتشف العربية من أي كود لغة يبدأ بـ "ar"', () => {
    expect(detectSystemLocale("ar-SA")).toBe("ar");
    expect(detectSystemLocale("ar")).toBe("ar");
  });

  it("يرجع للإنجليزية لأي لغة أخرى", () => {
    expect(detectSystemLocale("en-US")).toBe("en");
    expect(detectSystemLocale("fr")).toBe("en");
    expect(detectSystemLocale("de-DE")).toBe("en");
  });

  it("يرجع للعربية افتراضيًا لمدخل فارغ", () => {
    expect(detectSystemLocale("")).toBe("ar");
  });
});

describe("createTranslator", () => {
  const STRINGS = {
    ar: { hello: "مرحبا {name}", onlyAr: "فقط بالعربية" },
    en: { hello: "Hello {name}" },
  };

  describe("resolveLocale", () => {
    it('يقبل "ar" أو "en" كما هما مباشرة', () => {
      const { resolveLocale } = createTranslator(STRINGS);
      expect(resolveLocale("ar")).toBe("ar");
      expect(resolveLocale("en")).toBe("en");
    });

    it('يرجع لكشف لغة النظام لـ "system"', () => {
      const { resolveLocale } = createTranslator(STRINGS);
      vi.stubGlobal("navigator", { language: "ar-EG" });
      expect(resolveLocale("system")).toBe("ar");
      vi.unstubAllGlobals();
    });

    it(
      "لا يُعيد قيمة تالفة/غير صالحة كما هي — يرجع لكشف لغة النظام بدلاً من ذلك " +
        "(هذا بالضبط الإصلاح: كانت النسخة القديمة تُعيد أي قيمة truthy كما هي بلا أي تحقق)",
      () => {
        const { resolveLocale } = createTranslator(STRINGS);
        vi.stubGlobal("navigator", { language: "en-US" });
        expect(resolveLocale("fr")).toBe("en"); // لغة غير مدعومة أصلاً
        expect(resolveLocale("قيمة-تالفة-عشوائية")).toBe("en");
        expect(resolveLocale(123)).toBe("en");
        expect(resolveLocale(undefined)).toBe("en");
        expect(resolveLocale(null)).toBe("en");
        vi.unstubAllGlobals();
      },
    );
  });

  describe("t", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("يستبدل {param} بالقيمة الفعلية", () => {
      const { t } = createTranslator(STRINGS);
      expect(t("en", "hello", { name: "Sara" })).toBe("Hello Sara");
      expect(t("ar", "hello", { name: "سارة" })).toBe("مرحبا سارة");
    });

    it("يرجع للعربية عند غياب المفتاح في اللغة المطلوبة", () => {
      const { t } = createTranslator(STRINGS);
      expect(t("en", "onlyAr")).toBe("فقط بالعربية");
    });

    it("يرجع للمفتاح نفسه كنص إن لم يوجد في أي لغة (لا يرمي خطأ)", () => {
      const { t } = createTranslator(STRINGS);
      expect(t("en", "keyDoesNotExistAnywhere")).toBe("keyDoesNotExistAnywhere");
    });

    it("بلا params، لا يحاول أي استبدال (النص كما هو، بما فيه أي {أقواس} حرفية)", () => {
      const { t } = createTranslator({ ar: { raw: "نص فيه {غير مُستبدَل}" }, en: {} });
      expect(t("ar", "raw")).toBe("نص فيه {غير مُستبدَل}");
    });
  });
});

import { describe, expect, it, vi } from "vitest";

// انتكاسة سابقة: كانت decorateColorPickers() تكتب glyph.textContent دون
// شرط، وأي كتابة (حتى بنفس القيمة) تُعدّ تعديل DOM يُعيد تشغيل المراقب
// المُثبَّت في نهاية هذا الملف (يراقب document.documentElement طوال عمر
// الصفحة) — ما يدخل الصفحة في حلقة لا نهائية تُجمّد الإضافة بمجرد فتح أي
// حوار به منتقي ألوان (إنشاء/تعديل مجموعة).
describe("decorateColorPickers", () => {
  it("لا يكتب textContent من جديد إذا لم تتغير قيمته", async () => {
    document.body.innerHTML = `<button class="color-picker__swatch" data-color="indigo"></button>`;

    // الوحدة تثبّت مراقب DOM دائمًا عند الاستيراد ولا تعرض طريقة لفصله.
    // نلتقط أي مراقب يُنشأ أثناء الاستيراد لنفصله يدويًا في النهاية، حتى لا
    // يبقى أي عمل غير متزامن معلّقًا بعد انتهاء هذا الاختبار (قد يعمل بعد
    // إزالة بيئة jsdom الخاصة بهذا الملف ويسبب خطأ "document is not defined").
    const RealMutationObserver = globalThis.MutationObserver;
    const createdObservers = [];
    globalThis.MutationObserver = class extends RealMutationObserver {
      constructor(callback) {
        super(callback);
        createdObservers.push(this);
      }
    };

    try {
      const { decorateColorPickers } = await import("./collection-appearance.js");
      decorateColorPickers(); // أول تشغيل: ينشئ عنصر الرمز ويكتب قيمته
      await new Promise((resolve) => setTimeout(resolve, 0));

      const glyph = document.querySelector(".keepit-appearance-glyph");
      expect(glyph?.textContent).toBe("◆");

      const setSpy = vi.spyOn(glyph, "textContent", "set");
      decorateColorPickers(); // تشغيل ثانٍ يدويًا: يجب ألا يكتب شيئًا لأن القيمة لم تتغير
      expect(setSpy).not.toHaveBeenCalled();
    } finally {
      for (const observer of createdObservers) observer.disconnect();
      globalThis.MutationObserver = RealMutationObserver;
    }
  });
});

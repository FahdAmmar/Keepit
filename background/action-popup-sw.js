"use strict";

/**
 * يحافظ على أن نقرة زر شريط الأدوات تفتح النافذة المنبثقة المعتمدة.
 * قد يبقى مسار popup تم تعيينه ديناميكيًا في ملف المتصفح الشخصي من إصدار
 * سابق؛ لذلك نعيد تثبيت المسار في كل تشغيل وتثبيت بدل الاعتماد على قيمة
 * Manifest الأولية وحدها.
 */
(() => {
  const action = globalThis.chrome?.action;
  const popup = "popup/index.html";

  if (!action?.setPopup) return;

  function ensureToolbarPopup() {
    try {
      const result = action.setPopup({ popup });
      if (result && typeof result.catch === "function") {
        result.catch((error) => {
          console.warn("[Keepit] Could not set the toolbar popup:", error?.message ?? error);
        });
      }
    } catch (error) {
      console.warn("[Keepit] Could not set the toolbar popup:", error?.message ?? error);
    }
  }

  chrome.runtime.onInstalled.addListener(ensureToolbarPopup);
  chrome.runtime.onStartup.addListener(ensureToolbarPopup);
  ensureToolbarPopup();
})();

/**
 * dir-switch.js
 * ---------------------------------------------------------------------------
 * يمنع الوميض/القفز البصري عند تبديل اللغة (RTL ↔ LTR).
 *
 * المشكلة: عند تبديل اللغة، يتغير dir على <html> فورًا، لكن إعادة رسم
 * المحتوى تحدث لاحقًا (async). خلال تلك الفgap القصيرة، يظهر المحتوى
 * القديم بالاتجاه الجديد مما يسبب ارتباكًا بصريًا.
 *
 * الحل: نراقب تغيّر dir عبر MutationObserver، ونضيف صنفًا يوقف كل
 * الانتقالات (transitions) مؤقتًا ونخفي المحتوى بط eased-opacity،
 * ثم نزيل الصنف بعد إعادة الرسم.
 * ---------------------------------------------------------------------------
 */
(function () {
  "use strict";

  var SWITCHING_CLASS = "keepit-dir-switching";
  var html = document.documentElement;

  function freeze() {
    html.classList.add(SWITCHING_CLASS);
  }

  function thaw() {
    // انتظر إطارين للتأكد من اكتمال إعادة الرسم
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        html.classList.remove(SWITCHING_CLASS);
      });
    });
  }

  // راقب تغيّر dir على <html>
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === "dir") {
        freeze();
        // أعطِ المتصفح وقتًا لإعادة الرسم قبل إزالة التجميد
        setTimeout(thaw, 120);
        break;
      }
    }
  });

  observer.observe(html, { attributes: true, attributeFilter: ["dir"] });
})();

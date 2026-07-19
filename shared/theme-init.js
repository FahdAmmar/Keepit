/**
 * theme-init.js
 * ---------------------------------------------------------------------------
 * يُنفَّذ فورًا (قبل أي رسم للصفحة) لتقدير المظهر الفاتح/الداكن بناءً على
 * تفضيل نظام التشغيل، تقليلًا لوميض المظهر الخاطئ (FOUC). يصحّح
 * themeService.ts القيمة لاحقًا إذا كان المستخدم قد فرض تفضيلًا صريحًا
 * مختلفًا محفوظًا في chrome.storage.local.
 *
 * هذا الملف خارجي عمدًا (وليس <script> مضمَّنًا داخل HTML) لأن سياسة أمان
 * المحتوى الافتراضية الصارمة في Manifest V3 (script-src 'self') تمنع تنفيذ
 * أي سكربت مضمَّن، حتى لو كان من تأليف الإضافة نفسها.
 */
(function () {
  var isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
})();

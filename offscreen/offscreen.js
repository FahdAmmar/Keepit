/**
 * offscreen/offscreen.js
 * ---------------------------------------------------------------------------
 * الجزء الوحيد الذي "يعمل" داخل مستند offscreen: الاستماع لرسائل الكتابة
 * القادمة من background/local-sync-sw/controller.js وتفويضها إلى
 * local-sync/writer.js (نفس الدالة المستخدمة من صفحة الإعدادات).
 *
 * ملاحظة تصميم مهمة: هذا المستمع الوحيد في كامل الإضافة الذي يتحقق من
 * نوع الرسالة MSG_WRITE — صفحة الخيارات لا تستمع لهذا النوع إطلاقًا،
 * لذلك لا يوجد أي احتمال لتنافس عدة مستمعين على نفس الرسالة (لأن
 * chrome.runtime.sendMessage يُرسِل لكل السياقات، لكن رد واحد فقط
 * يُعتمَد إن استجاب أكثر من مستمع لنفس الرسالة).
 */
import { writeStateToLocalFolder } from "../local-sync/writer.js";
import { pullFromLocalFolder } from "../local-sync/merge-pull.js";
import { MSG_WRITE, MSG_PULL } from "../local-sync/constants.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // دفاع إضافي: نتجاهل أي رسالة لا تحمل أحد نوعَينا، أو لا تأتي من نفس
  // الإضافة (sender.id يطابق دائمًا معرّف الإضافة الحالية لرسائل
  // chrome.runtime الداخلية؛ هذا التحقق احترازي فقط في حال أُضيف
  // externally_connectable مستقبلاً).
  if (message?.type !== MSG_WRITE && message?.type !== MSG_PULL) return undefined;
  if (sender?.id && sender.id !== chrome.runtime.id) return undefined;

  if (message.type === MSG_WRITE) {
    writeStateToLocalFolder({ state: message.state, fileName: message.fileName })
      .then(sendResponse)
      .catch((err) => {
        console.error("[Keepit local sync] offscreen write threw", err);
        sendResponse({ ok: false, error: "internal-error" });
      });
    return true; // نُبقي القناة مفتوحة لرد غير متزامن (async sendResponse)
  }

  // message.type === MSG_PULL
  pullFromLocalFolder({ fileName: message.fileName, mode: message.mode })
    .then(sendResponse)
    .catch((err) => {
      console.error("[Keepit local sync] offscreen pull threw", err);
      sendResponse({ ok: false, error: "internal-error" });
    });
  return true;
});

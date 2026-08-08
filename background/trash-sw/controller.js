"use strict";
/**
 * background/trash-sw/controller.js
 * ---------------------------------------------------------------------------
 * المسؤول الوحيد داخل service worker عن ميزة "سلة المحذوفات". لا يلمس أي
 * كود من background/index.js الأصلي؛ فقط يضيف مستمعًا إضافيًا على
 * chrome.storage.onChanged (يمكن تسجيل عدة مستمعين على نفس الحدث دون أي
 * تعارض مع مستمع ميزة المزامنة المحلية) ليكتشف كل حذف حقيقي لتصنيف أو
 * موقع، من أي سياق ولأي سبب.
 *
 * لا حاجة هنا إلى مستند offscreen: كل القراءة/الكتابة تتم عبر
 * chrome.storage.local مباشرة، وهي متاحة كاملة داخل service worker بلا
 * أي DOM. هذا يجعل هذه الميزة أبسط بنيويًا من المزامنة المحلية.
 *
 * ملاحظة أداء: المستمعون مُسجَّلون بشكل متزامن في أعلى الملف (وليس داخل
 * أي دالة async) — ضروري ليعيد Chrome ربطهم بشكل صحيح كل مرة يُعاد فيها
 * تشغيل service worker بعد أن يصبح خاملاً (Manifest V3 event pages).
 */
(() => {
  const C = self.KeepitTrashConstants;
  const Diff = self.KeepitTrashDiff;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;
  /** أقدم "قيمة قديمة" وصلت منذ آخر معالجة — نُثبّتها طوال نافذة التجميع
   *  حتى نقارن "بداية الدفعة" بـ"نهايتها"، لا كل زوج متتالٍ على حدة. */
  /** @type {KeepitState | null} */
  let pendingOldState = null;
  /** أحدث "قيمة جديدة" وصلت أثناء نافذة التجميع. */
  /** @type {KeepitState | null} */
  let pendingNewState = null;
  /** true إن كانت الدفعة الحالية تحتوي فعلاً على oldValue حقيقي (وليس
   *  undefined) — نحتاج التمييز لأن null قيمة oldState صالحة أيضًا. */
  let pendingHasOldState = false;

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(C.KEEPIT_STATE_KEY in changes)) return;

    const change = changes[C.KEEPIT_STATE_KEY];
    if (!pendingHasOldState) {
      pendingOldState = /** @type {KeepitState | null} */ (change.oldValue ?? null);
      pendingHasOldState = true;
    }
    pendingNewState = /** @type {KeepitState | null} */ (change.newValue ?? null);

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      const oldState = pendingOldState;
      const newState = pendingNewState;
      pendingOldState = null;
      pendingNewState = null;
      pendingHasOldState = false;
      void processChange(oldState, newState);
    }, C.DEBOUNCE_MS);
  });

  chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create(C.CLEANUP_ALARM_NAME, { periodInMinutes: C.CLEANUP_INTERVAL_MINUTES });
    void cleanupExpired();
  });
  chrome.runtime.onStartup.addListener(() => {
    chrome.alarms.create(C.CLEANUP_ALARM_NAME, { periodInMinutes: C.CLEANUP_INTERVAL_MINUTES });
    void cleanupExpired();
  });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== C.CLEANUP_ALARM_NAME) return;
    void cleanupExpired();
  });

  async function processChange(oldState, newState) {
    try {
      const deletions = Diff.computeDeletions(oldState, newState);
      if (deletions.length === 0) return;

      const now = Date.now();
      const newEntries = deletions.map((d) => ({
        id: crypto.randomUUID(),
        deletedAt: now,
        ...d,
      }));

      await appendEntries(newEntries);
    } catch (err) {
      console.error("[Keepit trash] failed to process state change", err);
    }
  }

  /** @param {KeepitTrashEntry[]} newEntries */
  async function appendEntries(newEntries) {
    const data = /** @type {{[k: string]: {entries?: KeepitTrashEntry[]} | undefined}} */ (
      await chrome.storage.local.get(C.TRASH_KEY)
    );
    const current = data[C.TRASH_KEY]?.entries;
    const entries = Array.isArray(current) ? current.slice() : [];
    entries.push(...newEntries);

    // الأحدث أولًا، ثم فرض السقف الأقصى (نُبقي الأحدث دائمًا عند الازدحام).
    entries.sort((a, b) => b.deletedAt - a.deletedAt);
    const capped = entries.slice(0, C.MAX_ENTRIES);

    await chrome.storage.local.set({ [C.TRASH_KEY]: { entries: capped } });
  }

  async function cleanupExpired() {
    const data = /** @type {{[k: string]: {entries?: KeepitTrashEntry[]} | undefined}} */ (
      await chrome.storage.local.get(C.TRASH_KEY)
    );
    const current = data[C.TRASH_KEY]?.entries;
    if (!Array.isArray(current) || current.length === 0) return;

    const cutoff = Date.now() - C.RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const kept = current.filter((e) => typeof e?.deletedAt === "number" && e.deletedAt >= cutoff);
    if (kept.length === current.length) return; // لا شيء انتهت صلاحيته؛ لا داعي للكتابة

    await chrome.storage.local.set({ [C.TRASH_KEY]: { entries: kept } });
  }
})();

"use strict";
/**
 * background/local-sync-sw/controller.js
 * ---------------------------------------------------------------------------
 * المسؤول الوحيد داخل service worker عن ميزة "المزامنة المحلية". لا يلمس
 * أي كود من background/index.js الأصلي؛ فقط يضيف مستمعًا إضافيًا على
 * chrome.storage.onChanged (يمكن تسجيل عدة مستمعين على نفس الحدث دون أي
 * تعارض) ليكتشف كل تغيير في "keepit:state" (كل إضافة/تعديل/حذف تصنيف أو
 * موقع يمر عبر هذا المفتاح، من أي سياق: popup, options, قائمة النقر
 * بالزر الأيمن, اختصار لوحة المفاتيح).
 *
 * هذا الملف يدير اتجاهين مستقلّين:
 *
 * (أ) الدفع (Push / الكتابة) — كما كان:
 *   1) نتحقق ما إذا كانت المزامنة المحلية مُفعَّلة (قراءة سريعة ورخيصة).
 *   2) إن كانت مُفعَّلة: نضمن وجود مستند offscreen (الوحيد القادر على
 *      استخدام File System Access API، لأن service worker لا يملك DOM).
 *   3) نرسل الحالة الحالية إليه ليكتبها في الملف المحلي المختار.
 *   4) نحدّث حالة المزامنة (وقت آخر نجاح / آخر خطأ) في chrome.storage.local
 *      لتعرضها لوحة الإعدادات.
 *
 * (ب) السحب (Pull / الاستيراد التلقائي) — جديد:
 *   نفحص الملف المحلي دوريًا (منبّه chrome.alarms، كل بضع دقائق) وأيضًا
 *   فور بدء تشغيل المتصفح (onStartup) أو تثبيت/تحديث الإضافة (onInstalled)،
 *   لاكتشاف أي تغيير حدث في متصفح آخر لم يصل بعد إلى هذا المتصفح. لا يوجد
 *   حدث متصفحي أصلي لـ"تغيّر ملف على القرص" (File System Access API لا
 *   يوفّر مراقبًا)، لذا الفحص الدوري هو الخيار العملي الوحيد — نُبقيه غير
 *   متكرر (كل دقيقتين) لتقليل استهلاك الموارد وإيقاظ service worker، مع
 *   الاعتماد على المحفّزات الفورية (بدء التشغيل/التثبيت/فتح الواجهات) لتغطية
 *   الحالة الشائعة "فتحت المتصفح للتو" دون انتظار الدورة التالية.
 *
 * ملاحظة أداء: كل المستمعين مُسجَّلون بشكل متزامن في أعلى الملف (وليس داخل
 * أي دالة async) — هذا ضروري لضمان أن Chrome يعيد ربطهم بشكل صحيح كل مرة
 * يُعاد فيها تشغيل service worker بعد أن يصبح خاملاً (متطلب أساسي في
 * Manifest V3 event pages).
 */
(() => {
  const C = self.KeepitLocalSyncConstants;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;
  /** أحدث حالة وصلت أثناء فترة التجميع (debounce) — نكتب الأحدث دائمًا. */
  let pendingState = null;
  /** حارس تزامن لمنع إنشاء أكثر من مستند offscreen واحد في آن واحد. */
  let creatingOffscreenDocument = null;
  /** حارس تزامن لمنع تشغيل أكثر من دورة "سحب" واحدة في آن واحد. */
  let pullInFlight = null;

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(C.KEEPIT_STATE_KEY in changes)) return;

    pendingState = changes[C.KEEPIT_STATE_KEY].newValue ?? null;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      const stateToSync = pendingState;
      pendingState = null;
      runSync(stateToSync).catch((err) => {
        console.error("[Keepit local sync] sync cycle failed", err);
        void setStatus({ lastError: "internal-error" });
      });
    }, C.DEBOUNCE_MS);
  });

  // --- جدولة فحص "السحب" الدوري في الخلفية --------------------------------
  chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create(C.PULL_ALARM_NAME, { periodInMinutes: C.PULL_INTERVAL_MINUTES });
    void runPull(); // فحص فوري أيضًا، لا داعي لانتظار أول دورة منبّه
  });
  chrome.runtime.onStartup.addListener(() => {
    chrome.alarms.create(C.PULL_ALARM_NAME, { periodInMinutes: C.PULL_INTERVAL_MINUTES });
    void runPull();
  });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== C.PULL_ALARM_NAME) return;
    void runPull();
  });

  async function runSync(state) {
    const status = await getStatus();
    if (!status.enabled) return;

    await ensureOffscreenDocument();

    const result = await sendWriteRequest({
      state,
      fileName: status.fileName || C.DEFAULT_FILE_NAME,
    });

    if (result.ok) {
      await setStatus({ lastSyncedAt: result.syncedAt, lastError: null });
    } else {
      await setStatus({ lastError: result.error || "unknown" });
    }
  }

  /**
   * يفحص الملف المحلي بحثًا عن تغييرات لم تصل بعد إلى هذا المتصفح، ويدمجها
   * إن وُجدت. لا يفعل شيئًا إن كانت الميزة غير مُفعَّلة أو لا يوجد مجلد
   * مُختار بعد. آمن للاستدعاء المتكرر (يتجاهل الاستدعاء إن كانت دورة سابقة
   * لا تزال قيد التنفيذ بدل تكديسها).
   */
  async function runPull() {
    if (pullInFlight) return pullInFlight;

    pullInFlight = (async () => {
      // إن كان هناك تغيير محلي بانتظار الكتابة (لا يزال داخل نافذة
      // الـ debounce ولم يُكتب إلى الملف بعد)، نكتبه الآن فورًا قبل أي
      // سحب. بدون هذا، قد يقرأ السحب نسخة من الملف لا تحتوي آخر تعديل
      // محلي حصل للتو، وفي وضع "استبدال" هذا يعني ضياع ذلك التعديل
      // (يُستبدَل بمحتوى أقدم من الملف نفسه).
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
        const stateToFlush = pendingState;
        pendingState = null;
        await runSync(stateToFlush).catch((err) => {
          console.error("[Keepit local sync] flush before pull failed", err);
        });
      }

      const status = await getStatus();
      if (!status.enabled || !status.folderName) return;

      await ensureOffscreenDocument();

      const result = await sendPullRequest({
        fileName: status.fileName || C.DEFAULT_FILE_NAME,
        mode: status.pullMode || C.PULL_MODE_REPLACE,
      });

      if (result.ok) {
        await setStatus({ lastPulledAt: Date.now(), lastPullError: null });
      } else {
        // لا نُلحّ في تسجيل خطأ "لا يوجد ملف بعد بعد" كخطأ مزعج؛ فقط أخطاء
        // حقيقية (صلاحية مفقودة، ملف تالف...) تظهر في لوحة الإعدادات.
        await setStatus({ lastPullError: result.error || "unknown" });
      }
    })().finally(() => {
      pullInFlight = null;
    });

    return pullInFlight;
  }

  function sendWriteRequest(payload) {
    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({ ok: false, error: "timeout" });
      }, C.WRITE_TIMEOUT_MS);

      chrome.runtime
        .sendMessage({ type: C.MSG_WRITE, ...payload })
        .then((response) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(response ?? { ok: false, error: "no-response" });
        })
        .catch((err) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({ ok: false, error: err?.message || "message-failed" });
        });
    });
  }

  function sendPullRequest(payload) {
    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({ ok: false, error: "timeout" });
      }, C.PULL_TIMEOUT_MS);

      chrome.runtime
        .sendMessage({ type: C.MSG_PULL, ...payload })
        .then((response) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(response ?? { ok: false, error: "no-response" });
        })
        .catch((err) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({ ok: false, error: err?.message || "message-failed" });
        });
    });
  }

  async function ensureOffscreenDocument() {
    const existing = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
    });
    if (existing.length > 0) return;

    if (creatingOffscreenDocument) {
      await creatingOffscreenDocument;
      return;
    }

    creatingOffscreenDocument = chrome.offscreen
      .createDocument({
        url: C.OFFSCREEN_URL,
        reasons: ["DOM_SCRAPING"],
        justification:
          "Uses the File System Access API (a Document-only Web API not exposed to service workers) to read/write Keepit's collections and sites from/to a local folder the user chose in Settings.",
      })
      .finally(() => {
        creatingOffscreenDocument = null;
      });

    await creatingOffscreenDocument;
  }

  async function getStatus() {
    const data = await chrome.storage.local.get(C.STATUS_KEY);
    return (
      data[C.STATUS_KEY] || {
        enabled: false,
        fileName: C.DEFAULT_FILE_NAME,
        folderName: null,
        pullMode: C.PULL_MODE_REPLACE,
        lastSyncedAt: null,
        lastError: null,
        lastPulledAt: null,
        lastPullError: null,
      }
    );
  }

  async function setStatus(patch) {
    const current = await getStatus();
    await chrome.storage.local.set({
      [C.STATUS_KEY]: { ...current, ...patch },
    });
  }
})();

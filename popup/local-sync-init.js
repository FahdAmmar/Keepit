/**
 * popup/local-sync-init.js
 * ---------------------------------------------------------------------------
 * وحدة صامتة بلا أي واجهة: تُشغَّل فور فتح النافذة المنبثقة لتتحقق من وجود
 * تغييرات في ملف المزامنة المحلية لم تصل بعد إلى هذا المتصفح، وتدمجها إن
 * وُجدت. هذا يجعل النافذة المنبثقة "تتحدّث تلقائيًا" لحظة فتحها — وهذا
 * أكثر نقطة يفتح منها معظم المستخدمين الإضافة عمليًا — دون انتظار دورة
 * المنبّه الدورية في الخلفية (قد تصل لدقيقتين).
 *
 * لا تُعدّل popup/main.js إطلاقًا؛ فقط تقرأ/تكتب chrome.storage.local، ثم
 * مستمع onChanged المدمج أصلاً في main.js يتولى إعادة رسم الواجهة تلقائيًا
 * إن تغيّر شيء فعليًا (نفس آلية عمل offscreen.js وoptions تمامًا).
 *
 * صامتة عمدًا تجاه المستخدم (بلا toast): النافذة المنبثقة تُفتح وتُغلق
 * خلال ثوانٍ قليلة، فلا وقت مفيد لعرض إشعار عابر فيها؛ صفحة الإعدادات هي
 * المكان المناسب لعرض حالة/أخطاء المزامنة بالتفصيل.
 */
import { pullFromLocalFolder } from "../local-sync/merge-pull.js";
import { STATUS_KEY } from "../local-sync/constants.js";

const FS_ACCESS_SUPPORTED = typeof window !== "undefined" && "showDirectoryPicker" in window;

if (FS_ACCESS_SUPPORTED) {
  void runSilentPullCheck();
}

/**
 * مُصدَّرة على window لأن popup/main.js سكربت كلاسيكي (لا يدعم import) —
 * زر التحديث اليدوي في رأس النافذة المنبثقة يستدعيها ليحصل على نتيجة
 * فعلية (تغيّر/لا تغيّر/فشل) يعرضها كـ toast، بعكس الفحص الصامت التلقائي
 * أدناه الذي لا يُظهر شيئًا للمستخدم عمدًا.
 * @returns {Promise<{ok: boolean, changed: boolean, error?: string}>}
 */
window.KeepitLocalSyncRefresh = async function () {
  if (!FS_ACCESS_SUPPORTED) return { ok: true, changed: false };
  try {
    const data = /** @type {{[k: string]: KeepitLocalSyncStatus | undefined}} */ (
      await chrome.storage.local.get(STATUS_KEY)
    );
    const status = data[STATUS_KEY];
    if (!status?.enabled || !status?.folderName) return { ok: true, changed: false };

    const result = await pullFromLocalFolder({ fileName: status.fileName, mode: status.pullMode });
    await persistPullResult(status, result);
    return { ok: result.ok, changed: Boolean(result.ok && result.changed), error: result.ok ? undefined : result.error };
  } catch (err) {
    console.error("[Keepit local sync] manual refresh failed", err);
    return { ok: false, changed: false };
  }
};

async function runSilentPullCheck() {
  try {
    const data = /** @type {{[k: string]: KeepitLocalSyncStatus | undefined}} */ (
      await chrome.storage.local.get(STATUS_KEY)
    );
    const status = data[STATUS_KEY];
    if (!status?.enabled || !status?.folderName) return;

    const result = await pullFromLocalFolder({ fileName: status.fileName, mode: status.pullMode });

    // فشل صامت متعمّد هنا (لا toast): النافذة المنبثقة تُفتح وتُغلق خلال
    // ثوانٍ قليلة، فلا وقت مفيد لعرض إشعار عابر عند الفتح التلقائي تحديدًا.
    // الزر اليدوي (window.KeepitLocalSyncRefresh أعلاه) هو من يعرض toast،
    // لأنه فعل صريح من المستخدم يتوقّع ردّ فعل مرئيًا عليه.
    await persistPullResult(status, result);
  } catch (err) {
    console.error("[Keepit local sync] popup silent pull check failed", err);
  }
}

/**
 * نحدّث lastPulledAt/lastPullError لتبقى لوحة الإعدادات متّسقة أينما حدث
 * آخر فحص فعلي (popup أو options أو المنبّه في الخلفية). قراءة ثم كتابة
 * (وليس عملية ذرية) — مقبول هنا لأن هذه حقول عرض فقط، لا منطق حرج يعتمد
 * عليها.
 */
/**
 * @param {KeepitLocalSyncStatus} status
 * @param {{ok: boolean, changed?: boolean, error?: string}} result
 */
async function persistPullResult(status, result) {
  const fresh = await chrome.storage.local.get(STATUS_KEY);
  const current = fresh[STATUS_KEY] || status;
  await chrome.storage.local.set({
    [STATUS_KEY]: {
      ...current,
      lastPulledAt: Date.now(),
      lastPullError: result.ok ? null : result.error,
    },
  });
}

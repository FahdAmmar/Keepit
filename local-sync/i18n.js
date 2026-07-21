/**
 * local-sync/i18n.js
 * ---------------------------------------------------------------------------
 * نصوص لوحة "المزامنة المحلية" بالعربية والإنجليزية، بنفس نمط الترجمة
 * المُستخدَم أصلاً في background/index.js وoptions/main.js (نفس منطق
 * resolveLocale ونفس أسلوب استبدال {param})، لتبقى لوحتنا الجديدة متّسقة
 * مع بقية التطبيق ومتزامنة مع مفتاح لغة المستخدم keepit:locale الحالي.
 */

const STRINGS = {
  ar: {
    triggerLabel: "المزامنة المحلية",
    panelTitle: "المزامنة المحلية",
    panelIntro:
      "احفظ نسخة JSON محدَّثة تلقائيًا من تصنيفاتك ومواقعك في مجلد على جهازك (مثل مجلد مشروع الإضافة) — تُكتب محليًا فقط ولا تُرسل إلى أي خادم. كما يتحقق Keepit دوريًا من نفس الملف ليسحب أي تغييرات حدثت من متصفح آخر يشير إلى المجلد نفسه.",
    unsupportedTitle: "غير متاح في هذا المتصفح",
    unsupportedBody:
      "تتطلب هذه الميزة File System Access API، المتاحة حاليًا في متصفحات Chromium على أجهزة الحاسوب (Chrome، Edge) فقط.",
    statusNotConfigured: "لم يتم اختيار مجلد بعد",
    statusDisabled: "المزامنة موقوفة حاليًا",
    statusSyncedAt: "آخر مزامنة: {time}",
    statusNeverSynced: "لم تتم أي مزامنة بعد",
    errorNotConfigured: "اختر مجلدًا لتبدأ المزامنة",
    errorPermissionRequired: "يلزم منح إذن الوصول للمجلد مجددًا",
    errorFolderMissing: "يبدو أن المجلد لم يعد موجودًا في هذا المسار",
    errorWriteFailed: "تعذّرت الكتابة في الملف، حاول مرة أخرى",
    errorTimeout: "استغرقت العملية وقتًا طويلًا، حاول مرة أخرى",
    errorInternal: "حدث خطأ غير متوقع",
    errorGeneric: "تعذّرت المزامنة",
    chooseFolderAction: "اختيار مجلد المشروع",
    changeFolderAction: "تغيير المجلد",
    reconnectAction: "منح الإذن مجددًا",
    syncNowAction: "مزامنة الآن",
    disableAction: "إيقاف المزامنة",
    enableAction: "تفعيل المزامنة",
    fileNameLabel: "اسم الملف",
    fileNameHint: "يُحفظ داخل المجلد الذي اخترته أعلاه. يُستخدم .json دائمًا.",
    folderLabel: "المجلد المختار",
    gitignoreNote:
      "إن كان المجلد المختار جزءًا من مستودع Git، أضف اسم الملف إلى .gitignore ليبقى محليًا فقط ولا يُرفع مع الكود.",
    multiBrowserNote:
      "لكل متصفح تُستخدم فيه هذه الميزة صلاحية وصول مستقلة لنفس المجلد (قيد أمان من المتصفح نفسه) — افتح هذه اللوحة في كل متصفح واختر المجلد نفسه مرة واحدة فقط، وسيتولى Keepit الباقي تلقائيًا.",
    pullSectionTitle: "السحب التلقائي (الاستيراد)",
    pullIntro:
      "بالإضافة إلى الحفظ التلقائي أعلاه، يتحقق Keepit دوريًا من هذا الملف نفسه ليسحب أي تصنيفات أو مواقع أُضيفت من متصفح آخر يشير إلى المجلد نفسه — تلقائيًا وبلا أي خطوة يدوية.",
    pullModeLabel: "عند العثور على تغييرات في الملف",
    pullModeMergeTitle: "دمج آمن",
    pullModeMergeDesc: "يُضيف فقط الجديد من الملف. لا يحذف أي تصنيف أو موقع موجود لديك أبدًا — لذا لن تنتقل عمليات الحذف من متصفح آخر.",
    pullModeReplaceTitle: "استبدال كامل (موصى به)",
    pullModeReplaceDesc:
      "يجعل محتوى الملف هو المرجع الكامل، وينقل عمليات الحذف أيضًا.",
    pullModeReplaceWarning: "تجنّب استخدام متصفحين في نفس الوقت؛ استخدم متصفحًا واحدًا في كل مرة لتفادي فقدان أي تغييرات متزامنة.",
    checkNowAction: "تحقّق الآن من تحديثات الملف",
    statusPulledAt: "آخر تحقّق: {time}",
    statusNeverPulled: "لم يتم التحقق من تحديثات الملف بعد",
    pullSuccessToast: "تم تحديث بياناتك من الملف المحلي",
    pullSuccessToastDetail: " (+{collections} تصنيف، +{items} موقع)",
    pullNoChangesToast: "بياناتك محدَّثة بالفعل",
    errorInvalidFile: "محتوى الملف غير صالح أو تالف",
    errorReadFailed: "تعذّرت قراءة الملف، حاول مرة أخرى",
    syncSuccessToast: "تم حفظ الملف بنجاح",
    syncedJustNow: "الآن",
    minutesAgo: "قبل {n} دقيقة",
    hoursAgo: "قبل {n} ساعة",
    daysAgo: "قبل {n} يوم",
    close: "إغلاق",
  },
  en: {
    triggerLabel: "Local sync",
    panelTitle: "Local File Sync",
    panelIntro:
      "Keep an always-up-to-date JSON copy of your collections and sites in a folder on your device (e.g. the extension's project folder) — written locally only, never sent to any server. Keepit also periodically checks that same file to pull in changes made from another browser pointed at the same folder.",
    unsupportedTitle: "Not available in this browser",
    unsupportedBody:
      "This feature requires the File System Access API, currently available only in Chromium desktop browsers (Chrome, Edge).",
    statusNotConfigured: "No folder chosen yet",
    statusDisabled: "Sync is currently off",
    statusSyncedAt: "Last synced: {time}",
    statusNeverSynced: "Never synced yet",
    errorNotConfigured: "Choose a folder to start syncing",
    errorPermissionRequired: "Folder access needs to be granted again",
    errorFolderMissing: "The folder no longer seems to exist at that path",
    errorWriteFailed: "Couldn't write the file, please try again",
    errorTimeout: "The operation took too long, please try again",
    errorInternal: "An unexpected error occurred",
    errorGeneric: "Sync failed",
    chooseFolderAction: "Choose project folder",
    changeFolderAction: "Change folder",
    reconnectAction: "Grant access again",
    syncNowAction: "Sync now",
    disableAction: "Turn off sync",
    enableAction: "Turn on sync",
    fileNameLabel: "File name",
    fileNameHint: "Saved inside the folder you chose above. Always saved as .json.",
    folderLabel: "Chosen folder",
    gitignoreNote:
      "If the chosen folder is part of a Git repository, add the file name to .gitignore so it stays local only and isn't committed.",
    multiBrowserNote:
      "Each browser where you use this feature needs its own independent access grant to the same folder (a security boundary of the browser itself) — open this panel in every browser and choose the same folder once; Keepit handles the rest automatically.",
    pullSectionTitle: "Automatic pull (import)",
    pullIntro:
      "In addition to the automatic saving above, Keepit periodically checks this same file to pull in any collections or sites added from another browser pointed at the same folder — automatically, with no manual step.",
    pullModeLabel: "When changes are found in the file",
    pullModeMergeTitle: "Safe merge",
    pullModeMergeDesc: "Only adds what's new in the file. Never deletes any collection or site you already have — so deletions from another browser won't transfer.",
    pullModeReplaceTitle: "Full replace (recommended)",
    pullModeReplaceDesc:
      "Makes the file's content the complete source of truth, carrying over deletions too.",
    pullModeReplaceWarning: "Avoid using two browsers at the same time; use one at a time to prevent losing any simultaneous changes.",
    checkNowAction: "Check now for file updates",
    statusPulledAt: "Last checked: {time}",
    statusNeverPulled: "Haven't checked for file updates yet",
    pullSuccessToast: "Your data was updated from the local file",
    pullSuccessToastDetail: " (+{collections} collections, +{items} sites)",
    pullNoChangesToast: "Your data is already up to date",
    errorInvalidFile: "The file's content is invalid or corrupted",
    errorReadFailed: "Couldn't read the file, please try again",
    syncSuccessToast: "File saved successfully",
    syncedJustNow: "just now",
    minutesAgo: "{n}m ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
    close: "Close",
  },
};

/** يطابق منطق resolveLocale/Ve الموجود في الحزمة الأصلية تمامًا. */
export function detectSystemLocale() {
  const lang = (typeof navigator !== "undefined" ? navigator.language : "ar") || "ar";
  return lang.toLowerCase().startsWith("ar") ? "ar" : "en";
}

/** @param {string} pref - "system" | "ar" | "en" */
export function resolveLocale(pref) {
  return pref === "system" || !pref ? detectSystemLocale() : pref;
}

/**
 * @param {string} locale
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 */
export function t(locale, key, params) {
  let value = STRINGS[locale]?.[key] ?? STRINGS.ar[key] ?? key;
  if (params) {
    for (const [name, val] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${name}\\}`, "g"), String(val));
    }
  }
  return value;
}

/**
 * types.d.ts
 * ---------------------------------------------------------------------------
 * إعلانات أنواع مشتركة لفحص الأنواع عبر tsc --noEmit فقط (راجع
 * tsconfig.json — noEmit: true دائمًا؛ لا تأثير إطلاقًا على وقت التشغيل).
 *
 * ## لماذا هذا الملف ضروري تحديدًا
 * `chrome.storage.local.get(key)` في نسخ @types/chrome الحديثة يُرجع
 * `unknown` افتراضيًا (لا `any`) — خيار أمان أنواع مقصود من طرف تعريفات
 * Chrome نفسها: يفرض عليك تصريح الشكل المتوقَّع صراحةً بدل الوثوق ضمنيًا.
 * بلا الأنواع هنا، كل قراءة لـ keepit:state عبر المشروع (أكثر من عشرة
 * ملفات) كانت ستُصرَّح شكلها من الصفر وتتكرر؛ هذا الملف مصدر الحقيقة
 * الوحيد لشكل البيانات، مطابق تمامًا لما تُنتجه/تتحقق منه فعليًا
 * local-sync/import-schema.js وsnapshots/store.js.
 *
 * ## الأنواع العامة (self.KeepitXxx)
 * كل ميزة من ميزات service worker (سلة المحذوفات، النسخ الاحتياطية،
 * المزامنة المحلية) مكتوبة كسكربت كلاسيكي (لا ES module) يُلحق واجهته
 * بـ self.KeepitXxx — لا يوجد أداة تجميع في هذا المشروع تسمح بمشاركة وحدة
 * واحدة بين سكربت كلاسيكي ووحدات ES (راجع background/*-sw/constants.js
 * لشرح هذا القرار بالتفصيل). التصريح هنا فقط يُعرِّف الشكل لِـ tsc؛ لا
 * يغيّر كيف تُحمَّل هذه الملفات فعليًا.
 */

declare global {
  interface KeepitItem {
    id: string;
    url: string;
    title: string;
    faviconUrl?: string;
    note?: string;
    /** وسوم محلية اختيارية قابلة للبحث والتصفية. */
    tags?: string[];
    /** عدّاد فتح الرابط وآخر وقت فتحه؛ يُستخدمان للفرز والإحصاءات. */
    usageCount?: number;
    lastOpenedAt?: number;
    /** آخر نتيجة لفحص الرابط الدوري. */
    linkStatus?: { status: "ok" | "broken" | "restricted" | "error" | "timeout" | "unreachable"; statusCode?: number; checkedAt: number };
    /** نسخة قراءة محلية محدودة الحجم من الصفحة وقت الأرشفة. */
    archive?: { version: number; capturedAt: number; title: string; description: string; text: string; html: string; screenshot?: string };
    createdAt: number;
    order: number;
  }

  interface KeepitCollection {
    id: string;
    name: string;
    color: string;
    pinned: boolean;
    createdAt: number;
    updatedAt: number;
    items: KeepitItem[];
  }

  interface KeepitState {
    schemaVersion: number;
    collections: KeepitCollection[];
    lastUsedCollectionId: string | null;
  }

  type KeepitTrashEntry =
    | { id: string; deletedAt: number; kind: "collection"; collection: KeepitCollection }
    | {
        id: string;
        deletedAt: number;
        kind: "item";
        item: KeepitItem;
        sourceCollection: { id: string; name: string; color: string };
      };

  interface KeepitLocalSyncStatus {
    enabled: boolean;
    folderName: string | null;
    fileName: string;
    pullMode: "merge" | "replace";
    lastSyncedAt?: number | null;
    lastError?: string | null;
    lastPulledAt?: number | null;
    lastPullError?: string | null;
  }

  interface KeepitSnapshotRecord {
    id: string;
    takenAt: number;
    trigger: "auto" | "manual";
    collectionsCount: number;
    itemsCount: number;
    collections: KeepitCollection[];
  }

  interface KeepitSnapshotsConfig {
    KEEPIT_STATE_KEY: string;
    SNAPSHOTS_KEY: string;
    DEBOUNCE_MS: number;
    MIN_AUTO_INTERVAL_MS: number;
    KEEP_RECENT_COUNT: number;
    KEEP_DAILY_DAYS: number;
    MAX_AGE_DAYS: number;
    MAX_SNAPSHOTS: number;
  }

  // self.KeepitXxx — راجع شرح أعلاه. نُوسِّع Window (لا WorkerGlobalScope)
  // لأن "lib" في tsconfig.json يتضمن "DOM" (مطلوب لملفات popup/options)،
  // فتُصرَّح self بنوع Window في كل سياق هذا الإعداد — رغم أن سكربتات
  // background/*-sw تعمل فعليًا داخل service worker. تقسيم المشروع لإعدادي
  // tsconfig منفصلين (DOM مقابل webworker) أدق تقنيًا لكنه تعقيد غير
  // مبرَّر هنا؛ توسيع Window عمليًا بديل كافٍ لغرض فحص الأنواع فقط.
  interface Window {
    KeepitLocalSyncConstants: {
      KEEPIT_STATE_KEY: string;
      STATUS_KEY: string;
      DEFAULT_FILE_NAME: string;
      OFFSCREEN_URL: string;
      MSG_WRITE: string;
      MSG_PULL: string;
      PULL_ALARM_NAME: string;
      PULL_INTERVAL_MINUTES: number;
      WRITE_TIMEOUT_MS: number;
      PULL_TIMEOUT_MS: number;
      PULL_MODE_MERGE: string;
      PULL_MODE_REPLACE: string;
      DEBOUNCE_MS: number;
    };
    KeepitTrashConstants: {
      KEEPIT_STATE_KEY: string;
      TRASH_KEY: string;
      DEBOUNCE_MS: number;
      MAX_ENTRIES: number;
      RETENTION_DAYS: number;
      CLEANUP_ALARM_NAME: string;
      CLEANUP_INTERVAL_MINUTES: number;
    };
    KeepitTrashDiff: {
      computeDeletions: (
        oldState: { collections?: KeepitCollection[] } | null | undefined,
        newState: { collections?: KeepitCollection[] } | null | undefined,
      ) => Array<
        | { kind: "collection"; collection: KeepitCollection }
        | { kind: "item"; item: KeepitItem; sourceCollection: { id: string; name: string; color: string } }
      >;
    };
    KeepitSnapshotsConstants: KeepitSnapshotsConfig;
    KeepitSnapshotsPrune: (snapshots: KeepitSnapshotRecord[], cfg: KeepitSnapshotsConfig) => KeepitSnapshotRecord[];
    /** مُصدَّرة من popup/local-sync-init.js — راجع تعليقها هناك. */
    KeepitLocalSyncRefresh: () => Promise<{ ok: boolean; changed: boolean; error?: string }>;
    /** مُصدَّرة من options/trash-panel.js — تفتح اللوحة برمجيًا؛ راجع تعليقها هناك. */
    KeepitOpenTrashPanel: () => void;
  }

  // importScripts متاحة داخل service worker فقط (لا في صفحات المستند) —
  // @types/chrome لا يُعرِّفها لأنها من واجهة WorkerGlobalScope القياسية في
  // lib.webworker.d.ts، غير المُضمَّنة افتراضيًا في "lib": ["DOM", ...].
  function importScripts(...urls: string[]): void;
}

export {};

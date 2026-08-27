/**
 * snapshots/store.js
 * ---------------------------------------------------------------------------
 * القراءة، الأخذ اليدوي، الاستعادة (دمج أو استبدال)، الحذف، والتنزيل كملف
 * لميزة "النسخ الاحتياطية التلقائية" (keepit:snapshots). لا تلمس أي كود من
 * background/index.js أو popup|options/main.js — فقط تقرأ/تكتب
 * chrome.storage.local مباشرة؛ مستمع onChanged المدمج أصلاً في main.js
 * يتولى إعادة رسم الواجهة تلقائيًا إن تغيّرت keepit:state.
 *
 * "استبدال" يستخدم نفس دلالة PULL_MODE.REPLACE في ميزة المزامنة المحلية:
 * محتوى النسخة يصبح المرجع الكامل، بما يشمل حذف أي شيء غير موجود فيها.
 * "دمج" يستخدم KeepitDedup.mergeCollections (نفس أداة منع التكرار
 * المستخدمة أصلاً في الاستيراد اليدوي) فلا يحذف شيئًا موجودًا حاليًا أبدًا.
 */
import { buildExportPayload } from "../local-sync/export-schema.js";
import { writeStateOptimistically } from "../shared/optimistic-state-write.js";
import {
  KEEPIT_STATE_KEY,
  SNAPSHOTS_KEY,
  KEEP_RECENT_COUNT,
  KEEP_DAILY_DAYS,
  MAX_AGE_DAYS,
  MAX_SNAPSHOTS,
} from "./constants.js";

/** @type {KeepitState} */
const EMPTY_STATE = { schemaVersion: 1, collections: [], lastUsedCollectionId: null };
/** @type {{snapshots: KeepitSnapshotRecord[]}} */
const EMPTY_SNAPSHOTS = { snapshots: [] };

/** @returns {Promise<KeepitSnapshotRecord[]>} الأحدث أولًا */
export async function readSnapshots() {
  const data = /** @type {{[k: string]: {snapshots?: KeepitSnapshotRecord[]} | undefined}} */ (
    await chrome.storage.local.get(SNAPSHOTS_KEY)
  );
  const snapshots = data[SNAPSHOTS_KEY]?.snapshots;
  return Array.isArray(snapshots) ? snapshots.slice().sort((a, b) => b.takenAt - a.takenAt) : [];
}

/** @returns {Promise<KeepitState>} */
async function readAppState() {
  const data = /** @type {{[k: string]: KeepitState | undefined}} */ (await chrome.storage.local.get(KEEPIT_STATE_KEY));
  return data[KEEPIT_STATE_KEY] ?? EMPTY_STATE;
}

function dedup() {
  const api = /** @type {any} */ (globalThis).KeepitDedup;
  if (!api) {
    throw new Error("KeepitDedup غير متاح — تأكد من تحميل shared/dedup.js قبل هذه الوحدة");
  }
  return api;
}

/** @param {KeepitCollection} col @returns {KeepitCollection} */
function cloneCollection(col) {
  return {
    id: col.id,
    name: col.name,
    color: col.color,
    pinned: Boolean(col.pinned),
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
    items: Array.isArray(col.items) ? col.items.map(cloneItem) : [],
  };
}
/** @param {KeepitItem} item @returns {KeepitItem} */
function cloneItem(item) {
  return {
    id: item.id,
    url: item.url,
    title: item.title,
    ...(item.faviconUrl ? { faviconUrl: item.faviconUrl } : {}),
    ...(item.note ? { note: item.note } : {}),
    createdAt: item.createdAt,
    order: item.order,
  };
}

/**
 * تنقية النسخ حسب نفس سياسة الاحتفاظ المتدرّجة المطبَّقة داخل service
 * worker (راجع background/snapshots-sw/controller.js للشرح الكامل). تكرار
 * محدود ومقصود — لا وسيلة لمشاركة كود بين سكربت كلاسيكي ووحدة ES هنا بلا
 * أداة تجميع.
 * @param {KeepitSnapshotRecord[]} snapshots
 * @returns {KeepitSnapshotRecord[]}
 */
export function pruneSnapshots(snapshots) {
  const sorted = snapshots.slice().sort((a, b) => b.takenAt - a.takenAt);
  const now = Date.now();
  const maxAgeCutoff = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const dailyCutoff = now - KEEP_DAILY_DAYS * 24 * 60 * 60 * 1000;

  const notExpired = sorted.filter((s) => s.takenAt >= maxAgeCutoff);
  const recent = notExpired.slice(0, KEEP_RECENT_COUNT);
  const older = notExpired.slice(KEEP_RECENT_COUNT);

  // ثلاث طبقات كثافة متدرّجة: كامل (recent) -> نسخة واحدة/يوم (حتى
  // dailyCutoff) -> نسخة واحدة/أسبوع (حتى maxAgeCutoff، أُلغيت أصلاً أعلاه).
  // بلا الطبقة الأسبوعية هنا، كل ما بعد dailyCutoff كان يُحتفَظ به كاملاً
  // بلا أي تنقية — فجوة حقيقية مُثبَتة باختبار: نافذة كاملة بين
  // KEEP_DAILY_DAYS وMAX_AGE_DAYS بلا أي حد كثافة سوى السقف الإجمالي
  // النهائي (MAX_SNAPSHOTS) في آخر هذه الدالة.
  const seenDays = new Set();
  const seenWeeks = new Set();
  const thinnedOlder = [];
  for (const snap of older) {
    if (snap.takenAt < dailyCutoff) {
      const weekKey = isoWeekKey(snap.takenAt);
      if (seenWeeks.has(weekKey)) continue;
      seenWeeks.add(weekKey);
      thinnedOlder.push(snap);
      continue;
    }
    const dayKey = new Date(snap.takenAt).toISOString().slice(0, 10);
    if (seenDays.has(dayKey)) continue;
    seenDays.add(dayKey);
    thinnedOlder.push(snap);
  }

  return [...recent, ...thinnedOlder].slice(0, MAX_SNAPSHOTS);
}

/** مفتاح "سنة-أسبوع" تقريبي (ISO-ish، كافٍ لغرض التجميع هنا؛ لا يحتاج دقة
 *  معيار ISO 8601 الكاملة لأرقام الأسابيع الحدّية). @param {number} ts */
function isoWeekKey(ts) {
  const date = new Date(ts);
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const weekNumber = Math.floor((date.getTime() - startOfYear) / (7 * dayMs));
  return `${date.getUTCFullYear()}-W${weekNumber}`;
}

/** يأخذ نسخة يدوية فورية من الحالة الحالية بالكامل. @returns {Promise<KeepitSnapshotRecord>} النسخة الجديدة */
export async function takeManualSnapshot() {
  const state = await readAppState();
  const collections = (Array.isArray(state.collections) ? state.collections : []).map(cloneCollection);

  /** @type {KeepitSnapshotRecord} */
  const snapshot = {
    id: crypto.randomUUID(),
    takenAt: Date.now(),
    trigger: "manual",
    collectionsCount: collections.length,
    itemsCount: collections.reduce((n, c) => n + c.items.length, 0),
    collections,
  };

  // كتابة تفاؤلية: نسخة تلقائية قد تُؤخَذ بالخلفية (background/snapshots-sw)
  // بنفس اللحظة تقريبًا؛ بلا هذا التحقق، إحدى الكتابتين كانت ستُلغي الأخرى
  // صامتًا بدل أن تتراكما معًا كما يُفترَض.
  await writeStateOptimistically(
    SNAPSHOTS_KEY,
    (current) => ({ snapshots: pruneSnapshots([snapshot, ...(current.snapshots ?? [])]) }),
    EMPTY_SNAPSHOTS,
  );
  return snapshot;
}

export async function deleteSnapshot(snapshotId) {
  await writeStateOptimistically(
    SNAPSHOTS_KEY,
    (current) => ({ snapshots: (current.snapshots ?? []).filter((s) => s.id !== snapshotId) }),
    EMPTY_SNAPSHOTS,
  );
}

/**
 * يستعيد نسخة احتياطية.
 * @param {string} snapshotId
 * @param {"merge" | "replace"} mode
 * @returns {Promise<{ok: boolean}>}
 */
export async function restoreSnapshot(snapshotId, mode) {
  const snapshots = await readSnapshots();
  const snapshot = snapshots.find((s) => s.id === snapshotId);
  if (!snapshot) return { ok: false };

  await writeStateOptimistically(
    KEEPIT_STATE_KEY,
    (state) => {
      if (mode === "replace") {
        const collections = snapshot.collections.map(cloneCollection);
        // نفس منطق merge-pull.js بالضبط لوضع "استبدال": قد يشير
        // lastUsedCollectionId الحالي إلى تصنيف لم يعد موجودًا إطلاقًا
        // بعد الاستبدال الكامل.
        return {
          schemaVersion: state.schemaVersion ?? 1,
          collections,
          lastUsedCollectionId: collections[0]?.id ?? null,
        };
      }
      const currentCollections = Array.isArray(state.collections) ? state.collections : [];
      const { merged } = dedup().mergeCollections(currentCollections, snapshot.collections.map(cloneCollection));
      return {
        schemaVersion: state.schemaVersion ?? 1,
        collections: merged,
        lastUsedCollectionId: state.lastUsedCollectionId ?? merged[0]?.id ?? null,
      };
    },
    EMPTY_STATE,
  );
  return { ok: true };
}

/** يبني ملف JSON قابلاً للاستيراد من نسخة احتياطية معيّنة (نفس صيغة زر
 *  "تصدير" الأصلي بالضبط، عبر إعادة استخدام export-schema.js مباشرة). */
export function buildSnapshotDownloadPayload(snapshot) {
  return buildExportPayload({ collections: snapshot.collections });
}

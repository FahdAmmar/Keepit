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
import {
  KEEPIT_STATE_KEY,
  SNAPSHOTS_KEY,
  KEEP_RECENT_COUNT,
  KEEP_DAILY_DAYS,
  MAX_AGE_DAYS,
  MAX_SNAPSHOTS,
} from "./constants.js";

/** @returns {Promise<KeepitSnapshotRecord[]>} الأحدث أولًا */
export async function readSnapshots() {
  const data = /** @type {{[k: string]: {snapshots?: KeepitSnapshotRecord[]} | undefined}} */ (
    await chrome.storage.local.get(SNAPSHOTS_KEY)
  );
  const snapshots = data[SNAPSHOTS_KEY]?.snapshots;
  return Array.isArray(snapshots) ? snapshots.slice().sort((a, b) => b.takenAt - a.takenAt) : [];
}

/** نفس شكل الحالة الافتراضية بالضبط المستخدَم في local-sync/merge-pull.js
 *  (getLocalState) — نطابقه هنا حتى لا نكتب أبدًا حالة ناقصة الحقول. */
/** @returns {Promise<KeepitState>} */
async function readAppState() {
  const data = /** @type {{[k: string]: KeepitState | undefined}} */ (await chrome.storage.local.get(KEEPIT_STATE_KEY));
  return data[KEEPIT_STATE_KEY] ?? { schemaVersion: 1, collections: [], lastUsedCollectionId: null };
}

async function writeAppState(state) {
  await chrome.storage.local.set({ [KEEPIT_STATE_KEY]: state });
}

function dedup() {
  const api = /** @type {any} */ (globalThis).KeepitDedup;
  if (!api) {
    throw new Error("KeepitDedup غير متاح — تأكد من تحميل shared/dedup.js قبل هذه الوحدة");
  }
  return api;
}

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
 * @param {Array<any>} snapshots
 */
function pruneSnapshots(snapshots) {
  const sorted = snapshots.slice().sort((a, b) => b.takenAt - a.takenAt);
  const now = Date.now();
  const maxAgeCutoff = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const dailyCutoff = now - KEEP_DAILY_DAYS * 24 * 60 * 60 * 1000;

  const notExpired = sorted.filter((s) => s.takenAt >= maxAgeCutoff);
  const recent = notExpired.slice(0, KEEP_RECENT_COUNT);
  const older = notExpired.slice(KEEP_RECENT_COUNT);

  const seenDays = new Set();
  const thinnedOlder = [];
  for (const snap of older) {
    if (snap.takenAt < dailyCutoff) {
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

/** يأخذ نسخة يدوية فورية من الحالة الحالية بالكامل. @returns {Promise<object>} النسخة الجديدة */
export async function takeManualSnapshot() {
  const state = await readAppState();
  const collections = (Array.isArray(state.collections) ? state.collections : []).map(cloneCollection);

  const snapshot = {
    id: crypto.randomUUID(),
    takenAt: Date.now(),
    trigger: "manual",
    collectionsCount: collections.length,
    itemsCount: collections.reduce((n, c) => n + c.items.length, 0),
    collections,
  };

  const current = await readSnapshots();
  const next = pruneSnapshots([snapshot, ...current]);
  await chrome.storage.local.set({ [SNAPSHOTS_KEY]: { snapshots: next } });
  return snapshot;
}

export async function deleteSnapshot(snapshotId) {
  const current = await readSnapshots();
  const next = current.filter((s) => s.id !== snapshotId);
  await chrome.storage.local.set({ [SNAPSHOTS_KEY]: { snapshots: next } });
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

  const state = await readAppState();
  const currentCollections = Array.isArray(state.collections) ? state.collections : [];

  if (mode === "replace") {
    const collections = snapshot.collections.map(cloneCollection);
    // نفس منطق merge-pull.js بالضبط لوضع "استبدال": قد يشير lastUsedCollectionId
    // الحالي إلى تصنيف لم يعد موجودًا إطلاقًا بعد الاستبدال الكامل.
    await writeAppState({
      schemaVersion: state.schemaVersion ?? 1,
      collections,
      lastUsedCollectionId: collections[0]?.id ?? null,
    });
    return { ok: true };
  }

  const { merged } = dedup().mergeCollections(currentCollections, snapshot.collections.map(cloneCollection));
  await writeAppState({
    schemaVersion: state.schemaVersion ?? 1,
    collections: merged,
    lastUsedCollectionId: state.lastUsedCollectionId ?? merged[0]?.id ?? null,
  });
  return { ok: true };
}

/** يبني ملف JSON قابلاً للاستيراد من نسخة احتياطية معيّنة (نفس صيغة زر
 *  "تصدير" الأصلي بالضبط، عبر إعادة استخدام export-schema.js مباشرة). */
export function buildSnapshotDownloadPayload(snapshot) {
  return buildExportPayload({ collections: snapshot.collections });
}

"use strict";
/**
 * background/snapshots-sw/controller.js
 * ---------------------------------------------------------------------------
 * المسؤول الوحيد داخل service worker عن أخذ "نسخ احتياطية" تلقائية دورية
 * لكامل keepit:state. لا يلمس background/index.js إطلاقًا؛ يستمع فقط على
 * chrome.storage.onChanged (مستمع مستقل تمامًا عن مستمعي المزامنة المحلية
 * وسلة المحذوفات — يمكن تسجيل عدة مستمعين بلا أي تعارض).
 *
 * الفرق عن "سلة المحذوفات": تلك الميزة تُسجّل كل *حذف* على حدة (استعادة
 * دقيقة لعنصر واحد)، بينما هذه الميزة تحفظ *صورة كاملة* للحالة عند نقاط
 * زمنية متباعدة — تحمي أيضًا من التعديلات (إعادة تسمية، تغيير لون، تعديل
 * ملاحظة...) التي لا تُعتبر "حذفًا" فتفوت سلة المحذوفات تمامًا. الميزتان
 * متكاملتان لا متكرّرتان.
 *
 * التقييد (throttling): لا نأخذ نسخة عند كل تغيير (قد يعني عشرات النسخ في
 * جلسة تعديل واحدة)؛ فقط إن مرّ MIN_AUTO_INTERVAL_MS منذ آخر نسخة تلقائية
 * *و* كان المحتوى مختلفًا فعليًا عن آخر نسخة محفوظة.
 */
(() => {
  const C = self.KeepitSnapshotsConstants;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let debounceTimer = null;
  /** @type {KeepitState | null} */
  let pendingState = null;

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!(C.KEEPIT_STATE_KEY in changes)) return;

    pendingState = /** @type {KeepitState | null} */ (changes[C.KEEPIT_STATE_KEY].newValue ?? null);

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      const state = pendingState;
      pendingState = null;
      void maybeTakeAutoSnapshot(state);
    }, C.DEBOUNCE_MS);
  });

  /** @param {KeepitState | null | undefined} state */
  async function maybeTakeAutoSnapshot(state) {
    try {
      const collections = Array.isArray(state?.collections) ? state.collections : [];
      if (collections.length === 0) return; // لا شيء ذو معنى لأخذ نسخة منه بعد

      const data = /** @type {{[k: string]: {snapshots?: KeepitSnapshotRecord[]} | undefined}} */ (
        await chrome.storage.local.get(C.SNAPSHOTS_KEY)
      );
      const snapshots = data[C.SNAPSHOTS_KEY]?.snapshots ?? [];

      const lastAuto = snapshots.filter((s) => s.trigger === "auto").sort((a, b) => b.takenAt - a.takenAt)[0];

      if (lastAuto && Date.now() - lastAuto.takenAt < C.MIN_AUTO_INTERVAL_MS) return;
      if (lastAuto && collectionsEqual(lastAuto.collections, collections)) return;

      const snapshot = buildSnapshot(collections, "auto");
      const next = pruneSnapshots([snapshot, ...snapshots], C);
      await chrome.storage.local.set({ [C.SNAPSHOTS_KEY]: { snapshots: next } });
    } catch (err) {
      console.error("[Keepit snapshots] failed to take automatic snapshot", err);
    }
  }

  /**
   * @param {KeepitCollection[]} collections
   * @param {"auto" | "manual"} trigger
   * @returns {KeepitSnapshotRecord}
   */
  function buildSnapshot(collections, trigger) {
    const cloned = collections.map(cloneCollection);
    return {
      id: crypto.randomUUID(),
      takenAt: Date.now(),
      trigger,
      collectionsCount: cloned.length,
      itemsCount: cloned.reduce((n, c) => n + c.items.length, 0),
      collections: cloned,
    };
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

  /** مقارنة بنيوية بعد تطبيع ترتيب المفاتيح (نفس فكرة local-sync/compare.js
   *  تمامًا، مُعاد تنفيذها هنا محليًا لتبقى هذه الميزة مستقلة بذاتها). */
  /** @param {KeepitCollection[] | undefined} a @param {KeepitCollection[] | undefined} b */
  function collectionsEqual(a, b) {
    return stableStringify(a ?? []) === stableStringify(b ?? []);
  }

  function stableStringify(value) {
    return JSON.stringify(sortKeysDeep(value));
  }

  function sortKeysDeep(value) {
    if (Array.isArray(value)) return value.map(sortKeysDeep);
    if (value && typeof value === "object") {
      const out = {};
      for (const key of Object.keys(value).sort()) out[key] = sortKeysDeep(value[key]);
      return out;
    }
    return value;
  }

  /**
   * تنقية النسخ حسب سياسة احتفاظ متدرّجة: أحدث N نسخة تُبقى دائمًا، ثم
   * نسخة واحدة كحد أقصى لكل يوم تقويمي ضمن نافذة "يومية"، ثم حذف كل ما
   * تجاوز الحد الأقصى المطلق للعمر، وأخيرًا فرض سقف مطلق على العدد الكلي.
   * مُصدَّرة على self ليُعاد استخدام نفس المنطق تمامًا من controller.js
   * الخاص بالنسخ اليدوية إن احتاج ذلك مستقبلًا داخل service worker.
   * @param {KeepitSnapshotRecord[]} snapshots - غير مُرتَّبة بالضرورة
   * @param {KeepitSnapshotsConfig} cfg
   * @returns {KeepitSnapshotRecord[]}
   */
  function pruneSnapshots(snapshots, cfg) {
    const sorted = snapshots.slice().sort((a, b) => b.takenAt - a.takenAt);
    const now = Date.now();
    const maxAgeCutoff = now - cfg.MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const dailyCutoff = now - cfg.KEEP_DAILY_DAYS * 24 * 60 * 60 * 1000;

    const notExpired = sorted.filter((s) => s.takenAt >= maxAgeCutoff);

    const recent = notExpired.slice(0, cfg.KEEP_RECENT_COUNT);
    const older = notExpired.slice(cfg.KEEP_RECENT_COUNT);

    const seenDays = new Set();
    const thinnedOlder = [];
    for (const snap of older) {
      if (snap.takenAt < dailyCutoff) {
        thinnedOlder.push(snap); // أقدم من نافذة التنقية اليومية: يُترَك كما هو (لن يتجاوز MAX_AGE_DAYS أعلاه)
        continue;
      }
      const dayKey = new Date(snap.takenAt).toISOString().slice(0, 10);
      if (seenDays.has(dayKey)) continue; // نسخة أخرى من نفس اليوم محفوظة بالفعل (والقائمة مرتّبة تنازليًا فهذه أقدم)
      seenDays.add(dayKey);
      thinnedOlder.push(snap);
    }

    return [...recent, ...thinnedOlder].slice(0, cfg.MAX_SNAPSHOTS);
  }

  self.KeepitSnapshotsPrune = pruneSnapshots;
})();

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import "../shared/dedup.js"; // يُلحق globalThis.KeepitDedup — تعتمد عليه restoreSnapshot (وضع "دمج")
import { KEEPIT_STATE_KEY, SNAPSHOTS_KEY, KEEP_RECENT_COUNT, MAX_SNAPSHOTS } from "./constants.js";
import {
  readSnapshots,
  takeManualSnapshot,
  deleteSnapshot,
  restoreSnapshot,
  pruneSnapshots,
  buildSnapshotDownloadPayload,
} from "./store.js";

function installChromeStorageMock(initial) {
  const store = { ...initial };
  globalThis.chrome = /** @type {any} */ ({
    storage: {
      local: {
        get: async (key) => ({ [key]: structuredClone(store[key]) }),
        set: async (patch) => {
          Object.assign(store, structuredClone(patch));
        },
      },
    },
  });
  return store;
}

function col(id, name, items = []) {
  return { id, name, color: "indigo", pinned: false, createdAt: 1, updatedAt: 1, items };
}
function item(id, url) {
  return { id, url: url ?? `https://${id}.example.com/`, title: id, createdAt: 1, order: 0 };
}
function snap(id, takenAt, trigger = "auto", collections = []) {
  return { id, takenAt, trigger, collectionsCount: collections.length, itemsCount: 0, collections };
}

describe("snapshots/store", () => {
  let store;
  beforeEach(() => {
    store = installChromeStorageMock({
      [KEEPIT_STATE_KEY]: { schemaVersion: 1, collections: [], lastUsedCollectionId: null },
      [SNAPSHOTS_KEY]: { snapshots: [] },
    });
  });

  describe("readSnapshots", () => {
    it("يرتّب من الأحدث أخذًا للأقدم", async () => {
      store[SNAPSHOTS_KEY] = { snapshots: [snap("s1", 100), snap("s2", 300), snap("s3", 200)] };
      const snapshots = await readSnapshots();
      expect(snapshots.map((s) => s.id)).toEqual(["s2", "s3", "s1"]);
    });
  });

  describe("takeManualSnapshot", () => {
    it("يأخذ نسخة من الحالة الحالية بالكامل، بترميز trigger:manual", async () => {
      store[KEEPIT_STATE_KEY] = {
        schemaVersion: 1,
        collections: [col("c1", "أ", [item("i1")])],
        lastUsedCollectionId: null,
      };
      const result = await takeManualSnapshot();
      expect(result.trigger).toBe("manual");
      expect(result.collections).toHaveLength(1);

      const stored = await readSnapshots();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(result.id);
    });

    it("النسخة مستقلة تمامًا عن الحالة الحية (تعديل لاحق للحالة لا يُغيّر النسخة المأخوذة)", async () => {
      const liveCollection = col("c1", "أ", [item("i1")]);
      store[KEEPIT_STATE_KEY] = { schemaVersion: 1, collections: [liveCollection], lastUsedCollectionId: null };
      await takeManualSnapshot();

      // تعديل الحالة الحية بعد أخذ النسخة
      store[KEEPIT_STATE_KEY].collections[0].name = "تغيّر لاحقًا";

      const [storedSnapshot] = await readSnapshots();
      expect(storedSnapshot.collections[0].name).toBe("أ"); // النسخة لم تتأثر
    });
  });

  describe("deleteSnapshot", () => {
    it("يحذف نسخة واحدة بمعرّفها، يُبقي الباقي", async () => {
      store[SNAPSHOTS_KEY] = { snapshots: [snap("s1", 100), snap("s2", 200)] };
      await deleteSnapshot("s1");
      const remaining = await readSnapshots();
      expect(remaining.map((s) => s.id)).toEqual(["s2"]);
    });
  });

  describe("restoreSnapshot", () => {
    it("وضع الدمج (merge) يُضيف تصنيفات النسخة بجانب الموجودة حاليًا بلا حذف شيء", async () => {
      store[KEEPIT_STATE_KEY] = {
        schemaVersion: 1,
        collections: [col("current", "حالي")],
        lastUsedCollectionId: null,
      };
      store[SNAPSHOTS_KEY] = { snapshots: [snap("s1", 100, "manual", [col("archived", "من النسخة")])] };

      const result = await restoreSnapshot("s1", "merge");
      expect(result).toEqual({ ok: true });

      const names = store[KEEPIT_STATE_KEY].collections.map((c) => c.name).sort();
      expect(names).toEqual(["حالي", "من النسخة"].sort());
    });

    it("وضع الاستبدال (replace) يستبدل كل شيء بمحتوى النسخة فقط", async () => {
      store[KEEPIT_STATE_KEY] = {
        schemaVersion: 1,
        collections: [col("will-be-gone", "سيُستبدَل")],
        lastUsedCollectionId: null,
      };
      store[SNAPSHOTS_KEY] = { snapshots: [snap("s1", 100, "manual", [col("from-snapshot", "من النسخة فقط")])] };

      await restoreSnapshot("s1", "replace");
      const names = store[KEEPIT_STATE_KEY].collections.map((c) => c.name);
      expect(names).toEqual(["من النسخة فقط"]);
    });

    it("معرّف نسخة غير موجود يُرجع ok:false بلا أي تعديل على الحالة", async () => {
      store[KEEPIT_STATE_KEY] = { schemaVersion: 1, collections: [col("c1", "أ")], lastUsedCollectionId: null };
      const result = await restoreSnapshot("لا-وجود", "merge");
      expect(result).toEqual({ ok: false });
      expect(store[KEEPIT_STATE_KEY].collections).toHaveLength(1); // بلا تغيير
    });
  });

  describe("buildSnapshotDownloadPayload", () => {
    it("يبني حمولة تصدير صالحة من محتوى النسخة", () => {
      const snapshot = snap("s1", 100, "manual", [col("c1", "أ", [item("i1")])]);
      const payload = buildSnapshotDownloadPayload(snapshot);
      expect(payload.collections).toHaveLength(1);
      expect(payload.collections[0].name).toBe("أ");
    });
  });

  describe("pruneSnapshots (سياسة الاحتفاظ المتدرّجة)", () => {
    const DAY = 24 * 60 * 60 * 1000;

    afterEach(() => vi.useRealTimers());

    it(`يحتفظ بآخر ${KEEP_RECENT_COUNT} نسخة كاملة بلا أي تنقية بصرف النظر عن كثافتها الزمنية`, () => {
      const now = Date.now();
      vi.setSystemTime(now);
      const dense = Array.from({ length: KEEP_RECENT_COUNT }, (_, i) => snap(`s${i}`, now - i * 60_000));
      const result = pruneSnapshots(dense);
      expect(result).toHaveLength(KEEP_RECENT_COUNT);
    });

    it('يُنقّي لنسخة واحدة كحد أقصى لكل يوم فيما بعد نافذة "الأحدث" مباشرة', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      const sameDayOld = 40 * DAY; // بعيد كفاية ليقع خارج نافذة "الأحدث"
      const baseline = Array.from({ length: KEEP_RECENT_COUNT }, (_, i) => snap(`recent-${i}`, now - i * 60_000));
      const sameDay = [
        snap("day-a", now - sameDayOld),
        snap("day-b", now - sameDayOld - 3600_000),
        snap("day-c", now - sameDayOld - 7200_000),
      ];
      const result = pruneSnapshots([...baseline, ...sameDay]);
      const sameDayKept = result.filter((s) => s.id.startsWith("day-"));
      expect(sameDayKept).toHaveLength(1); // واحدة فقط من الثلاث بنفس اليوم
    });

    it("يستبعد نسخًا أقدم من MAX_AGE_DAYS كليًا", () => {
      const now = Date.now();
      vi.setSystemTime(now);
      const veryOld = snap("ancient", now - 400 * DAY);
      const result = pruneSnapshots([veryOld]);
      expect(result.find((s) => s.id === "ancient")).toBeUndefined();
    });

    it(`لا يتجاوز الناتج ${MAX_SNAPSHOTS} نسخة مهما كان عدد المُدخلات`, () => {
      const now = Date.now();
      vi.setSystemTime(now);
      const many = Array.from({ length: MAX_SNAPSHOTS + 50 }, (_, i) => snap(`s${i}`, now - i * 3600_000));
      const result = pruneSnapshots(many);
      expect(result.length).toBeLessThanOrEqual(MAX_SNAPSHOTS);
    });

    it("مصفوفة فارغة تُنتج مصفوفة فارغة بلا أي خطأ", () => {
      expect(pruneSnapshots([])).toEqual([]);
    });
  });
});

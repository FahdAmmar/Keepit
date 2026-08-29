import { describe, expect, it } from "vitest";
import { COLLECTION_SORT_MODES, normalizeCollectionView, sortCollectionsForView } from "./collection-view.js";

const collections = [
  { id: "a", name: "Beta", pinned: false, createdAt: 20 },
  { id: "b", name: "Alpha", pinned: true, createdAt: 10 },
  { id: "c", name: "Gamma", pinned: false, createdAt: 30 },
];

const ids = (value) => value.map((collection) => collection.id);

describe("خيارات عرض المجموعات", () => {
  it("يعيد الترتيب اليدوي كما هو دون تعديل المصفوفة الأصلية", () => {
    const sorted = sortCollectionsForView(collections, { sortMode: COLLECTION_SORT_MODES.MANUAL });
    expect(ids(sorted)).toEqual(["a", "b", "c"]);
    expect(sorted).not.toBe(collections);
  });

  it("يرتب المجموعات المثبتة أولًا ويحافظ على الترتيب اليدوي داخل كل قسم", () => {
    expect(ids(sortCollectionsForView(collections, { sortMode: COLLECTION_SORT_MODES.PINNED_FIRST }))).toEqual(["b", "a", "c"]);
  });

  it("يدعم الفرز الأبجدي والزمني", () => {
    expect(ids(sortCollectionsForView(collections, { sortMode: COLLECTION_SORT_MODES.ALPHA }, "en"))).toEqual(["b", "a", "c"]);
    expect(ids(sortCollectionsForView(collections, { sortMode: COLLECTION_SORT_MODES.NEWEST }))).toEqual(["c", "a", "b"]);
    expect(ids(sortCollectionsForView(collections, { sortMode: COLLECTION_SORT_MODES.OLDEST }))).toEqual(["b", "a", "c"]);
  });

  it("يعود بأمان إلى الترتيب اليدوي عند وجود قيمة غير معتمدة", () => {
    expect(normalizeCollectionView({ sortMode: "bad-value" })).toEqual({ sortMode: COLLECTION_SORT_MODES.MANUAL });
  });
});

/**
 * تفضيلات عرض المجموعات. يبقى ترتيب المصفوفة هو الترتيب اليدوي الدائم،
 * بينما لا تؤثر أنماط الفرز المؤقتة إلا في طريقة العرض.
 */
export const COLLECTION_VIEW_KEY = "keepit:collection-view";

export const COLLECTION_SORT_MODES = Object.freeze({
  MANUAL: "manual",
  PINNED_FIRST: "pinned-first",
  NEWEST: "newest",
  OLDEST: "oldest",
  ALPHA: "alpha",
});

const VALID_MODES = new Set(Object.values(COLLECTION_SORT_MODES));

/** @param {unknown} value */
export function normalizeCollectionView(value) {
  const mode = value && typeof value === "object" && VALID_MODES.has(/** @type {any} */ (value).sortMode)
    ? /** @type {any} */ (value).sortMode
    : COLLECTION_SORT_MODES.MANUAL;
  return { sortMode: mode };
}

/** @param {Array<any>} collections @param {{sortMode?: string} | null | undefined} view @param {string} [locale] */
export function sortCollectionsForView(collections, view, locale = "ar") {
  const source = Array.isArray(collections) ? collections.slice() : [];
  const mode = normalizeCollectionView(view).sortMode;
  if (mode === COLLECTION_SORT_MODES.MANUAL) return source;

  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
  const originalIndex = new Map(source.map((collection, index) => [collection, index]));
  const compareNumberDescending = (left, right, field) =>
    (Number(right?.[field]) || 0) - (Number(left?.[field]) || 0);

  return source.sort((left, right) => {
    let result = 0;
    if (mode === COLLECTION_SORT_MODES.PINNED_FIRST) result = Number(Boolean(right?.pinned)) - Number(Boolean(left?.pinned));
    if (mode === COLLECTION_SORT_MODES.NEWEST) result = compareNumberDescending(left, right, "createdAt");
    if (mode === COLLECTION_SORT_MODES.OLDEST) result = -compareNumberDescending(left, right, "createdAt");
    if (mode === COLLECTION_SORT_MODES.ALPHA) result = collator.compare(String(left?.name ?? ""), String(right?.name ?? ""));
    return result || (originalIndex.get(left) ?? 0) - (originalIndex.get(right) ?? 0);
  });
}

/** @param {string} sortMode */
export async function setCollectionSortMode(sortMode) {
  const normalized = normalizeCollectionView({ sortMode });
  await chrome.storage.local.set({ [COLLECTION_VIEW_KEY]: normalized });
  return normalized;
}

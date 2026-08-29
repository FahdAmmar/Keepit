/**
 * أدوات وسوم مشتركة وخفيفة.
 * تحفظ قابلية البحث ضمن الوسوم الموجودة مسبقًا دون إضافة واجهة مستقلة.
 */
export const MAX_TAGS_PER_ITEM = 12;
export const MAX_TAG_LENGTH = 36;

/** @param {unknown} raw */
export function normalizeTags(raw) {
  const values = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,،\n]/u)
      : [];
  const used = new Set();
  const tags = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const tag = value.trim().replace(/\s+/gu, " ").slice(0, MAX_TAG_LENGTH);
    const key = tag.toLocaleLowerCase();
    if (!tag || used.has(key)) continue;
    used.add(key);
    tags.push(tag);
    if (tags.length === MAX_TAGS_PER_ITEM) break;
  }
  return tags;
}

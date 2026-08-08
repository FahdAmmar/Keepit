"use strict";
/**
 * background/trash-sw/diff.js
 * ---------------------------------------------------------------------------
 * دالة صرفة (pure) لا آثار جانبية لها: تقارن حالة "قديمة" و"جديدة" لـ
 * keepit:state وتُرجع كل تصنيف أو موقع كان موجودًا في القديمة واختفى من
 * الجديدة. لا تفترض *سبب* الاختفاء (حذف يدوي، حذف عبر قائمة السياق، أو
 * حتى حذف ناتج عن "سحب" وضع "استبدال" في ميزة المزامنة المحلية) — أي
 * اختفاء بنيوي حقيقي يُعامَل بنفس الطريقة، وهذا مقصود: فهو بالضبط ما يجعل
 * سلة المحذوفات شبكة أمان ضد الخطر الوحيد الموثَّق في local-sync/README.md
 * (فقدان بيانات صامت في وضع "استبدال")، دون أي معرفة أو اقتران بكود تلك
 * الميزة إطلاقًا.
 *
 * المقارنة تتم بحسب المعرّف (id) لا بحسب الفهرس (index) أو الاسم، لتبقى
 * صحيحة حتى مع إعادة الترتيب أو تغيير الاسم.
 */
self.KeepitTrashDiff = {
  /**
   * @param {{collections?: KeepitCollection[]} | null | undefined} oldState
   * @param {{collections?: KeepitCollection[]} | null | undefined} newState
   * @returns {Array<
   *   | { kind: "collection", collection: KeepitCollection }
   *   | { kind: "item", item: KeepitItem, sourceCollection: {id: string, name: string, color: string} }
   * >}
   */
  computeDeletions(oldState, newState) {
    const oldCollections = Array.isArray(oldState?.collections) ? oldState.collections : [];
    if (oldCollections.length === 0) return []; // لا توجد حالة سابقة فعلية، فلا شيء يمكن أن يكون قد فُقد

    const newCollections = Array.isArray(newState?.collections) ? newState.collections : [];
    const newById = new Map(newCollections.filter(isValidCollection).map((c) => [c.id, c]));

    const deletions = [];

    for (const oldCol of oldCollections) {
      if (!isValidCollection(oldCol)) continue;

      const stillExists = newById.get(oldCol.id);
      if (!stillExists) {
        deletions.push({ kind: "collection", collection: cloneCollection(oldCol) });
        continue;
      }

      const newItemIds = new Set(
        (Array.isArray(stillExists.items) ? stillExists.items : [])
          .filter(isValidItem)
          .map((i) => i.id),
      );
      const oldItems = Array.isArray(oldCol.items) ? oldCol.items : [];
      for (const oldItem of oldItems) {
        if (!isValidItem(oldItem)) continue;
        if (newItemIds.has(oldItem.id)) continue;
        deletions.push({
          kind: "item",
          item: cloneItem(oldItem),
          sourceCollection: { id: oldCol.id, name: oldCol.name, color: oldCol.color },
        });
      }
    }

    return deletions;
  },
};

function isValidCollection(c) {
  return Boolean(c) && typeof c === "object" && typeof c.id === "string";
}

function isValidItem(i) {
  return Boolean(i) && typeof i === "object" && typeof i.id === "string";
}

/** نسخ بقائمة حقول محدَّدة صراحةً (whitelist) بدل نسخ سطحي شامل (spread) —
 *  دفاع بسيط يمنع تسرّب أي حقل غير متوقّع إلى داخل سلة المحذوفات. */
function cloneCollection(col) {
  return {
    id: col.id,
    name: col.name,
    color: col.color,
    pinned: Boolean(col.pinned),
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
    items: Array.isArray(col.items) ? col.items.filter(isValidItem).map(cloneItem) : [],
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

"use strict";
/**
 * background/trash-sw/diff.js
 * ---------------------------------------------------------------------------
 * دالة صرفة (pure) لا آثار جانبية لها: تقارن حالة "قديمة" و"جديدة" لـ
 * keepit:state وتُرجع كل تصنيف اختفى، وكل موقع لم يعد موجودًا في أي
 * تصنيف. وجود معرّف الموقع نفسه في تصنيف آخر يُعامَل كنقل، لا كحذف، كي لا
 * تُنشئ سلة المحذوفات سجلًا زائفًا عند استخدام إجراء النقل الجماعي.
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
    // معرّف العنصر فريد عبر كل التصنيفات. وجوده في أي تصنيف جديد يعني أنه
    // نُقل فقط، لا أنه حُذف، ولذلك لا ينبغي إنشاء إدخال سلة زائف له.
    const allNewItemIds = new Set(
      newCollections.flatMap((collection) =>
        isValidCollection(collection) && Array.isArray(collection.items)
          ? collection.items.filter(isValidItem).map((item) => item.id)
          : [],
      ),
    );

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
        if (newItemIds.has(oldItem.id) || allNewItemIds.has(oldItem.id)) continue;
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

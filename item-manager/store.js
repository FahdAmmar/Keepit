/**
 * item-manager/store.js
 * ---------------------------------------------------------------------------
 * القراءة والتعديل الفعلي على keepit:state لميزة إدارة العناصر. كل دالة
 * هنا تقرأ الحالة، تعدّلها، وتكتبها كاملة دفعة واحدة (لا كتابات جزئية
 * متتالية) — يحفظ اتساق ما يراه background/trash-sw/diff.js من فرق نظيف
 * "قبل/بعد" واحد لكل عملية، لا سلسلة فروق وهمية متتالية.
 *
 * الكتابة عبر shared/optimistic-state-write.js (تحقّق تفاؤلي من عدم وجود
 * تغيّر متزامن قبل الكتابة الفعلية) — نفس الحماية المطبَّقة في
 * local-sync/merge-pull.js وباقي ملفات store.js عبر المشروع؛ راجع تعليق
 * تلك الأداة للتفصيل الكامل لسبب وجودها.
 */
import { KEEPIT_STATE_KEY } from "./constants.js";
import { writeStateOptimistically } from "../shared/optimistic-state-write.js";

/** @type {KeepitState} */
const EMPTY_STATE = { schemaVersion: 1, collections: [], lastUsedCollectionId: null };

/** @returns {Promise<KeepitState>} */
async function readState() {
  const data = /** @type {{[k: string]: KeepitState | undefined}} */ (await chrome.storage.local.get(KEEPIT_STATE_KEY));
  return data[KEEPIT_STATE_KEY] ?? EMPTY_STATE;
}

/** @returns {Promise<KeepitCollection[]>} كل تصنيفات Keepit الحالية */
export async function readCollections() {
  const state = await readState();
  return Array.isArray(state.collections) ? state.collections : [];
}

/**
 * يعيد ترتيب عناصر تصنيف واحد بالكامل حسب مصفوفة معرّفات جديدة — تُستخدَم
 * بعد السحب-والإفلات أو أزرار "نقل لأعلى/أسفل". يُحدَّث حقل order لكل
 * عنصر ليطابق موضعه الجديد (main.js يفرز به فعليًا — تحقّقنا من استخدامه
 * الفعلي داخل الحزمة المضغوطة قبل الاعتماد عليه)، وتُعاد المصفوفة نفسها
 * مرتّبة فعليًا أيضًا لا الحقل وحده، احتياطًا لأي مسار عرض يعتمد ترتيب
 * المصفوفة مباشرة.
 *
 * آمن تمامًا من منظور سلة المحذوفات: المقارنة هناك بالمعرّف (id) لا
 * بالموضع (راجع background/trash-sw/diff.js)، فإعادة الترتيب بلا أي حذف
 * أو إضافة معرّفات فعلية لا تُنشئ أي إدخال "محذوف" زائف مهما حصل.
 *
 * @param {string} collectionId
 * @param {string[]} newItemIdsOrder
 * @returns {Promise<boolean>}
 */
export async function reorderItems(collectionId, newItemIdsOrder) {
  let found = false;
  await writeStateOptimistically(
    KEEPIT_STATE_KEY,
    (state) => {
      const collections = Array.isArray(state.collections) ? state.collections : [];
      const collection = collections.find((c) => c.id === collectionId);
      if (!collection || !Array.isArray(collection.items)) {
        found = false;
        return state;
      }
      found = true;

      const byId = new Map(collection.items.map((it) => [it.id, it]));
      const orderedExisting = newItemIdsOrder
        .map((id) => byId.get(id))
        .filter(/** @returns {it is KeepitItem} */ (it) => Boolean(it));
      // أي عنصر لم يكن ضمن newItemIdsOrder (حالة غير متوقعة: مثلًا عنصر
      // أُضيف بالتزامن من سياق آخر) يُبقى في آخر القائمة بدل أن يختفي
      // صامتًا ويُسجَّل خطأً في سلة المحذوفات.
      const leftover = collection.items.filter((it) => !newItemIdsOrder.includes(it.id));
      // بناء كائنات عناصر جديدة (لا تعديل داخل عناصر state الأصلية) —
      // writeStateOptimistically تتطلب صراحةً أن تكون mutate خالصة
      // (pure) بلا آثار جانبية على معاملها؛ تعديل it.order مباشرة في
      // مكانه كان يُفسِد نسخة "before" المرجعية التي تُقارَن بها لاحقًا،
      // فيظهر تغيّر زائف عند كل استدعاء ويفشل الحفظ صامتًا بعد استنفاد
      // كل المحاولات (وُجدت هذه العلّة فعليًا عبر اختبار فشل، لا افتراضًا).
      const reordered = [...orderedExisting, ...leftover].map((it, index) => ({ ...it, order: index }));

      const updatedCollections = collections.map((c) =>
        c.id === collectionId ? { ...c, items: reordered, updatedAt: Date.now() } : c,
      );
      return { ...state, collections: updatedCollections };
    },
    EMPTY_STATE,
  );
  return found;
}

/**
 * يحذف مجموعة عناصر (بمعرّفاتها) من تصنيف واحد. لا حاجة لأي منطق "انقل
 * لسلة المحذوفات" يدويًا هنا: إزالة عنصر من مصفوفة items عبر كتابة عادية
 * على keepit:state تُكتشَف تلقائيًا عبر آلية الفرق الموجودة أصلاً
 * (بالمعرّف، لا الموضع)، فتُنشئ إدخال سلة محذوفات صحيحًا بمفردها — قابلاً
 * للاستعادة لاحقًا من نفس لوحة سلة المحذوفات الحالية، بلا أي كود إضافي
 * مطلوب في هذه الميزة إطلاقًا.
 *
 * @param {string} collectionId
 * @param {string[]} itemIds
 * @returns {Promise<number>} عدد العناصر المحذوفة فعليًا
 */
export async function deleteItems(collectionId, itemIds) {
  let deletedCount = 0;
  await writeStateOptimistically(
    KEEPIT_STATE_KEY,
    (state) => {
      deletedCount = 0;
      const collections = Array.isArray(state.collections) ? state.collections : [];
      const collection = collections.find((c) => c.id === collectionId);
      if (!collection || !Array.isArray(collection.items)) return state;

      const idSet = new Set(itemIds);
      const before = collection.items.length;
      const filteredItems = collection.items.filter((it) => !idSet.has(it.id));
      deletedCount = before - filteredItems.length;
      if (deletedCount === 0) return state;

      const updatedCollections = collections.map((c) =>
        c.id === collectionId ? { ...c, items: filteredItems, updatedAt: Date.now() } : c,
      );
      return { ...state, collections: updatedCollections };
    },
    EMPTY_STATE,
  );
  return deletedCount;
}

/**
 * ينقل مجموعة عناصر من تصنيف لآخر.
 *
 * ملاحظة سلوك مقصودة: هذا يعني اختفاء تلك العناصر من التصنيف المصدر من
 * منظور آلية سلة المحذوفات (فرق بالمعرّف)، فتُنشئ لها إدخالات "محذوف" في
 * التصنيف المصدر أيضًا رغم أنها لم تُحذف فعليًا، بل انتقلت. هذا أثر جانبي
 * موروث من فلسفة تلك الآلية الموثَّقة صراحةً في diff.js ("لا تفترض سبب
 * الاختفاء؛ أي اختفاء بنيوي حقيقي يُعامَل بنفس الطريقة") — تركناه عمدًا
 * بلا التفاف: أثره الفعلي إدخال سلة إضافي يُهمَل أو ينتهي تلقائيًا خلال
 * 30 يومًا، لا فقدان بيانات حقيقي، وتعديل تلك الآلية نفسها لتمييز "نقل"
 * عن "حذف" تغيير أعمق من نطاق هذه الميزة ويمسّ ميزة أخرى قائمة بذاتها.
 *
 * @param {string} sourceCollectionId
 * @param {string} targetCollectionId
 * @param {string[]} itemIds
 * @returns {Promise<number>} عدد العناصر المنقولة فعليًا
 */
export async function moveItems(sourceCollectionId, targetCollectionId, itemIds) {
  if (sourceCollectionId === targetCollectionId) return 0;

  let movedCount = 0;
  await writeStateOptimistically(
    KEEPIT_STATE_KEY,
    (state) => {
      movedCount = 0;
      const collections = Array.isArray(state.collections) ? state.collections : [];
      const source = collections.find((c) => c.id === sourceCollectionId);
      const target = collections.find((c) => c.id === targetCollectionId);
      if (!source || !target || !Array.isArray(source.items)) return state;

      const idSet = new Set(itemIds);
      const moving = source.items.filter((it) => idSet.has(it.id));
      if (moving.length === 0) return state;
      movedCount = moving.length;

      const remainingSourceItems = source.items.filter((it) => !idSet.has(it.id));
      const targetItems = Array.isArray(target.items) ? target.items : [];
      const baseOrder = targetItems.length;
      const movedItems = moving.map((it, i) => ({ ...it, order: baseOrder + i }));

      const now = Date.now();
      const updatedCollections = collections.map((c) => {
        if (c.id === sourceCollectionId) return { ...c, items: remainingSourceItems, updatedAt: now };
        if (c.id === targetCollectionId) return { ...c, items: [...targetItems, ...movedItems], updatedAt: now };
        return c;
      });
      return { ...state, collections: updatedCollections };
    },
    EMPTY_STATE,
  );
  return movedCount;
}

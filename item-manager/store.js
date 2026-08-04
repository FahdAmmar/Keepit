/**
 * item-manager/store.js
 * ---------------------------------------------------------------------------
 * القراءة والتعديل الفعلي على keepit:state لميزة إدارة العناصر. كل دالة
 * هنا تقرأ الحالة، تعدّلها في الذاكرة، وتكتبها كاملة دفعة واحدة (لا كتابات
 * جزئية متتالية) — يحفظ اتساق ما يراه background/trash-sw/diff.js من فرق
 * نظيف "قبل/بعد" واحد لكل عملية، لا سلسلة فروق وهمية متتالية.
 *
 * ملاحظة تزامن (مقارنةً بالإصلاح الأشمل في local-sync/merge-pull.js):
 * هذه عمليات يبدأها المستخدم صراحةً (نقرة على "حذف المحدد" مثلاً)، لا
 * دورة خلفية تلقائية متكررة كل دقيقتين — فنافذة التسابق مع كتابة أخرى
 * متزامنة أضيق كثيرًا احتمالًا وأثرًا مقارنةً بالمزامنة المحلية التلقائية
 * (التي أُصلحت بحلقة محاولات تفاؤلية كاملة). قراءة الحالة هنا تحصل late
 * (مباشرة قبل الحساب) بدل مبكرًا، وهو تخفيف متناسب مع مستوى الخطر الفعلي
 * بلا تعقيد retry-loop كامل غير مبرَّر لعملية واحدة يقودها المستخدم مباشرة.
 */
import { KEEPIT_STATE_KEY } from "./constants.js";

async function readState() {
  const data = await chrome.storage.local.get(KEEPIT_STATE_KEY);
  return data[KEEPIT_STATE_KEY] ?? { schemaVersion: 1, collections: [], lastUsedCollectionId: null };
}

async function writeState(state) {
  await chrome.storage.local.set({ [KEEPIT_STATE_KEY]: state });
}

/** @returns {Promise<Array<any>>} كل تصنيفات Keepit الحالية */
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
  const state = await readState();
  const collections = Array.isArray(state.collections) ? state.collections : [];
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection || !Array.isArray(collection.items)) return false;

  const byId = new Map(collection.items.map((it) => [it.id, it]));
  const reordered = newItemIdsOrder.map((id) => byId.get(id)).filter(Boolean);
  // أي عنصر لم يكن ضمن newItemIdsOrder (حالة غير متوقعة: مثلًا عنصر أُضيف
  // بالتزامن من سياق آخر بين قراءتنا وحسابنا) يُبقى في آخر القائمة بدل أن
  // يختفي صامتًا ويُسجَّل خطأً في سلة المحذوفات.
  for (const it of collection.items) {
    if (!newItemIdsOrder.includes(it.id)) reordered.push(it);
  }
  reordered.forEach((it, index) => {
    it.order = index;
  });
  collection.items = reordered;
  collection.updatedAt = Date.now();

  await writeState(state);
  return true;
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
  const state = await readState();
  const collections = Array.isArray(state.collections) ? state.collections : [];
  const collection = collections.find((c) => c.id === collectionId);
  if (!collection || !Array.isArray(collection.items)) return 0;

  const idSet = new Set(itemIds);
  const before = collection.items.length;
  collection.items = collection.items.filter((it) => !idSet.has(it.id));
  collection.updatedAt = Date.now();

  await writeState(state);
  return before - collection.items.length;
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

  const state = await readState();
  const collections = Array.isArray(state.collections) ? state.collections : [];
  const source = collections.find((c) => c.id === sourceCollectionId);
  const target = collections.find((c) => c.id === targetCollectionId);
  if (!source || !target || !Array.isArray(source.items)) return 0;

  const idSet = new Set(itemIds);
  const moving = source.items.filter((it) => idSet.has(it.id));
  if (moving.length === 0) return 0;

  source.items = source.items.filter((it) => !idSet.has(it.id));
  const targetItems = Array.isArray(target.items) ? target.items : (target.items = []);
  const baseOrder = targetItems.length;
  moving.forEach((it, i) => {
    it.order = baseOrder + i;
  });
  targetItems.push(...moving);

  const now = Date.now();
  source.updatedAt = now;
  target.updatedAt = now;

  await writeState(state);
  return moving.length;
}

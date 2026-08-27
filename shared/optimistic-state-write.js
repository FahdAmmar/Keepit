import { stableStringify } from "./stable-stringify.js";

/** أقصى عدد محاولات عند اكتشاف تغيّر متزامن أثناء الحساب — رقم سخي مقابل
 *  عملية رخيصة جدًا (قراءة محلية + دالة تحويل في الذاكرة). */
const MAX_WRITE_ATTEMPTS = 5;

/**
 * يقرأ مفتاح تخزين واحدًا، يحسب حالة جديدة عبر mutate، ثم يكتبها — لكن
 * يتحقق تفاؤليًا (optimistic concurrency) مباشرة قبل الكتابة أن أحدًا لم
 * يكتب فوق القراءة الأولى بالتزامن (سياق آخر: تبويب popup مفتوح، تبويب
 * options آخر، أو أهم من ذلك دورة المزامنة المحلية التلقائية التي تعمل كل
 * دقيقتين بلا أي تدخل من المستخدم).
 *
 * ## لماذا هذه الأداة موجودة تحديدًا
 * كل الأنماط القديمة عبر المشروع كانت: قراءة الحالة، حساب التعديل، كتابة
 * مباشرة — بلا أي تحقّق من أن الحالة لا تزال كما قُرئت. إن وصلت كتابة أخرى
 * من سياق مختلف تمامًا في تلك الفجوة الزمنية الضيقة، كانت الكتابة الثانية
 * (المبنية على قراءة قديمة لا تعرف بالكتابة الأولى) تستبدلها بالكامل صامتًا.
 * هذا بالضبط السبب الجذري الذي كان يُنتج "مجلدات محذوفة في سلة المحذوفات
 * بلا حذف فعلي" (أُصلح أول مرة في local-sync/merge-pull.js، v1.8.0) — نفس
 * الفئة من الأخطاء موجودة كنمط متكرر عبر trash/store.js وsnapshots/store.js
 * وbookmarks-bridge/store.js وitem-manager/store.js أيضًا؛ هذه الأداة
 * تُوحِّد الإصلاح في مكان واحد بدل تكراره يدويًا في كل ملف.
 *
 * إن لم تكن الحالة قد تغيّرت أثناء الحساب، نكتب بأمان مباشرة. إن تغيّرت،
 * نعيد المحاولة كاملة (نداء mutate من جديد على الحالة الجديدة الفعلية) —
 * حتى MAX_WRITE_ATTEMPTS مرة، ثم نتوقف بصمت بدل المخاطرة بفقدان بيانات
 * (تزامن بهذه الكثافة غير متوقَّع عمليًا).
 *
 * @template T
 * @param {string} storageKey
 * @param {(current: T) => T} mutate - يجب أن تكون خالصة (pure) ومتزامنة؛
 *   قد تُستدعى أكثر من مرة لنفس العملية المنطقية الواحدة عند إعادة المحاولة.
 * @param {T} defaultValue - يُستخدَم إن كان المفتاح فارغًا (أول استخدام).
 * @returns {Promise<{written: boolean, value: T}>}
 */
export async function writeStateOptimistically(storageKey, mutate, defaultValue) {
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const before = await readKey(storageKey, defaultValue);
    const next = mutate(before);

    // لا تغيير فعلي مطلوب (mutate أعادت نفس المحتوى بنيويًا) — لا داعي
    // لأي كتابة، وبالتأكيد لا حاجة للتحقق التفاؤلي لعملية لن تحدث أصلاً.
    if (stableStringify(next) === stableStringify(before)) {
      return { written: false, value: before };
    }

    // التحقق التفاؤلي: أعد القراءة الآن، مباشرة قبل الكتابة (بلا أي await
    // آخر بينهما وبين chrome.storage.local.set أسفل هذا الشرط)، لتضييق
    // نافذة السباق لأقصى حد عملي ممكن بلا دعم معاملات حقيقي من المنصة.
    const stillCurrent = await readKey(storageKey, defaultValue);
    if (stableStringify(stillCurrent) !== stableStringify(before)) {
      continue; // تغيّرت الحالة أثناء حسابنا — أعد المحاولة كاملة من الحالة الجديدة
    }

    await chrome.storage.local.set({ [storageKey]: next });
    return { written: true, value: next };
  }

  // استُنفدت كل المحاولات — تزامن كثيف جدًا وغير متوقَّع عمليًا. لا نكتب
  // شيئًا بدل المخاطرة بفقدان بيانات؛ ليست حالة خطأ فعلية تستحق إزعاج
  // المستخدم — القيمة الحالية الفعلية تُعاد بدل قيمة توهُّمية.
  console.warn(`[Keepit] writeStateOptimistically: تجاوز الحد الأقصى للمحاولات على "${storageKey}"`);
  return { written: false, value: await readKey(storageKey, defaultValue) };
}

/**
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {Promise<T>}
 */
async function readKey(key, defaultValue) {
  const data = /** @type {{[k: string]: T | undefined}} */ (await chrome.storage.local.get(key));
  return data[key] ?? defaultValue;
}

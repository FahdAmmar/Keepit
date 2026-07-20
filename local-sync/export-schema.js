/**
 * local-sync/export-schema.js
 * ---------------------------------------------------------------------------
 * يبني نفس صيغة JSON التي تنتجها ميزة "تصدير" المدمجة في Keepit تمامًا
 * (راجع options/main.js: الدوال المسؤولة عن exportAllAction). الالتزام
 * بنفس الصيغة قرار مقصود:
 *
 *   1) الملف الناتج هنا صالح لإعادة الاستيراد داخل Keepit مباشرة (زر
 *      "استيراد" في صفحة الإعدادات يقبله كما هو) أو أي أداة متوافقة.
 *   2) مصدر حقيقة واحد لتعريف "ما الذي يعنيه تصدير بيانات Keepit"، بدل
 *      نسخة موازية قد تنحرف عنها بمرور الوقت.
 *
 * ملاحظة: نتجاهل عمدًا الحقول الداخلية البحتة (id، pinned، updatedAt)
 * تمامًا كما تفعل ميزة التصدير الأصلية — هذه بيانات تشغيلية للواجهة وليست
 * "محتوى" أضافه المستخدم.
 */

/**
 * @param {{ collections?: Array<any> }} state - القيمة الخام لمفتاح keepit:state
 */
export function buildExportPayload(state) {
  const collections = Array.isArray(state?.collections) ? state.collections : [];
  return {
    app: "keepit",
    formatVersion: 1,
    exportedAt: Date.now(),
    collections: collections.map(mapCollection),
  };
}

function mapCollection(collection) {
  const items = Array.isArray(collection?.items) ? collection.items : [];
  return {
    name: collection?.name ?? "",
    color: collection?.color ?? "indigo",
    items: [...items]
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .map(mapItem),
  };
}

function mapItem(item) {
  return {
    url: item?.url ?? "",
    title: item?.title ?? "",
    ...(item?.faviconUrl ? { faviconUrl: item.faviconUrl } : {}),
    ...(item?.note ? { note: item.note } : {}),
    createdAt: item?.createdAt ?? Date.now(),
  };
}

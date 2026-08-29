import { describe, it, expect, beforeAll } from "vitest";

// background/trash-sw/diff.js سكربت كلاسيكي (لا ES module) يُلحق واجهته بـ
// self.KeepitTrashDiff — نفس نمط تحميل shared/dedup.js في اختباره.
import "./diff.js";

/** @type {any} */
let Diff;

beforeAll(() => {
  Diff = /** @type {any} */ (globalThis).KeepitTrashDiff;
});

function col(id, name, items = []) {
  return { id, name, color: "indigo", pinned: false, createdAt: 1, updatedAt: 1, items };
}
function item(id, url = `https://${id}.example.com/`) {
  return { id, url, title: id, createdAt: 1, order: 0 };
}

describe("KeepitTrashDiff.computeDeletions", () => {
  it("بلا أي تغيير فعلي، لا يُبلِّغ عن أي حذف", () => {
    const state = { collections: [col("c1", "A", [item("i1")])] };
    expect(Diff.computeDeletions(state, state)).toEqual([]);
  });

  it("تصنيف اختفى بالكامل يُبلَّغ كحذف collection كامل", () => {
    const oldState = { collections: [col("c1", "A"), col("c2", "B")] };
    const newState = { collections: [col("c1", "A")] };
    const deletions = Diff.computeDeletions(oldState, newState);
    expect(deletions).toHaveLength(1);
    expect(deletions[0]).toMatchObject({ kind: "collection", collection: { id: "c2", name: "B" } });
  });

  it("موقع اختفى من تصنيف لا يزال موجودًا يُبلَّغ كحذف item مع sourceCollection صحيح", () => {
    const oldState = { collections: [col("c1", "A", [item("i1"), item("i2")])] };
    const newState = { collections: [col("c1", "A", [item("i1")])] };
    const deletions = Diff.computeDeletions(oldState, newState);
    expect(deletions).toHaveLength(1);
    expect(deletions[0]).toMatchObject({
      kind: "item",
      item: { id: "i2" },
      sourceCollection: { id: "c1", name: "A" },
    });
  });

  it("نقل موقع إلى تصنيف آخر لا يُبلَّغ كحذف زائف", () => {
    const oldState = {
      collections: [col("c1", "المصدر", [item("i1"), item("i2")]), col("c2", "الهدف")],
    };
    const newState = {
      collections: [col("c1", "المصدر", [item("i1")]), col("c2", "الهدف", [item("i2")])],
    };
    expect(Diff.computeDeletions(oldState, newState)).toEqual([]);
  });

  it(
    "إعادة ترتيب بحتة (نفس المعرّفات، ترتيب مصفوفة مختلف) لا تُنتج أي حذف زائف — " +
      "هذا بالضبط الضمان الذي اعتمدت عليه item-manager/store.js#reorderItems لأمانها",
    () => {
      const oldState = { collections: [col("c1", "A", [item("i1"), item("i2"), item("i3")])] };
      const newState = { collections: [col("c1", "A", [item("i3"), item("i1"), item("i2")])] };
      expect(Diff.computeDeletions(oldState, newState)).toEqual([]);
    },
  );

  it("oldState فارغة أو null — لا حالة سابقة حقيقية، فلا شيء يمكن اعتباره مفقودًا", () => {
    expect(Diff.computeDeletions(null, { collections: [col("c1", "A")] })).toEqual([]);
    expect(Diff.computeDeletions(undefined, { collections: [col("c1", "A")] })).toEqual([]);
    expect(Diff.computeDeletions({ collections: [] }, { collections: [col("c1", "A")] })).toEqual([]);
  });

  it("newState فارغة أو null بينما oldState تحوي بيانات — كل شيء يُبلَّغ كحذف (سيناريو استبدال كامل/تلف قراءة)", () => {
    const oldState = { collections: [col("c1", "A", [item("i1")]), col("c2", "B")] };
    const deletions = Diff.computeDeletions(oldState, null);
    expect(deletions).toHaveLength(2);
    expect(deletions.map((d) => d.kind)).toEqual(["collection", "collection"]);
  });

  it("عناصر غير صالحة (بلا id) تُتجاهَل بأمان بلا رمي أي خطأ", () => {
    const oldState = { collections: [col("c1", "A", [item("i1")]), null, { name: "بلا id" }, "نص عشوائي"] };
    const newState = { collections: [col("c1", "A", [item("i1")])] };
    expect(() => Diff.computeDeletions(oldState, newState)).not.toThrow();
    expect(Diff.computeDeletions(oldState, newState)).toEqual([]);
  });

  it("حذف تصنيف كامل + حذف موقع من تصنيف آخر لا يزال موجودًا، معًا في نفس الفرق", () => {
    const oldState = {
      collections: [col("c1", "A", [item("i1"), item("i2")]), col("c2", "B", [item("i3")])],
    };
    const newState = { collections: [col("c1", "A", [item("i1")])] };
    const deletions = Diff.computeDeletions(oldState, newState);
    expect(deletions).toHaveLength(2);
    const kinds = deletions.map((d) => d.kind).sort();
    expect(kinds).toEqual(["collection", "item"]);
  });

  it("النسخ (clone) يستخدم قائمة حقول محدَّدة صراحةً — حقل غير متوقَّع لا يتسرّب لسجل الحذف", () => {
    const maliciousCollection = { ...col("c1", "A"), __proto__evil: "x", extraField: "لا يجب أن يظهر" };
    const oldState = { collections: [maliciousCollection] };
    const deletions = Diff.computeDeletions(oldState, { collections: [] });
    expect(deletions[0].collection).not.toHaveProperty("extraField");
    expect(Object.keys(deletions[0].collection).sort()).toEqual(
      ["color", "createdAt", "id", "items", "name", "pinned", "updatedAt"].sort(),
    );
  });

  it("faviconUrl وnote الفارغين لا يُدرَجان في النسخة المحذوفة (حقول اختيارية حقيقية)", () => {
    const oldState = { collections: [col("c1", "A", [item("i1")])] };
    const deletions = Diff.computeDeletions(oldState, { collections: [] });
    const clonedItem = deletions.find((d) => d.kind === "item")?.item ?? deletions[0].collection.items[0];
    expect(clonedItem).not.toHaveProperty("faviconUrl");
    expect(clonedItem).not.toHaveProperty("note");
  });
});

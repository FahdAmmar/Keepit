import { describe, expect, it } from "vitest";
import { MAX_TAG_LENGTH, MAX_TAGS_PER_ITEM, normalizeTags } from "./tag-utils.js";

describe("تطبيع الوسوم المشتركة", () => {
  it("ينظف الفواصل والمسافات ويحذف التكرارات دون تغيير ترتيب الوسوم", () => {
    expect(normalizeTags(" عمل، تعلم, عمل\n JavaScript ")).toEqual(["عمل", "تعلم", "JavaScript"]);
  });

  it("يقبل المصفوفات ويتجاهل القيم غير النصية", () => {
    expect(normalizeTags(["  بحث ", null, "بحث", 42, "مفضلة"])).toEqual(["بحث", "مفضلة"]);
  });

  it("يلتزم بحدي طول الوسم وعدد الوسوم", () => {
    const longTag = "س".repeat(MAX_TAG_LENGTH + 5);
    const manyTags = Array.from({ length: MAX_TAGS_PER_ITEM + 3 }, (_, index) => `وسم-${index}`);
    expect(normalizeTags([longTag, ...manyTags])).toHaveLength(MAX_TAGS_PER_ITEM);
    expect(normalizeTags(longTag)).toEqual([longTag.slice(0, MAX_TAG_LENGTH)]);
  });
});

import { describe, it, expect } from "vitest";
import { parseNetscapeHtml, flattenToCollections, serializeToNetscapeHtml } from "./netscape-format.js";

// jsdom (بيئة الاختبار الافتراضية في vitest.config.js) توفّر DOMParser عالميًا،
// فلا حاجة لأي إعداد إضافي هنا.

const SAMPLE_HTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><A HREF="https://top.example.com/">Top level</A>
    <DT><H3>Folder A</H3>
    <DL><p>
        <DT><A HREF="https://a1.example.com/" ADD_DATE="1700000000">A1</A>
        <DT><H3>Nested</H3>
        <DL><p>
            <DT><A HREF="https://nested.example.com/">Nested link</A>
        </DL><p>
    </DL><p>
    <DT><H3>Folder B</H3>
    <DL><p>
        <DT><A HREF="https://b1.example.com/">B1</A>
    </DL><p>
</DL><p>
`;

describe("parseNetscapeHtml", () => {
  it("يحلّل بنية متداخلة (مجلدات داخل مجلدات) بشكل صحيح", () => {
    const nodes = parseNetscapeHtml(SAMPLE_HTML);
    expect(nodes).toHaveLength(3); // رابط جذري + مجلدان
    expect(nodes[0]).toMatchObject({ type: "bookmark", title: "Top level", url: "https://top.example.com/" });
    expect(nodes[1]).toMatchObject({ type: "folder", title: "Folder A" });
    expect(nodes[1].children).toHaveLength(2); // إشارة + مجلد متداخل
    expect(nodes[1].children[1].children).toEqual([
      { type: "bookmark", title: "Nested link", url: "https://nested.example.com/" },
    ]);
  });

  it("يستخرج ADD_DATE ويحوّله من ثوانٍ لمللي ثانية", () => {
    const nodes = parseNetscapeHtml(SAMPLE_HTML);
    const a1 = nodes[1].children[0];
    expect(a1.addedAt).toBe(1700000000 * 1000);
  });

  it("يتجاهل ADD_DATE غير الصالح بصمت (لا يضيف الحقل)", () => {
    const html = `<DL><p><DT><A HREF="https://x.com/" ADD_DATE="not-a-number">X</A></DL><p>`;
    const nodes = parseNetscapeHtml(html);
    expect(nodes[0]).not.toHaveProperty("addedAt");
  });

  it("يستخرج سمة ICON كـ faviconUrl فقط إن كانت data:image/ صالحة", () => {
    const html = `<DL><p><DT><A HREF="https://x.com/" ICON="data:image/png;base64,iVBORw0KGgo=">X</A></DL><p>`;
    const nodes = parseNetscapeHtml(html);
    expect(nodes[0].faviconUrl).toBe("data:image/png;base64,iVBORw0KGgo=");
  });

  it("لا يستخرج أي HTML مضمَّن داخل عنوان الإشارة كنص خام (.textContent فقط، لا innerHTML)", () => {
    const html = `<DL><p><DT><A HREF="https://x.com/">Top <b>bold</b> &amp; "quoted"</A></DL><p>`;
    const nodes = parseNetscapeHtml(html);
    expect(nodes[0].title).toBe('Top bold & "quoted"');
  });

  it("رابط javascript: يمر عبر هذه الطبقة كما هو دون فلترة (التحقق الأمني مسؤولية toInternalCollections اللاحقة، لا هذا المحلّل)", () => {
    const html = `<DL><p><DT><A HREF="javascript:alert(1)">XSS attempt</A></DL><p>`;
    const nodes = parseNetscapeHtml(html);
    expect(nodes[0].url).toBe("javascript:alert(1)");
  });

  it("يُرجع مصفوفة فارغة لملف بلا أي DL (تنسيق غير متوقَّع)", () => {
    expect(parseNetscapeHtml("<html><body>لا شيء هنا</body></html>")).toEqual([]);
  });

  it("يتجاهل عناصر <p> الطارئة بين <dt> بأمان (سمة الصيغة القديمة غير المنضبطة)", () => {
    const html = `<DL><p><p><DT><A HREF="https://x.com/">X</A><p></DL><p>`;
    const nodes = parseNetscapeHtml(html);
    expect(nodes).toHaveLength(1);
  });
});

describe("flattenToCollections", () => {
  it("يحوّل كل مجلد يحوي إشارة مباشرة واحدة على الأقل لمجموعة مستقلة", () => {
    const nodes = parseNetscapeHtml(SAMPLE_HTML);
    const collections = flattenToCollections(nodes, "الجذر");

    const names = collections.map((c) => c.name).sort();
    expect(names).toEqual(["Folder A", "Folder B", "Nested", "الجذر"].sort());
  });

  it("يستخدم rootName للإشارات المباشرة خارج أي مجلد", () => {
    const nodes = parseNetscapeHtml(SAMPLE_HTML);
    const collections = flattenToCollections(nodes, "استيراد بلا اسم");
    const root = collections.find((c) => c.name === "استيراد بلا اسم");
    expect(root.items).toEqual([{ url: "https://top.example.com/", title: "Top level" }]);
  });

  it("مجلد فارغ تمامًا (بلا إشارات مباشرة ولا فرعية) لا يُنتج أي مجموعة", () => {
    const html = `<DL><p><DT><H3>فارغ</H3><DL><p></DL><p></DL><p>`;
    const collections = flattenToCollections(parseNetscapeHtml(html), "جذر");
    expect(collections).toHaveLength(0);
  });
});

describe("serializeToNetscapeHtml", () => {
  it("يُفلت (escape) الأحرف الخاصة في العنوان والرابط لمنع حقن HTML", () => {
    const html = serializeToNetscapeHtml([
      { name: "تصنيف", items: [{ url: "https://x.com/?a=1&b=2", title: '<script>alert("x")</script>' }] },
    ]);
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("https://x.com/?a=1&amp;b=2");
  });

  it("ينتج ملفًا يُعاد تحليله بنجاح (دورة كاملة: تصدير ثم استيراد)", () => {
    const original = [
      { name: "تصنيف أول", items: [{ url: "https://a.com/", title: "أ" }] },
      { name: "تصنيف ثانٍ", items: [{ url: "https://b.com/", title: "ب" }, { url: "https://c.com/", title: "ج" }] },
    ];
    const html = serializeToNetscapeHtml(original);
    const reparsed = flattenToCollections(parseNetscapeHtml(html), "جذر");

    expect(reparsed).toHaveLength(2);
    const byName = Object.fromEntries(reparsed.map((c) => [c.name, c]));
    // serializeToNetscapeHtml تضيف ADD_DATE دائمًا (بقيمة افتراضية وقت
    // التصدير إن لم يُمرَّر item.createdAt)، فتظهر بعد إعادة التحليل كحقل
    // addedAt — سلوك صحيح متعمَّد، نتحقق من الحقول الجوهرية فقط هنا.
    expect(byName["تصنيف أول"].items).toMatchObject([{ url: "https://a.com/", title: "أ" }]);
    expect(byName["تصنيف ثانٍ"].items).toHaveLength(2);
  });

  it("مصفوفة تصنيفات فارغة تُنتج ملفًا صالحًا بنيويًا بلا أي إشارات", () => {
    const html = serializeToNetscapeHtml([]);
    expect(parseNetscapeHtml(html)).toEqual([]);
    expect(html).toContain("NETSCAPE-Bookmark-file-1");
  });
});

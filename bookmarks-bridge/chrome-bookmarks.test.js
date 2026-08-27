import { describe, it, expect, beforeEach } from "vitest";
import "../shared/dedup.js"; // يُلحق globalThis.KeepitDedup — يعتمد عليه exportCollectionToBookmarks مباشرة
import {
  readFoldersForPicker,
  readNormalizedCollectionsFromFolder,
  getOrCreateExportRootFolder,
  exportCollectionToBookmarks,
} from "./chrome-bookmarks.js";

/**
 * محاكاة مبسَّطة (لكن واقعية بنيويًا) لـ chrome.bookmarks في الذاكرة —
 * تدعم فقط ما تستخدمه chrome-bookmarks.js فعليًا: getTree، getSubTree،
 * create. بنية الشجرة تطابق شجرة Chrome الحقيقية: عقدة جذر غير مرئية
 * (id="0")، أول أبنائها شريط الإشارات المرجعية (id="1").
 */
function installChromeBookmarksMock() {
  let nextId = 100;
  const nodes = new Map();

  function makeFolder(id, title, parentId) {
    const node = { id, title, children: [] };
    nodes.set(id, node);
    if (parentId) nodes.get(parentId).children.push(node);
    return node;
  }
  function makeBookmark(id, title, url, parentId) {
    const node = { id, title, url };
    nodes.set(id, node);
    nodes.get(parentId).children.push(node);
    return node;
  }

  const root = makeFolder("0", "", null);
  const bookmarksBar = makeFolder("1", "Bookmarks Bar", "0");
  makeFolder("2", "Other Bookmarks", "0");

  /** ينسخ عقدة وأبناءها بعمق (chrome.bookmarks الحقيقية تُرجع نسخًا لا مراجع). */
  function deepClone(node) {
    const clone = { id: node.id, title: node.title };
    if (node.url) clone.url = node.url;
    if (node.children) clone.children = node.children.map(deepClone);
    return clone;
  }

  globalThis.chrome = /** @type {any} */ ({
    bookmarks: {
      getTree: async () => [deepClone(root)],
      getSubTree: async (id) => {
        const node = nodes.get(id);
        return node ? [deepClone(node)] : [];
      },
      create: async ({ parentId, title, url }) => {
        const id = String(nextId++);
        if (url) return deepClone(makeBookmark(id, title, url, parentId));
        return deepClone(makeFolder(id, title, parentId));
      },
    },
  });

  return { bookmarksBar, makeFolder, makeBookmark };
}

describe("bookmarks-bridge/chrome-bookmarks", () => {
  /** @type {ReturnType<typeof installChromeBookmarksMock>} */
  let mock;
  beforeEach(() => {
    mock = installChromeBookmarksMock();
  });

  describe("readFoldersForPicker", () => {
    it("يستبعد المجلدات الفارغة تمامًا (بلا إشارات في أي عمق)", async () => {
      mock.makeFolder("f1", "فارغ تمامًا", "1");
      const folders = await readFoldersForPicker();
      expect(folders.find((f) => f.id === "f1")).toBeUndefined();
    });

    it("يحسب العدد المباشر والإجمالي بشكل صحيح لمجلد فيه مجلد فرعي", async () => {
      const f1 = mock.makeFolder("f1", "أدوات", "1");
      mock.makeBookmark("b1", "A", "https://a.com/", "f1");
      mock.makeBookmark("b2", "B", "https://b.com/", "f1");
      const f2 = mock.makeFolder("f2", "فرعي", "f1");
      mock.makeBookmark("b3", "C", "https://c.com/", "f2");

      const folders = await readFoldersForPicker();
      const parent = folders.find((f) => f.id === "f1");
      const child = folders.find((f) => f.id === "f2");
      expect(parent).toMatchObject({ directCount: 2, totalCount: 3 });
      expect(child).toMatchObject({ directCount: 1, totalCount: 1 });
    });

    it("لا يُدرج العقدة الجذرية غير المرئية (id=0) في القائمة أبدًا", async () => {
      mock.makeBookmark("b1", "X", "https://x.com/", "1");
      const folders = await readFoldersForPicker();
      expect(folders.find((f) => f.id === "0")).toBeUndefined();
    });

    it("يرتّب النتائج بترتيب الشجرة الطبيعي (الأب قبل أبنائه، لا العكس)", async () => {
      const parent = mock.makeFolder("parent", "أب", "1");
      mock.makeBookmark("b1", "X", "https://x.com/", "parent");
      const child = mock.makeFolder("child", "ابن", "parent");
      mock.makeBookmark("b2", "Y", "https://y.com/", "child");

      const folders = await readFoldersForPicker();
      const parentIndex = folders.findIndex((f) => f.id === "parent");
      const childIndex = folders.findIndex((f) => f.id === "child");
      expect(parentIndex).toBeLessThan(childIndex);
    });
  });

  describe("readNormalizedCollectionsFromFolder", () => {
    it("يحوّل مجلدًا بإشارات مباشرة لمجموعة واحدة", async () => {
      const f1 = mock.makeFolder("f1", "أدوات", "1");
      mock.makeBookmark("b1", "A", "https://a.com/", "f1");
      mock.makeBookmark("b2", "B", "https://b.com/", "f1");

      const collections = await readNormalizedCollectionsFromFolder("f1");
      expect(collections).toHaveLength(1);
      expect(collections[0].name).toBe("أدوات");
      expect(collections[0].items).toHaveLength(2);
    });

    it("يُسطِّح مجلدات متداخلة لمجموعات منفصلة (Keepit لا يدعم تصنيفات متداخلة)", async () => {
      const f1 = mock.makeFolder("f1", "أب", "1");
      mock.makeBookmark("b1", "A", "https://a.com/", "f1");
      mock.makeFolder("f2", "ابن", "f1");
      mock.makeBookmark("b2", "B", "https://b.com/", "f2");

      const collections = await readNormalizedCollectionsFromFolder("f1");
      const names = collections.map((c) => c.name).sort();
      expect(names).toEqual(["أب", "ابن"].sort());
    });

    it("مجلد فرعي فارغ (بلا إشارات مباشرة) لا يُصبح مجموعة", async () => {
      const f1 = mock.makeFolder("f1", "أب", "1");
      mock.makeBookmark("b1", "A", "https://a.com/", "f1");
      mock.makeFolder("f2", "فرعي فارغ", "f1");

      const collections = await readNormalizedCollectionsFromFolder("f1");
      expect(collections.map((c) => c.name)).toEqual(["أب"]);
    });

    it("يُسند ألوانًا متغايرة (دائرية) للمجموعات الناتجة", async () => {
      const f1 = mock.makeFolder("f1", "أب", "1");
      mock.makeBookmark("b1", "A", "https://a.com/", "f1");
      const f2 = mock.makeFolder("f2", "ابن1", "f1");
      mock.makeBookmark("b2", "B", "https://b.com/", "f2");
      const f3 = mock.makeFolder("f3", "ابن2", "f1");
      mock.makeBookmark("b3", "C", "https://c.com/", "f3");

      const collections = await readNormalizedCollectionsFromFolder("f1");
      const colors = collections.map((c) => c.color);
      expect(new Set(colors).size).toBeGreaterThan(1); // ليست كلها نفس اللون
    });

    it("مجلد غير موجود يُرجع مصفوفة فارغة بلا رمي خطأ", async () => {
      expect(await readNormalizedCollectionsFromFolder("لا-وجود")).toEqual([]);
    });
  });

  describe("getOrCreateExportRootFolder", () => {
    it("ينشئ مجلد Keepit تحت شريط الإشارات المرجعية إن لم يكن موجودًا", async () => {
      const id = await getOrCreateExportRootFolder();
      const tree = await chrome.bookmarks.getSubTree("1");
      const created = tree[0].children.find((c) => c.id === id);
      expect(created.title).toBe("Keepit");
    });

    it("idempotent: استدعاء ثانٍ يُعيد نفس المعرّف بدل إنشاء مجلد مكرَّر", async () => {
      const id1 = await getOrCreateExportRootFolder();
      const id2 = await getOrCreateExportRootFolder();
      expect(id1).toBe(id2);

      const tree = await chrome.bookmarks.getSubTree("1");
      const keepitFolders = tree[0].children.filter((c) => c.title === "Keepit");
      expect(keepitFolders).toHaveLength(1); // لا تكرار
    });

    it("يجد مجلد Keepit موجودًا مسبقًا (أُنشئ يدويًا مثلًا) بدل تجاهله", async () => {
      const manual = mock.makeFolder("manual-keepit", "Keepit", "1");
      const id = await getOrCreateExportRootFolder();
      expect(id).toBe("manual-keepit");
    });
  });

  describe("exportCollectionToBookmarks", () => {
    it("ينشئ مجلدًا فرعيًا جديدًا بإشارات المجموعة كاملة أول مرة", async () => {
      const rootId = await getOrCreateExportRootFolder();
      const result = await exportCollectionToBookmarks(rootId, {
        name: "تصنيفي",
        items: [
          { url: "https://a.com/", title: "A" },
          { url: "https://b.com/", title: "B" },
        ],
      });
      expect(result).toEqual({ created: 2, skipped: 0 });
    });

    it("idempotent: تصدير نفس المجموعة مرة ثانية لا يُكرِّر أي إشارة مرجعية", async () => {
      const rootId = await getOrCreateExportRootFolder();
      const items = [{ url: "https://a.com/", title: "A" }];
      await exportCollectionToBookmarks(rootId, { name: "تصنيفي", items });

      const secondResult = await exportCollectionToBookmarks(rootId, { name: "تصنيفي", items });
      expect(secondResult).toEqual({ created: 0, skipped: 1 });
    });

    it("يتخطّى رابطًا موجودًا أصلًا بعد التطبيع (www./شرطة مائلة زائدة) بدل تكراره", async () => {
      const rootId = await getOrCreateExportRootFolder();
      await exportCollectionToBookmarks(rootId, {
        name: "تصنيفي",
        items: [{ url: "https://example.com/", title: "أصلي" }],
      });
      const result = await exportCollectionToBookmarks(rootId, {
        name: "تصنيفي",
        items: [{ url: "https://www.example.com/#ignored", title: "بصيغة مختلفة لنفس الموقع" }],
      });
      expect(result).toEqual({ created: 0, skipped: 1 });
    });

    it("يُعيد استخدام نفس المجلد الفرعي عبر تصديرات متعددة (لا مجلدات مكرَّرة بنفس الاسم)", async () => {
      const rootId = await getOrCreateExportRootFolder();
      await exportCollectionToBookmarks(rootId, { name: "تصنيفي", items: [{ url: "https://a.com/", title: "A" }] });
      await exportCollectionToBookmarks(rootId, { name: "تصنيفي", items: [{ url: "https://b.com/", title: "B" }] });

      const tree = await chrome.bookmarks.getSubTree(rootId);
      const subFolders = tree[0].children.filter((c) => c.title === "تصنيفي");
      expect(subFolders).toHaveLength(1);
      expect(subFolders[0].children).toHaveLength(2); // كلا الإشارتين داخل نفس المجلد الفرعي الواحد
    });

    it("مجموعة بلا عناصر تُنشئ المجلد الفرعي فقط بلا أي إشارات", async () => {
      const rootId = await getOrCreateExportRootFolder();
      const result = await exportCollectionToBookmarks(rootId, { name: "فارغة", items: [] });
      expect(result).toEqual({ created: 0, skipped: 0 });
    });
  });
});

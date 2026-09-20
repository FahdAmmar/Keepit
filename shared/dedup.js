/**
 * shared/dedup.js
 * ---------------------------------------------------------------------------
 * طبقة "منع التكرار" المشتركة بين popup وoptions.
 *
 * توفّر دوال تطبيع (normalization) ومقارنة تمنع:
 *   1) تكرار أسماء المجموعات (case-insensitive + تطبيع عربي).
 *   2) تكرار أسماء المواقع داخل المجموعة الواحدة.
 *   3) تكرار الروابط داخل المجموعة الواحدة (بعد تطبيع الرابط: إزالة www.
 *      والـ fragment ومعاملات التتبّع وترتيب بقية المعاملات).
 *
 * تُحمَّل قبل main.js فتتوفّر على globalThis.KeepitDedup.
 * لا تعتمد على أي متغيرات من الـ bundle، فقط Web APIs.
 * ---------------------------------------------------------------------------
 */
(function () {
  "use strict";

  var ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08E1\u08E3-\u08FF]/g;
  var TATWEEL = /\u0640/g;

  /**
   * تطبيع اسم/عنوان للمقارنة فقط (لا يُستخدم للتخزين).
   * - تنظيف المحارف التحكمية وطي المسافات (مثل دوال ie/le في الـ bundle).
   * - toLowerCase للاتساق في الحالة.
   * - تطبيع الحروف العربية: إزالة التشكيل، توحيد الألف، الياء، التاء المربوطة.
   * - تطبيع NFKC للحروف اللاتينية المركّبة.
   */
  function normalizeName(input) {
    if (input == null) return "";
    var s = String(input)
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!s) return "";
    return s
      .normalize("NFKC")
      .toLowerCase()
      .replace(ARABIC_DIACRITICS, "")
      .replace(TATWEEL, "")
      .replace(/[\u0623\u0625\u0622]/g, "\u0627")   // أ إ آ → ا
      .replace(/\u0649/g, "\u064A")                   // ى → ي
      .replace(/\u0629/g, "\u0647")                   // ة → ه
      .replace(/\u0624/g, "\u0648")                   // ؤ → و
      .replace(/\u0626/g, "\u064A");                  // ئ → ي
  }

  /** بادئات التتبّع (تُحذف بأي لاحقة) ومفاتيح تتبّع تُحذف كلمةً بكلمة. */
  var TRACKING_PREFIX = /^(utm_|fbclid|gclid|dclid|msclkid|mc_eid|mc_cid|yclid|igshid|_ga\.|_gl\.)/i;
  var TRACKING_EXACT = /^(ref|source|cmp|campaign|referral|ref_source)$/i;
  function isTrackingParam(key) {
    return TRACKING_PREFIX.test(key) || TRACKING_EXACT.test(key);
  }

  /**
   * تطبيع رابط للمقارنة. تُعاد السلسلة المطابَقة أو null عند الفشل.
   * - hostname يُصغَّر ويُزال www.
   * - يُزال الـ fragment.
   * - يُزال trailing slash من pathname (مع إبقاء "/" للجذر).
   * - تُحذف معاملات التتبّع ويُرتّب الباقي أبجديًا.
   * - scheme يُصغَّر تلقائيًا من new URL().
   */
  function normalizeUrl(input) {
    if (input == null) return null;
    var s = String(input).trim();
    if (!s) return null;
    var u;
    try { u = new URL(s); } catch (e) { return null; }
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;

    var host = u.hostname.toLowerCase().replace(/^www\./, "");
    var path = u.pathname || "/";
    if (path.length > 1 && path.charCodeAt(path.length - 1) === 47) {
      path = path.replace(/\/+$/, "") || "/";
    }

    var params = [];
    u.searchParams.forEach(function (val, key) {
      if (!isTrackingParam(key)) params.push([key, val]);
    });
    params.sort(function (a, b) {
      return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
    });

    var query = "";
    if (params.length) {
      query = "?" + params.map(function (p) {
        return encodeURIComponent(p[0]) + "=" + encodeURIComponent(p[1]);
      }).join("&");
    }

    return (u.protocol === "https:" ? "https://" : "http://") + host + path + query;
  }

  /**
   * يبحث عن مجموعة بنفس الاسم المطوّع.
   * @param {Array} collections - مصفوفة المجموعات
   * @param {string} name - الاسم المراد فحصه
   * @param {string=} excludeId - معرّف مجموعة لاستبعادها (للاستخدام عند إعادة التسمية)
   * @returns {object|null} المجموعة المتعارِفة أو null
   */
  function findDuplicateCollection(collections, name, excludeId) {
    var key = normalizeName(name);
    if (!key) return null;
    if (!Array.isArray(collections)) return null;
    for (var i = 0; i < collisions(collections, key, excludeId).length; i++) return collisions(collections, key, excludeId)[i];
    return null;
  }
  // helper داخلي
  function collisions(collections, key, excludeId) {
    var out = [];
    for (var i = 0; i < collections.length; i++) {
      var c = collections[i];
      if (excludeId && c.id === excludeId) continue;
      if (normalizeName(c.name) === key) out.push(c);
    }
    return out;
  }

  /**
   * يبحث عن عنصر مكرّر داخل مجموعة بحسب الرابط أو العنوان (بعد التطبيع).
   * @param {Array} items - عناصر المجموعة
   * @param {string} url - رابط العنصر الجديد
   * @param {string} title - عنوان العنصر الجديد
   * @param {string=} excludeId - معرّف عنصر لاستبعاده (عند التحرير)
   * @returns {{url?:object, title?:object}} كائن يحوي العنصر المتعارف أو فارغ
   */
  function findDuplicateItem(items, url, title, excludeId) {
    var result = {};
    if (!Array.isArray(items)) return result;
    var urlKey = normalizeUrl(url);
    var titleKey = normalizeName(title);
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (excludeId && it.id === excludeId) continue;
      if (urlKey && normalizeUrl(it.url) === urlKey && !result.url) result.url = it;
      if (titleKey && normalizeName(it.title) === titleKey && !result.title) result.title = it;
      if (result.url && result.title) break;
    }
    return result;
  }

  /**
   * يدمج مصفوفتي مجموعات بحيث لا يتكرّر أي اسم مجموعة.
   * عند تعارض اسم، تُدمج عناصر المجموعة الواردة في المجموعة الموجودة
   * (مع منع تكرار العناصر بحسب الرابط ثم العنوان).
   * @param {Array} existing - المجموعات الحالية
   * @param {Array} incoming - المجموعات الواردة (مثل المستوردة)
   * @returns {{merged:Array, skippedItems:number, skippedCollections:number}}
   */
  function mergeCollections(existing, incoming) {
    var byKey = {};
    var orderedKeys = [];
    var skippedItems = 0;
    var skippedCollections = 0;

    function ingest(col, isExisting) {
      var key = normalizeName(col.name);
      if (!key) { skippedCollections += 1; return null; }
      if (byKey[key]) {
        // ادمج في الموجودة
        var target = byKey[key];
        if (!isExisting) skippedCollections += 1;
        col.items.forEach(function (it) {
          var dup = findDuplicateItem(target.items, it.url, it.title);
          if (dup.url || dup.title) { skippedItems += 1; return; }
          target.items.push(it);
        });
        target.updatedAt = Math.max(target.updatedAt || 0, col.updatedAt || 0);
        // أبقِ pinned=true إن كانت أي منهما مثبّتة
        target.pinned = target.pinned || col.pinned;
        return target;
      }
      // مجموعة جديدة: انسخها مع عناصرها بعد تنقية تكرارها الداخلي
      var cleanItems = [];
      col.items.forEach(function (it) {
        var dup = findDuplicateItem(cleanItems, it.url, it.title);
        if (dup.url || dup.title) { skippedItems += 1; return; }
        cleanItems.push(it);
      });
      var clone = {
        id: col.id,
        name: col.name,
        color: col.color,
        pinned: !!col.pinned,
        createdAt: col.createdAt,
        updatedAt: col.updatedAt,
        items: cleanItems
      };
      byKey[key] = clone;
      orderedKeys.push(key);
      return clone;
    }

    (existing || []).forEach(function (c) { ingest(c, true); });
    (incoming || []).forEach(function (c) { ingest(c, false); });

    var merged = orderedKeys.map(function (k) { return byKey[k]; });
    return { merged: merged, skippedItems: skippedItems, skippedCollections: skippedCollections };
  }

  /**
   * يبحث عن أول مجموعة (غير المستبعدة) تحوي عنصرًا بنفس الرابط (بعد
   * التطبيع)، بغض النظر عن أي مجموعة ينتمي إليها العنصر أصلًا. على عكس
   * findDuplicateItem أعلاه (يفحص داخل مصفوفة عناصر مجموعة واحدة فقط)،
   * هذه تفحص عبر كل المجموعات — للتنبيه فقط، لا للمنع؛ حفظ نفس الرابط في
   * أكثر من مجموعة اختيار مشروع للمستخدم.
   * @param {Array} collections - كل المجموعات
   * @param {string} url - الرابط المراد فحصه
   * @param {string=} excludeCollectionId - معرّف مجموعة يُستبعَد من الفحص
   *   (عادة المجموعة الهدف نفسها، التي يُغطّيها findDuplicateItem أصلًا)
   * @returns {{collection: object, item: object}|null}
   */
  function findItemAcrossCollections(collections, url, excludeCollectionId) {
    var key = normalizeUrl(url);
    if (!key) return null;
    if (!Array.isArray(collections)) return null;
    for (var i = 0; i < collections.length; i++) {
      var c = collections[i];
      if (excludeCollectionId && c.id === excludeCollectionId) continue;
      if (!Array.isArray(c.items)) continue;
      for (var j = 0; j < c.items.length; j++) {
        if (normalizeUrl(c.items[j].url) === key) return { collection: c, item: c.items[j] };
      }
    }
    return null;
  }

  globalThis.KeepitDedup = {
    normalizeName: normalizeName,
    normalizeUrl: normalizeUrl,
    findDuplicateCollection: findDuplicateCollection,
    findDuplicateItem: findDuplicateItem,
    findItemAcrossCollections: findItemAcrossCollections,
    mergeCollections: mergeCollections
  };

  /**
   * ترحيل لمرة واحدة: ينظّف البيانات الحالية من أي تكرار (أسماء مجموعات
   * مكرّرة، أو عناصر مكرّرة بالرابط/العنوان داخل كل مجموعة).
   * يحرسه علم keepit:dedup:v1 في chrome.storage.local.
   * يعمل بشكل غير متزامن (fire-and-forget) ولا يحجب الواجهة.
   */
  var STATE_KEY = "keepit:state";
  var FLAG_KEY = "keepit:dedup:v1";

  function runMigration() {
    try {
      if (!globalThis.chrome || !chrome.storage || !chrome.storage.local) return;
      chrome.storage.local.get([FLAG_KEY, STATE_KEY], /** @param {{[k: string]: unknown}} items */ function (items) {
        try {
          if (items && items[FLAG_KEY]) return; // تم الترحيل مسبقًا
          var state = /** @type {KeepitState | null | undefined} */ (items && items[STATE_KEY]);
          if (!state || !Array.isArray(state.collections) || state.collections.length === 0) {
            // لا توجد بيانات بعد؛ نضع العلم لنتخطّي المحاولة مستقبلًا.
            chrome.storage.local.set({ [FLAG_KEY]: 1 });
            return;
          }
          var before = state.collections.length;
          var beforeItems = state.collections.reduce(function (n, c) { return n + (Array.isArray(c.items) ? c.items.length : 0); }, 0);
          var res = mergeCollections([], state.collections);
          var after = res.merged.length;
          var afterItems = res.merged.reduce(function (n, c) { return n + (Array.isArray(c.items) ? c.items.length : 0); }, 0);
          if (after === before && afterItems === beforeItems) {
            // لا تغيير؛ اكتفِ بوضع العلم.
            chrome.storage.local.set({ [FLAG_KEY]: 1 });
            return;
          }
          const safeState = state; // راجع تعليق أسفل: التضييق (narrowing) لا يبقى داخل callback متداخلة
          state.collections = res.merged;
          if (state.lastUsedCollectionId && !res.merged.some(function (c) { return c.id === safeState.lastUsedCollectionId; })) {
            state.lastUsedCollectionId = res.merged[0] ? res.merged[0].id : null;
          }
          chrome.storage.local.set({ [STATE_KEY]: state, [FLAG_KEY]: 1 });
        } catch (e) {
          // فشل صامت: سيعيد المحاولة في المرة القادمة (العلم لم يُضبط).
        }
      });
    } catch (e) {
      // تجاهل — الترحيل اختياري ولا يكسر التشغيل.
    }
  }

  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runMigration, { once: true });
  } else {
    runMigration();
  }
})();

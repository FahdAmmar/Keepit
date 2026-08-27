import { describe, it, expect } from "vitest";
import { isSafeFaviconUrl } from "./safe-favicon.js";

describe("isSafeFaviconUrl", () => {
  it.each(["https://example.com/favicon.ico", "http://example.com/icon.png", "data:image/png;base64,iVBORw0KGgo="])(
    "يقبل مصدرًا آمنًا: %s",
    (url) => {
      expect(isSafeFaviconUrl(url)).toBe(true);
    },
  );

  it.each([
    ["javascript:alert(1)", "بروتوكول تنفيذ كود"],
    ["data:text/html,<script>alert(1)</script>", "data URI بصيغة غير صورة"],
    ["data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=", "SVG مضمَّن — يُستبعَد صراحةً رغم أمانه كمصدر img فعليًا"],
    ["file:///etc/passwd", "بروتوكول ملف محلي"],
    ["ftp://example.com/x.png", "بروتوكول غير مدعوم"],
    ["", "سلسلة فارغة"],
    [null, "null"],
    [undefined, "undefined"],
    [42, "رقم بدل نص"],
    ["ليس رابطًا إطلاقًا", "نص عشوائي غير صالح كرابط"],
  ])("يرفض: %s (%s)", (input) => {
    expect(isSafeFaviconUrl(input)).toBe(false);
  });
});

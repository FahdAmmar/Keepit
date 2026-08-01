/**
 * search-enhance/index.js
 * ---------------------------------------------------------------------------
 * نقطة الدخول المُحمَّلة في كل من popup/index.html وoptions/index.html —
 * ملف واحد مشترك بين الصفحتين، لأن بنية حقل البحث فيهما متطابقة تقريبًا
 * (راجع الشرح الكامل في mount.js).
 */
import { mountSearchEnhance } from "./mount.js";

mountSearchEnhance();

#!/usr/bin/env node
/**
 * scripts/validate-manifest.js
 * ---------------------------------------------------------------------------
 * تحقّق آلي من manifest.json يتجاوز "هل هو JSON صالح؟" (ذلك تتحقق منه أي
 * أداة) إلى: هل كل مسار ملف يشير إليه (أيقونات، الصفحات، service worker)
 * موجود فعليًا على القرص؟ وهل الصفحات نفسها (popup/options) تشير بدورها
 * لملفات JS/CSS موجودة فعليًا؟ هذا بالضبط نوع الخطأ (مسار مكتوب خطأ، ملف
 * نُقل أو حُذف بالخطأ) الذي لا يظهر إلا عند التحميل الفعلي في Chrome —
 * هذا السكربت يكتشفه في ثوانٍ ضمن CI بدل انتظار تقرير مستخدم.
 *
 * لا اعتماد على أي حزمة خارجية عمدًا — Node.js القياسي فقط، حتى يبقى هذا
 * السكربت نفسه بسيطًا وسريع الفحص بصريًا عند الحاجة.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** @type {string[]} */
const errors = [];
/** @type {string[]} */
const warnings = [];

function readJson(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    errors.push(`الملف غير موجود: ${relPath}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(full, "utf-8"));
  } catch (err) {
    errors.push(`${relPath} ليس JSON صالحًا: ${err.message}`);
    return null;
  }
}

function checkFileExists(relPath, context) {
  if (!existsSync(join(ROOT, relPath))) {
    errors.push(`${context}: الملف المرجعي غير موجود على القرص: ${relPath}`);
    return false;
  }
  return true;
}

/**
 * يتتبّع كل مسارات src=/href= المحلية (لا http(s)://) داخل ملف HTML، ويتحقق
 * من وجودها فعليًا — نسبيًا لمجلد ذلك الملف نفسه.
 * @param {string} htmlRelPath
 */
function checkHtmlReferences(htmlRelPath) {
  const full = join(ROOT, htmlRelPath);
  if (!existsSync(full)) return; // خطأ منفصل مُسجَّل مسبقًا من المستدعي
  const html = readFileSync(full, "utf-8");
  const htmlDir = dirname(htmlRelPath);

  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((ref) => !/^(https?:)?\/\//.test(ref) && !ref.startsWith("data:"));

  for (const ref of refs) {
    const relFromRoot = join(htmlDir, ref).split("?")[0]; // إسقاط أي query string
    checkFileExists(relFromRoot, `${htmlRelPath} → ${ref}`);
  }
}

// ---------------------------------------------------------------------------

const manifest = readJson("manifest.json");
if (manifest) {
  if (manifest.manifest_version !== 3) {
    errors.push(`manifest_version يجب أن يكون 3 (القيمة الحالية: ${manifest.manifest_version})`);
  }

  for (const field of ["name", "version", "description", "icons", "action", "background"]) {
    if (!(field in manifest)) errors.push(`حقل مطلوب مفقود في manifest.json: "${field}"`);
  }

  if (manifest.version && !/^\d+(\.\d+){0,3}$/.test(manifest.version)) {
    errors.push(`صيغة version غير صالحة لمتجر Chrome: "${manifest.version}" (يجب أرقام مفصولة بنقاط فقط)`);
  }

  const pkg = readJson("package.json");
  if (pkg && manifest.version && pkg.version !== manifest.version) {
    errors.push(
      `عدم تطابق الإصدار: manifest.json="${manifest.version}" لكن package.json="${pkg.version}" — حدّث كلاهما معًا دائمًا`,
    );
  }

  if (manifest.icons) {
    for (const [size, path] of Object.entries(manifest.icons)) {
      checkFileExists(/** @type {string} */ (path), `manifest.json → icons.${size}`);
    }
  }

  if (manifest.action?.default_popup) {
    if (checkFileExists(manifest.action.default_popup, "manifest.json → action.default_popup")) {
      checkHtmlReferences(manifest.action.default_popup);
    }
  }
  if (manifest.action?.default_icon) {
    for (const [size, path] of Object.entries(manifest.action.default_icon)) {
      checkFileExists(/** @type {string} */ (path), `manifest.json → action.default_icon.${size}`);
    }
  }

  if (manifest.options_ui?.page) {
    if (checkFileExists(manifest.options_ui.page, "manifest.json → options_ui.page")) {
      checkHtmlReferences(manifest.options_ui.page);
    }
  }

  if (manifest.background?.service_worker) {
    checkFileExists(manifest.background.service_worker, "manifest.json → background.service_worker");
  }

  if (Array.isArray(manifest.host_permissions) && manifest.host_permissions.length > 0) {
    warnings.push(
      `host_permissions غير فارغة (${JSON.stringify(manifest.host_permissions)}) — تحقّق من كونها ضرورية فعليًا (مبدأ أقل صلاحية ممكنة)`,
    );
  }

  const csp = manifest.content_security_policy?.extension_pages ?? "";
  if (csp.includes("unsafe-eval") || csp.includes("unsafe-inline")) {
    errors.push(`content_security_policy.extension_pages يحتوي unsafe-eval أو unsafe-inline — يخالف مبدأ أمان المشروع`);
  }
}

// ---------------------------------------------------------------------------

for (const w of warnings) console.warn(`⚠️  ${w}`);

if (errors.length > 0) {
  console.error(`\n❌ فشل التحقق (${errors.length} خطأ):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log(`✅ manifest.json صالح (${warnings.length} تحذير${warnings.length === 1 ? "" : "ات"})`);

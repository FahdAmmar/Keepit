<div align="center">

<img src="icons/icon128.png" width="96" height="96" alt="Keepit logo" />

# Keepit

**Save your favorite sites into organized, color-coded collections — instantly, with no account and no external server.**

[![Manifest](https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![Version](https://img.shields.io/badge/version-1.6.0-6f5bef?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-22a06b?style=for-the-badge)](#-license)

[![Chrome](https://img.shields.io/badge/Chrome-Supported-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](#-browser-compatibility)
[![Edge](https://img.shields.io/badge/Edge-Supported-0078D7?style=flat-square&logo=microsoftedge&logoColor=white)](#-browser-compatibility)
[![Brave](https://img.shields.io/badge/Brave-Needs%20setup-FB542B?style=flat-square&logo=brave&logoColor=white)](#-browser-compatibility)
[![Firefox](https://img.shields.io/badge/Firefox-Not%20supported-grey?style=flat-square&logo=firefoxbrowser&logoColor=white)](#-browser-compatibility)

</div>

---

## 📖 Overview

**Keepit** is a browser extension for saving and organizing favorite
websites into **color-coded collections**, instead of relying on the
browser's traditional, unorganized bookmarks. All data is stored
**locally on your own device** — no account, no sign-in, no external
server, and no one but you ever has access to what you've saved.

---

## ✨ Features

### 🗂️ Visual organization
- Color-coded collections (Indigo, Sky, Violet, Emerald, Amber, Rose, Slate) so you can tell categories apart at a glance.
- Pin important collections to the top.
- Add text notes to any saved site.
- Search across everything you've saved — matching **collection names** surfaces the whole collection (with an inline preview of its sites), not just individual sites whose title, URL, or note happens to match.

### ⚡ Save from anywhere, instantly
- **One click** from the popup to save the current tab.
- **Right-click context menu** on any page or link.
- **Instant keyboard shortcut**: `Ctrl+Shift+S` (or `⌘+Shift+S` on macOS).

### 💾 Backup, import & export
- Export all your collections to a single JSON file whenever you want.
- Import a JSON file in two modes: **merge** with what you already have, or a full **replace**.

### 🔄 Two-way local file sync (no cloud required)
- Every change (add / edit / delete) is saved automatically and continuously to a JSON file inside a folder you choose on your own device.
- The same file is checked periodically and pulled back in, so if you open the extension from **another browser** on the same machine pointing at the same folder, your data updates there automatically too — no server or account involved.
- Two safe merge modes: **Merge** (never deletes anything) or **Replace** (also propagates deletions, for anyone who genuinely works from a single browser at a time).

### 🗑️ Trash & instant undo
- Every collection or site you delete — from anywhere, including a deletion that arrives through local sync's **Replace** mode — is kept in a trash for **30 days** before being permanently removed.
- A live **"Undo"** toast appears immediately after you delete something, right in the popup or options page you were using.
- Browse, restore, or permanently delete individual items any time from the trash icon in the options page toolbar. Restoring reuses the same duplicate-detection rules as manual import, so you can never end up with two identical collections or sites by accident.

### 🕰️ Automatic backups (snapshots)
- Keepit periodically takes a full snapshot of all your collections and sites — protecting you from **edits** (renames, color changes, note changes) too, not just deletions like the trash.
- Tiered retention keeps recent snapshots, then thins older ones down to one per day, so history stays useful without growing forever.
- Restore a snapshot with a **safe merge** (adds only what's missing) or a **full replace** (rolls back completely), or just download any snapshot as a JSON file — all from the backups icon in the options page toolbar.

### 🎨 A comfortable experience
- Full light and dark mode support, automatically following your OS preference.
- Bilingual interface (Arabic / English) with full RTL/LTR support.
- Responsive design with no visual flicker when switching language or theme.

### 🔒 Privacy first
- No permission to access websites (`host_permissions` is empty).
- All data lives in `chrome.storage.local` on your device only.
- The local-sync folder handle is stored in the extension's own IndexedDB — never uploaded to any account.

---

## 🧰 Tech Stack

<div align="center">

| Technology | Used for |
|---|---|
| ![Manifest V3](https://img.shields.io/badge/-Manifest%20V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white) | Extension structure and permissions |
| ![Service Worker](https://img.shields.io/badge/-Service%20Worker-F7A400?style=flat-square&logo=googlechrome&logoColor=white) | Background processing (no persistent background page) |
| ![JavaScript](https://img.shields.io/badge/-JavaScript%20(ESM)-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | All application logic (modern ES modules) |
| ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | Popup and options pages |
| ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) | Styling with CSS variables (light/dark, RTL) |
| ![chrome.storage](https://img.shields.io/badge/-chrome.storage.local-4285F4?style=flat-square&logo=googlechrome&logoColor=white) | Storing all collections and sites |
| ![IndexedDB](https://img.shields.io/badge/-IndexedDB-FF9800?style=flat-square&logo=firefoxbrowser&logoColor=white) | Storing the local-sync folder handle |
| ![File System Access API](https://img.shields.io/badge/-File%20System%20Access%20API-34A853?style=flat-square&logo=googlechrome&logoColor=white) | Reading/writing the local sync file |
| ![chrome.alarms](https://img.shields.io/badge/-chrome.alarms-4285F4?style=flat-square&logo=googlechrome&logoColor=white) | Periodic background check for sync changes |
| ![JSON](https://img.shields.io/badge/-JSON-000000?style=flat-square&logo=json&logoColor=white) | Import/export and local-sync file format |

</div>

---

## 🚀 Installation (load unpacked)

1. Download / unzip the extension into a folder on your device.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Turn on **Developer mode** in the top corner.
4. Click **Load unpacked** and select the extension's folder.
5. Pin the Keepit icon to your toolbar for quick access.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Shift + S` (Windows/Linux) | Save the current tab |
| `⌘ + Shift + S` (macOS) | Save the current tab |

> You can change the shortcut from `chrome://extensions/shortcuts`.

---

## 🌐 Browser Compatibility

| Browser | Core features | Local sync |
|---|:---:|:---:|
| ![Chrome](https://img.shields.io/badge/-Chrome-4285F4?style=flat-square&logo=googlechrome&logoColor=white) | ✅ | ✅ |
| ![Edge](https://img.shields.io/badge/-Edge-0078D7?style=flat-square&logo=microsoftedge&logoColor=white) | ✅ | ✅ |
| ![Brave](https://img.shields.io/badge/-Brave-FB542B?style=flat-square&logo=brave&logoColor=white) | ✅ | ⚠️ requires enabling `brave://flags/#file-system-access-api`, and may still not work inside extension pages on some versions |
| ![Opera](https://img.shields.io/badge/-Opera-FF1B2D?style=flat-square&logo=opera&logoColor=white) | ✅ | ✅ (supported by default) |
| ![Firefox](https://img.shields.io/badge/-Firefox-FF7139?style=flat-square&logo=firefoxbrowser&logoColor=white) | ❌ | ❌ |

Core features (saving, organizing, manual import/export) work in any
Manifest V3-compatible browser. **Local sync** specifically requires
browser support for the File System Access API.

---

## 📁 Project Structure

```
keepit/
├── manifest.json                 # Extension configuration and permissions
├── background/
│   ├── service-worker.js         # Entry point (loads index.js + every additive feature)
│   ├── index.js                  # Core application logic (background)
│   ├── local-sync-sw/            # Sync feature logic inside the service worker
│   ├── trash-sw/                 # Trash feature logic inside the service worker
│   └── snapshots-sw/             # Automatic backups logic inside the service worker
├── popup/                        # Popup window (quick save)
├── options/                      # Options page (manage collections + sync/trash/backups panels)
├── offscreen/                    # Hidden document for file operations
├── local-sync/                   # Local sync logic (read/write/merge)
├── trash/                        # Trash logic (store, i18n, live undo toast)
├── snapshots/                    # Automatic backups logic (store, i18n)
├── search-enhance/               # Search-by-collection-name logic + UI (shared by popup & options)
├── shared/                       # Shared utilities (theme, locale, de-duplication, dialogs, i18n engine)
└── icons/                        # Extension icons
```

---

## 🧩 Additional Technical Documentation

For the full details on how local sync works (the push and pull flows,
the two merge modes, and the reasoning behind each design decision),
see [`local-sync/README.md`](local-sync/README.md).

---

## 🔐 Privacy

Keepit collects no data and sends nothing to any server. Everything
you save stays in your browser's own `chrome.storage.local`, and the
optional local-sync feature only ever writes to a folder you choose
yourself on your own device.

For the full threat model and security posture, see
[`SECURITY.md`](SECURITY.md). For a record of what changed in each
release, see [`CHANGELOG.md`](CHANGELOG.md).

---

## 📄 License

MIT — use it, modify it, and share it freely.

<div align="center">

Made with care for Chromium-based browsers 💙

</div>

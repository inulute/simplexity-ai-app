# SimplexityAI v5.1.0 — Security fixes and Intel Mac support 🔒

Notification content is now sanitised before it renders, the macOS tray works again, and Intel Macs have a build for the first time since v5.0.0.

---

> [!NOTE]
> This release fixes a cross-site scripting issue in how notifications were rendered. Updating is recommended.

---

## What's Fixed

### Notifications are sanitised
Notification content is fetched from a remote feed and was being rendered without sanitisation. It now goes through DOMPurify, which strips dangerous links and attributes while leaving formatting intact. The libraries that do this are bundled with the app rather than downloaded at launch, so notifications also render correctly offline.

### The macOS tray icon works
The tray icon could not be loaded on macOS, and the failure silently took **tray mode, Quick Search and tray autostart** with it. All three work again.

### Intel Macs are supported
The macOS build was Apple Silicon only, so Intel Macs had nothing to download. macOS now ships a single **universal** build that runs natively on both.

---

## What's Changed

### AI Labs has been removed
Perplexity retired the Labs destination — `labs.perplexity.ai` no longer resolves — so the AI Labs button had been quietly loading the same site as AI Search. The button, its settings option and its shortcut are gone. If it was your default view, you'll be switched to AI Search rather than opening a dead page.

### Smaller download list
The macOS `.zip` has been removed; it only existed to serve an auto-updater this app doesn't use. The `.dmg` is unaffected.

---

## Verifying your download

Every artifact now carries build provenance you can check yourself:

```
gh attestation verify <file> -R inulute/simplexity-ai-app
```

---

## Known Limitations

- macOS and Windows builds are not code-signed, so Gatekeeper and SmartScreen will warn on first launch
- On macOS, right-click the app and choose **Open** the first time

---

**Released**: August 16, 2026
**Version**: 5.1.0
**Status**: Production Ready

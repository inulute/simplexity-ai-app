# SimplexityAI v5.2.0 — Put Discover and Finance in Perplexity's sidebar 🧭

Perplexity tucks Discover, Finance, Personal CFO, Health, Academic and Patents behind the ☰ menu in the top-right. You can now move the ones you actually use into its left sidebar.

---

## What's New

### Pick your own sidebar shortcuts
Open **Settings → Show in Perplexity's sidebar** and tick the destinations you want. They appear in Perplexity's own left sidebar, one click away instead of two, and untick to remove them.

Only what you tick gets added — leave them all unticked and Perplexity looks exactly as it does now. Changes apply straight away, no restart needed.

---

## What's Fixed

### Promotional overlays are actually hidden now
The code meant to hide Perplexity's nag screens had never run: one malformed CSS selector was aborting the entire script on every page load, taking everything after it down too. Fixed, and each selector is now isolated so one bad entry can't disable the rest.

---

## Known Limitations

- macOS and Windows builds are not code-signed, so Gatekeeper and SmartScreen will warn on first launch
- On macOS, right-click the app and choose **Open** the first time

---

**Released**: August 16, 2026
**Version**: 5.2.0
**Status**: Production Ready

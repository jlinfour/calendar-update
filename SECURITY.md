# Security & Cost Notes

A summary of the security posture and paid touchpoints for this app. This is a personal, client-side-only tool hosted as static files on GitHub Pages — there is no backend server.

## What is exposed on GitHub

The public repo contains **only static code** (HTML/CSS/JS, manifest, icons, logo). No secrets are committed:

- **OpenRouter API key** → stored in the browser's `localStorage` on your device only
- **Google access token** → stored in `sessionStorage` on your device only (short-lived, ~1 hour)

Neither is ever sent to GitHub. GitHub Pages only serves the blank app; all user data flows directly from your browser to Google / OpenRouter.

## Security posture

### Good
- No secrets in the repo.
- No XSS injection path: recognised values and user input are rendered with `.textContent` (not `innerHTML`), and event data is sent via `JSON.stringify`.
- Single self-contained HTML file — no third-party JavaScript dependencies that execute arbitrary code (only Google Fonts + Material Symbols, which are stylesheet/font resources).

### Risks & mitigations

1. **OpenRouter API key has no spending cap by default** *(most important)*
   - The key lives in `localStorage` in plaintext. Because the app is purely client-side, the key must live in the browser — there is no backend to hide it behind.
   - It could be read by: someone with access to your unlocked device, a malicious browser extension, malware, or (low risk here) a future code-injection compromise of the app.
   - **Mitigation:** Set a **credit limit** on the OpenRouter key in the OpenRouter dashboard (e.g. cap at a few dollars). This caps the financial damage of any leak to near-zero. ✅ *(done by user)*

2. **Implicit OAuth flow** (`response_type=token`)
   - Uses Google's older implicit flow; tokens ride in the URL hash and are short-lived (~1 hour, hence periodic reconnects).
   - Acceptable for a personal tool. A future upgrade to the PKCE authorization-code flow would be more robust but requires more setup.

3. **External resources**
   - Google Fonts and Material Symbols load from Google's CDN. Low risk (Google), but they are third-party requests on each load.

## Paid touchpoints

Only **one** paid touchpoint in the app:

- **OpenRouter API** — `recognise()` in `index.html`. Charged per handwriting recognition (fractions of a cent). Only triggered when you tap **Recognise**. Using the **Type** toggle instead makes **no API call → no cost.**

Everything else is free:
- **Google Calendar API** — free within Google's quota (~1M requests/day)
- **Google Fonts / Material Symbols** — free
- **GitHub Pages hosting** — free

# Calendar Update App

A mobile PWA for quickly adding events to Google Calendar with a streamlined multi-step form (Title → Date → Time → Venue → Submit).

## Session Logging Reminder
**IMPORTANT:** Before closing this session, remember to log the session summary to `~/.claude/projects/c--Users-jinji-Documents-calendar-update/memory/sessions/` as a timestamped `.md` file (e.g. `2026-06-19.md`). Include what was discussed, decisions made, and next steps.

## Tech Stack
- Single-page HTML/CSS/JS app (PWA)
- Google Calendar API (OAuth2 implicit flow) for event creation
- OpenRouter API for handwriting recognition (canvas → image → vision model)
- Hosted on GitHub Pages: https://jlinfour.github.io/calendar-update/
- Repo: https://github.com/jlinfour/calendar-update

## Project Structure
- `index.html` — Entire app (HTML + CSS + JS, single file)
- `manifest.json` — PWA manifest
- `sw.js` — Service worker (network-first with offline cache fallback)
- `icon-192.png` / `icon-512.png` — App icons
- `logo.png` — Header logo (local copy; previously hotlinked from Google Stitch)
- `SECURITY.md` — Security posture and paid-touchpoint notes

## Key Design Decisions
- Dynamic multi-screen flow based on event type and full-day selection
- Event type: Single-day or Multi-day
- Full-day option: skips time screens, uses Google Calendar all-day (`date`) format
- Date and time screens have a Write/Type toggle (handwriting canvas or typed input)
- Handwriting recognition via OpenRouter vision API (cheap, accurate, simple to implement)
- Dark glassmorphic UI theme (designed via Google Stitch): animated WebGL aurora shader background, emerald accents, Space Grotesk/JetBrains Mono/Geist fonts
- Logo image in header (hotlinked from Google Stitch)
- Location/venue field is optional
- All API keys stored in localStorage; Google access token in sessionStorage
- Date format: dd/mm/yy; Time format: hh:mm am/pm

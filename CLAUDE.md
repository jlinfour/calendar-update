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

## Key Design Decisions
- Multi-screen swipeable form: Title (typed) → Date (handwritten) → Time (handwritten) → Venue (typed) → Submit
- Handwriting recognition via OpenRouter vision API (cheap, accurate, simple to implement)
- Location/venue field is optional
- All API keys stored in localStorage (client-side only, not in code)
- Default event duration: 1 hour
- Date format: dd/mm/yy; Time format: hh:mm am/pm

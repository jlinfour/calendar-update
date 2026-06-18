# Calendar Update App

A mobile web app for quickly adding events to Google Calendar with a streamlined multi-step form (Title → Date → Time → Venue → Submit).

## Session Logging Reminder
**IMPORTANT:** Before closing this session, remember to log the session summary to `~/.claude/projects/c--Users-jinji-Documents-calendar-update/memory/sessions/` as a timestamped `.md` file (e.g. `2026-06-19.md`). Include what was discussed, decisions made, and next steps.

## Tech Stack
- Single-page HTML/CSS/JS app (PWA-ready)
- Google Calendar API (OAuth2) for event creation
- OpenRouter API for handwriting recognition (canvas → image → vision model)

## Key Design Decisions
- Multi-screen swipeable form: Title (typed) → Date (handwritten) → Time (handwritten) → Venue (typed) → Submit
- Handwriting recognition via OpenRouter vision API (cheap, accurate, simple to implement)
- Location/venue field is optional

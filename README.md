# Calendar Update

A mobile PWA for quickly adding events to Google Calendar. Built because the default Google Calendar UI for adding events is cumbersome.

## Features

- **Dynamic multi-step form**: Flow adapts based on event type (single/multi-day) and full-day selection
- **Optional category tag**: Tag a title as Appointment, Deadline, Meeting, Reminder, or Tentative — the event is created as `[Appointment] Hair Treatment`
- **Single-day & multi-day events**: With optional start/end date and time screens
- **All-day events**: Skips time screens, creates all-day events on Google Calendar
- **Write or type**: Toggle between handwriting canvas and typed input for date/time. Dates and times default to typing; in dates the `/` separators fill in automatically (backspace removes them)
- **Handwriting recognition**: Powered by vision models via OpenRouter (fractions of a cent per call)
- **Checks before submitting**: Rejects impossible dates (e.g. 31/02), and an end that's before the start
- **Works offline**: The app itself loads without a connection (creating events still needs one)
- **Google Calendar integration**: Events are created directly in your primary calendar
- **Review & conflict check**: Final screen summarises your inputs and flags existing calendar events that overlap
- **PWA**: Install on your phone's home screen — works like a native app
- **Emerald on Obsidian UI**: Dark, glassy theme with a single emerald accent: translucent cards with an emerald rim and corner glow, labels above the cards, and a subtle animated WebGL background

## Usage

1. Open **https://jlinfour.github.io/calendar-update/** on your phone
2. Tap the browser menu → **Add to Home Screen**
3. Open the app and tap the gear icon to configure:
   - **OpenRouter API key** — Get one from [openrouter.ai](https://openrouter.ai)
   - **Google Client ID** — Create one in [Google Cloud Console](https://console.cloud.google.com) (enable Calendar API, create OAuth2 web credentials)
4. Tap **Connect Google Calendar** to authorise
5. Start creating events!

## How It Works

1. Type the event title, and optionally tag it as Appointment / Deadline / Meeting / Reminder / Tentative (tap the selected one again to clear it)
2. Select event type (single-day or multi-day)
3. Choose full-day or specific times
4. Enter start date (dd/mm/yy) — type it (the `/` fills in automatically) or switch to Write and use the canvas
5. If multi-day: enter end date
6. If not full-day: enter start and end time (hh:mm am/pm)
7. Optionally type a venue
8. Review the summary — the app also checks your Google Calendar for conflicting events in the same time window
9. Submit — event is created in your Google Calendar

## Tech Stack

- Vanilla HTML/CSS/JS (no framework, no build step)
- Google Calendar API (OAuth2 implicit flow, with `state` CSRF protection)
- OpenRouter API (vision models for handwriting recognition)
- GitHub Pages hosting, deployed via a GitHub Actions workflow

## Security & Cost

The repo contains only static code — no secrets. API keys stay in your browser (`localStorage`), and your Google token in `sessionStorage`; neither is ever sent to GitHub. The only paid touchpoint is the OpenRouter call made when you tap **Recognise** (fractions of a cent; using **Type** instead costs nothing). It's recommended to set a credit limit on your OpenRouter key.

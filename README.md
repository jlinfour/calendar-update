# Calendar Update

A mobile PWA for quickly adding events to Google Calendar. Built because the default Google Calendar UI for adding events is cumbersome.

## Features

- **Dynamic multi-step form**: Flow adapts based on event type (single/multi-day) and full-day selection
- **Single-day & multi-day events**: With optional start/end date and time screens
- **All-day events**: Skips time screens, creates all-day events on Google Calendar
- **Write or type**: Toggle between handwriting canvas and typed input for date/time
- **Handwriting recognition**: Powered by vision models via OpenRouter (fractions of a cent per call)
- **Google Calendar integration**: Events are created directly in your primary calendar
- **PWA**: Install on your phone's home screen — works like a native app
- **Animated aurora UI**: Dark glassmorphic theme with WebGL shader background

## Usage

1. Open **https://jlinfour.github.io/calendar-update/** on your phone
2. Tap the browser menu → **Add to Home Screen**
3. Open the app and tap the gear icon to configure:
   - **OpenRouter API key** — Get one from [openrouter.ai](https://openrouter.ai)
   - **Google Client ID** — Create one in [Google Cloud Console](https://console.cloud.google.com) (enable Calendar API, create OAuth2 web credentials)
4. Tap **Connect Google Calendar** to authorise
5. Start creating events!

## How It Works

1. Type the event title
2. Select event type (single-day or multi-day)
3. Choose full-day or specific times
4. Enter start date (dd/mm/yy) — write on canvas or type directly
5. If multi-day: enter end date
6. If not full-day: enter start and end time (hh:mm am/pm)
7. Optionally type a venue
8. Submit — event is created in your Google Calendar

## Tech Stack

- Vanilla HTML/CSS/JS (single file, no build step)
- Google Calendar API (OAuth2 implicit flow)
- OpenRouter API (vision models for handwriting recognition)
- GitHub Pages (hosting)

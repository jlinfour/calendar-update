# Calendar Update

A mobile PWA for quickly adding events to Google Calendar. Built because the default Google Calendar UI for adding events is cumbersome.

## Features

- **Multi-step form**: Title → Date → Time → Venue → Submit
- **Write or type**: Toggle between handwriting canvas and typed input for date/time
- **Handwriting recognition**: Powered by vision models via OpenRouter (fractions of a cent per call)
- **Google Calendar integration**: Events are created directly in your primary calendar
- **PWA**: Install on your phone's home screen — works like a native app
- **Dark glassmorphic UI**: Futuristic emerald-accented design

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
2. Enter the date (dd/mm/yy) — write on the canvas and tap "Recognise", or toggle to "Type" and enter directly
3. Enter the time (hh:mm am/pm) — same write/type options
4. Optionally type a venue
5. Submit — a 1-hour event is created in your Google Calendar

## Tech Stack

- Vanilla HTML/CSS/JS (single file, no build step)
- Google Calendar API (OAuth2 implicit flow)
- OpenRouter API (vision models for handwriting recognition)
- GitHub Pages (hosting)

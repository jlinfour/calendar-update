# Calendar Update

A mobile PWA for quickly adding events to Google Calendar. Built because the default Google Calendar UI for adding events is cumbersome.

## Features

- **Multi-step form**: Title → Date → Time → Venue → Submit
- **Handwriting input**: Write date and time on a canvas using your finger
- **Handwriting recognition**: Powered by vision models via OpenRouter (fractions of a cent per call)
- **Google Calendar integration**: Events are created directly in your primary calendar
- **PWA**: Install on your phone's home screen — works like a native app

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
2. Write the date (dd/mm/yyyy) on the canvas and tap "Recognise"
3. Write the time (hh:mm am/pm) on the canvas and tap "Recognise"
4. Optionally type a venue
5. Submit — a 1-hour event is created in your Google Calendar

## Tech Stack

- Vanilla HTML/CSS/JS (single file, no build step)
- Google Calendar API (OAuth2 implicit flow)
- OpenRouter API (vision models for handwriting recognition)
- GitHub Pages (hosting)

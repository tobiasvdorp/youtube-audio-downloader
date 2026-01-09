# Beats Downloader

A simple, no-nonsense YouTube audio downloader. Paste a link, pick a format, download your audio.

## Why?

My friends and I were tired of those shady YouTube-to-MP3 websites — you know, the ones plastered with sketchy ads, fake download buttons, and popups that make you question your life choices. Half the time they don't even work. So I built this simple tool for us to use instead.

## Features

- Download YouTube audio in **MP3** or **WAV** format
- Real-time download progress
- Video preview before downloading
- Clean, modern UI
- No ads, no tracking, no BS

## Quick Start

### Using Docker (recommended)

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

### Local Development

**Prerequisites:**

- Node.js 20+
- pnpm
- ffmpeg
- yt-dlp

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS
- yt-dlp + ffmpeg for audio extraction

## License

Do whatever you want with it.

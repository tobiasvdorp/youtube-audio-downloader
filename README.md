# YouTube Audio Downloader

A simple, no-nonsense YouTube audio downloader. Paste a link, pick a format, download your audio.

## Why?

My friends and I were tired of those shady YouTube-to-MP3 websites — you know, the ones plastered with sketchy ads, fake download buttons, and popups that make you question your life choices. Half the time they don't even work. So I built this simple tool for us to use instead.

## Features

- Download YouTube audio in **MP3** or **WAV** format
- Real-time download progress
- Video preview before downloading
- Recent downloads history — quickly re-download previous videos
- Clean, modern UI
- No ads, no tracking, no BS

## ⚠️ Legal Disclaimer

This tool is intended **exclusively for legal use**. Please read and understand the following before using:

- **Only download content you have rights to**: This tool should only be used for content you own, have created yourself, or that is explicitly licensed for reuse (e.g., Creative Commons, royalty-free content, or content where the creator has given explicit permission).

- **Respect copyright laws**: Downloading copyrighted YouTube content without the permission of the copyright holder may violate applicable laws in your jurisdiction and is against [YouTube's Terms of Service](https://www.youtube.com/static?template=terms). You are solely responsible for ensuring your use complies with all applicable laws and regulations.

- **No liability**: The developer(s) of this tool do not condone, encourage, or support the unauthorized downloading of copyrighted material. We assume no responsibility or liability for any misuse of this tool or any violations of copyright law by its users.

By using this tool, you acknowledge that you understand and agree to these terms.

## Quick Start

### Using Docker (recommended)

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

### YouTube Authentication (Important!)

YouTube may require authentication to prevent bot detection. If you see a "Sign in to confirm you're not a bot" error, you need to export your YouTube cookies:

1. **Install a browser extension** to export cookies:

   - Chrome: [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - Firefox: [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)

2. **Export cookies from an incognito window** (recommended for longer-lasting cookies):

   - Open an incognito/private browser window
   - Go to YouTube and log in
   - Keep only one tab open (e.g., `https://www.youtube.com/robots.txt`)
   - Use the extension to export cookies
   - Close the incognito window immediately after exporting

3. **Convert to base64 and set as environment variable:**

```bash
# Convert and copy to clipboard (macOS)
cat cookies.txt | base64 | pbcopy

# Or just output to terminal
cat cookies.txt | base64
```

4. **Set the `YT_COOKIES_BASE64` environment variable:**
   - **Docker:** Add to `.env` file in project root
   - **Railway/Render:** Add in the dashboard under Variables
   - **Local dev:** Export in your shell or add to `.env`

> ⚠️ **Never commit cookies** — `.env` and `cookies.txt` are excluded via `.gitignore`

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
- Zustand + usehooks-ts
- yt-dlp + ffmpeg for audio extraction

## License

Do whatever you want with it.

# FastReading

> **Read faster. Think clearer.**  
> A free, no-login RSVP speed reading tool for the web.

---

## What is RSVP?

**Rapid Serial Visual Presentation (RSVP)** flashes words one at a time at a fixed focal point — eliminating the saccadic eye movements that slow traditional reading by up to 30%. The result: you read up to **3× faster** with the same comprehension.

FastReading applies this technique to any article or text, directly in your browser.

---

## Features

| Feature | Details |
|---|---|
| **Article URL** | Paste any article link — FastReading fetches and extracts the clean text automatically |
| **Paste text** | Drop in any raw text — notes, research papers, newsletters |
| **Speed control** | 100–900 WPM, adjustable mid-session |
| **Font options** | Classic (serif), Clean (sans-serif), Soft — pick what feels right |
| **Themes** | Light, Light Soft, Dark, Dark Soft, Midnight, Dark Warm |
| **Seek slider** | Jump to any word at any time |
| **No sign-up** | Open and read. Nothing to install or create |

---

## Tech Stack

- **Backend:** Node.js + Express
- **Article extraction:** [@mozilla/readability](https://github.com/mozilla/readability) + [jsdom](https://github.com/jsdom/jsdom)
- **Frontend:** Vanilla JS, plain CSS — no framework

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/fastreading.git
cd fastreading

# Install dependencies
npm install

# Start the server
npm start
```

App runs at **http://localhost:3111**

### Dev mode (auto-restart on change)

```bash
npm run dev
```

---

## How It Works

```
User pastes URL
      │
      ▼
POST /api/extract
      │
      ├─ fetch(url, browser headers)
      │        │
      │        └─ 403? → retry via allorigins.win proxy
      │
      ├─ JSDOM parses HTML
      ├─ Readability extracts article text
      │
      └─ { title, text } → client
              │
              ▼
        RSVP player flashes
        words at set WPM
```

---

## Project Structure

```
.
├── server.js          # Express server + /api/extract endpoint
├── public/
│   ├── index.html     # Single-page app
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js         # UI logic, state, form handling
│       └── text-player.js # RSVP engine
└── package.json
```

---

## API

### `POST /api/extract`

Extract readable text from a URL.

**Request body**
```json
{ "url": "https://example.com/some-article" }
```

**Response**
```json
{
  "title": "Article Title",
  "text": "Full cleaned article text..."
}
```

**Error responses**

| Status | Meaning |
|---|---|
| 400 | Missing or invalid URL |
| 403 | Site blocked automated access |
| 422 | No readable text found |
| 500 | Server/network error |

---

## Self-Hosting

FastReading is a standard Node.js app. Deploy anywhere that runs Node:

- **Vercel** — add a `vercel.json` pointing to `server.js`
- **Railway / Render / Fly.io** — push and deploy
- **VPS** — `node server.js` behind nginx

---

## License

MIT — free to use, modify, and deploy.

---

<div align="center">
  <strong>FastReading</strong> · Free RSVP speed reader · No sign-up required
</div>

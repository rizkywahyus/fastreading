import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BROWSER_HEADERS,
  MESSAGES,
  extractArticle,
  validateArticleUrl,
} from './lib/article.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3111;

export const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Extract article text from a URL using Readability.
app.post('/api/extract', async (req, res) => {
  const { url, error } = validateArticleUrl(req.body && req.body.url);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    let response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
    });

    // On 403, retry once through a public proxy (many sites block server-side requests).
    if (response.status === 403) {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl, { headers: BROWSER_HEADERS });
      if (proxyResponse.ok) {
        response = proxyResponse;
      }
    }

    if (!response.ok) {
      const message =
        response.status === 403 ? MESSAGES.blocked : MESSAGES.fetchFailed(response.status);
      return res.status(response.status).json({ error: message });
    }

    const article = extractArticle(await response.text(), response.url);
    if (!article) {
      return res.status(422).json({ error: MESSAGES.noText });
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || MESSAGES.extractFailed });
  }
});

app.get('/read', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only listen when started directly, so tests can import `app`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`FastReading (fastreading.pro) running at http://localhost:${PORT}`);
  });
}

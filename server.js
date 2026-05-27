import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3111;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ekstrak teks dari URL artikel menggunakan Readability
app.post('/api/extract', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL wajib diisi' });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'URL tidak valid' });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Hanya URL http/https yang didukung' });
  }

  // Header mirip browser agar situs yang anti-bot tidak mengembalikan 403
  const browserHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
  };

  try {
    let response = await fetch(url, {
      headers: browserHeaders,
      redirect: 'follow',
    });

    // Jika 403, coba sekali lagi lewat proxy publik (banyak situs memblokir request server)
    if (response.status === 403) {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl, { headers: browserHeaders });
      if (proxyResponse.ok) {
        response = proxyResponse;
      }
    }

    if (!response.ok) {
      const is403 = response.status === 403;
      const message = is403
        ? 'Situs ini memblokir pengambilan otomatis (403). Coba URL artikel dari blog lain, atau salin teks artikel lalu gunakan "Baca dari teks" di bawah.'
        : `Gagal mengambil halaman: ${response.status}`;
      return res.status(response.status).json({ error: message });
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url: response.url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent || !article.textContent.trim()) {
      // Fallback: ambil teks dari body
      const body = dom.window.document.body;
      const text = body ? body.textContent : '';
      const cleaned = text.replace(/\s+/g, ' ').trim();
      if (!cleaned) {
        return res.status(422).json({ error: 'Tidak ada teks artikel yang bisa diekstrak dari URL ini.' });
      }
      return res.json({ title: null, text: cleaned });
    }

    const text = article.textContent.replace(/\s+/g, ' ').trim();
    res.json({ title: article.title || null, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || 'Gagal mengekstrak artikel. Periksa URL dan koneksi.',
    });
  }
});

app.get('/read', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FastReading (fastreading.pro) berjalan di http://localhost:${PORT}`);
});

import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// Browser-like headers so anti-bot sites do not answer with 403.
export const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

export const MESSAGES = {
  urlRequired: 'A URL is required.',
  urlInvalid: 'That URL is not valid.',
  urlProtocol: 'Only http and https URLs are supported.',
  blocked:
    'This site blocks automated fetching (403). Try an article from another site, or copy the text and use "Read from text" below.',
  fetchFailed: (status) => `Could not fetch the page: ${status}`,
  noText: 'No article text could be extracted from this URL.',
  extractFailed: 'Could not extract the article. Check the URL and your connection.',
};

// Validate a user-supplied article URL.
// Returns { url } on success or { error } with a user-facing message.
export function validateArticleUrl(value) {
  if (!value || typeof value !== 'string') {
    return { error: MESSAGES.urlRequired };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { error: MESSAGES.urlInvalid };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { error: MESSAGES.urlProtocol };
  }

  return { url: parsed.href };
}

export function normalizeText(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

// Parse an HTML document into { title, text }, falling back to the raw body
// text when Readability finds no article. Returns null when nothing is left.
export function extractArticle(html, url) {
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();

  const readable = article ? normalizeText(article.textContent) : '';
  if (readable) {
    return { title: article.title || null, text: readable };
  }

  const body = dom.window.document.body;
  const fallback = normalizeText(body ? body.textContent : '');
  if (!fallback) return null;

  return { title: null, text: fallback };
}

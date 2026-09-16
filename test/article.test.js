import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MESSAGES,
  extractArticle,
  normalizeText,
  validateArticleUrl,
} from '../lib/article.js';

test('validateArticleUrl rejects missing or non-string input', () => {
  assert.equal(validateArticleUrl(undefined).error, MESSAGES.urlRequired);
  assert.equal(validateArticleUrl('').error, MESSAGES.urlRequired);
  assert.equal(validateArticleUrl(42).error, MESSAGES.urlRequired);
});

test('validateArticleUrl rejects unparseable URLs', () => {
  assert.equal(validateArticleUrl('not a url').error, MESSAGES.urlInvalid);
});

test('validateArticleUrl rejects non-http protocols', () => {
  assert.equal(validateArticleUrl('ftp://example.com/a').error, MESSAGES.urlProtocol);
  assert.equal(validateArticleUrl('file:///etc/passwd').error, MESSAGES.urlProtocol);
});

test('validateArticleUrl accepts http and https', () => {
  assert.equal(validateArticleUrl('https://example.com/post').url, 'https://example.com/post');
  assert.equal(validateArticleUrl('http://example.com').url, 'http://example.com/');
});

test('normalizeText collapses whitespace', () => {
  assert.equal(normalizeText('  a \n\t b  c '), 'a b c');
  assert.equal(normalizeText(null), '');
});

test('extractArticle pulls title and text from a readable page', () => {
  const html = `<!doctype html><html><head><title>A Long Title</title></head><body>
    <article><h1>A Long Title</h1>
    ${'<p>Readability needs a decent amount of prose before it treats a node as the article body.</p>'.repeat(6)}
    </article></body></html>`;

  const result = extractArticle(html, 'https://example.com/post');
  assert.ok(result);
  assert.match(result.text, /Readability needs a decent amount of prose/);
  assert.ok(!/\s{2,}/.test(result.text));
});

test('extractArticle falls back to body text when there is no article', () => {
  const html = '<!doctype html><html><body><div>tiny   body   text</div></body></html>';
  const result = extractArticle(html, 'https://example.com/x');
  assert.ok(result);
  assert.match(result.text, /tiny body text/);
});

test('extractArticle returns null for an empty document', () => {
  const html = '<!doctype html><html><body></body></html>';
  assert.equal(extractArticle(html, 'https://example.com/x'), null);
});

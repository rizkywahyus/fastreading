(function () {
  const form = document.getElementById('url-form');
  const urlInput = document.getElementById('url-input');
  const heroSection = document.getElementById('hero-section');
  const mainContent = document.getElementById('main-content');
  const inputError = document.getElementById('input-error');
  const inputLoading = document.getElementById('input-loading');
  const textInput = document.getElementById('text-input');
  const submitBtn = document.getElementById('paste-submit-btn');
  const browseBtn = document.getElementById('browse-btn');
  const headerHome = document.getElementById('header-home');
  const headerReader = document.getElementById('header-reader');
  const readerTitle = document.getElementById('reader-title');
  const readerSource = document.getElementById('reader-source');
  const articleHeader = document.getElementById('reader-article-header');
  const articleTitle = document.getElementById('reader-article-title');
  const articleSource = document.getElementById('reader-article-source');

  function setReaderHeader(title, source) {
    const t = title || 'Teks yang Anda tempel';
    if (readerTitle) readerTitle.textContent = t;
    if (readerSource) {
      readerSource.textContent = source ? 'Sumber: ' + source : '';
      readerSource.hidden = !source;
    }
    if (articleTitle) articleTitle.textContent = t;
    if (articleSource) {
      articleSource.textContent = source ? 'Sumber: ' + source : '';
      articleSource.hidden = !source;
    }
    if (articleHeader) articleHeader.hidden = false;
    if (headerHome) headerHome.hidden = false;
    if (headerReader) headerReader.hidden = true;
  }

  function showHomeHeader() {
    if (headerHome) headerHome.hidden = false;
    if (headerReader) headerReader.hidden = true;
    if (articleHeader) articleHeader.hidden = true;
  }

  function getDomainFromUrl(urlStr) {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  function showError(msg) {
    inputError.textContent = msg;
    inputError.hidden = false;
  }

  function hideError() {
    inputError.hidden = true;
  }

  function setLoading(loading) {
    inputLoading.hidden = !loading;
    if (submitBtn) submitBtn.disabled = loading;
  }

  function switchToReaderLayout() {
    if (mainContent) {
      mainContent.classList.remove('home-layout');
      mainContent.classList.add('reader-layout');
    }
    if (heroSection) heroSection.hidden = true;
    if (location.pathname !== '/read') {
      history.pushState({ view: 'reader' }, '', '/read');
    }
  }

  function switchToHomeLayout() {
    if (mainContent) {
      mainContent.classList.remove('reader-layout');
      mainContent.classList.add('home-layout');
    }
    if (heroSection) heroSection.hidden = false;
    showHomeHeader();
    if (urlInput) urlInput.focus();
    if (window.TextPlayer) {
      TextPlayer.setWords(TextPlayer.getDemoStory(), true);
    }
    if (location.pathname !== '/') {
      history.pushState({ view: 'home' }, '', '/');
    }
  }

  window.addEventListener('popstate', function () {
    if (location.pathname === '/') {
      if (mainContent) {
        mainContent.classList.remove('reader-layout');
        mainContent.classList.add('home-layout');
      }
      if (heroSection) heroSection.hidden = false;
      showHomeHeader();
      if (urlInput) urlInput.focus();
      if (window.TextPlayer) {
        TextPlayer.setWords(TextPlayer.getDemoStory(), true);
      }
    }
  });

  if (location.pathname === '/read') {
    history.replaceState({ view: 'reader' }, '', '/');
  }

  function handlePasteWords(wordList, title, source) {
    if (!window.TextPlayer) return;
    setReaderHeader(title || 'Teks yang Anda tempel', source);
    TextPlayer.setWords(wordList, false);
    switchToReaderLayout();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    const url = urlInput && urlInput.value.trim();
    const rawText = textInput && textInput.value.trim();

    if (url) {
      setLoading(true);
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          showError(data.error || 'Gagal mengekstrak artikel.');
          return;
        }

        const text = (data.text || '').trim();
        if (!text) {
          showError('Tidak ada teks yang bisa diekstrak dari URL ini.');
          return;
        }

        const wordList = text.split(/\s+/).filter(Boolean);
        const articleTitle = (data.title || '').trim() || 'Tanpa judul';
        const source = getDomainFromUrl(url);
        handlePasteWords(wordList, articleTitle, source);
      } catch (err) {
        showError('Koneksi gagal. Periksa jaringan dan coba lagi.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (rawText) {
      const wordList = rawText.split(/\s+/).filter(Boolean);
      if (wordList.length === 0) {
        showError('Tidak ada kata yang bisa dibaca.');
        return;
      }
      handlePasteWords(wordList, 'Teks yang Anda tempel', null);
      return;
    }

    showError('Masukkan link atau tempel teks, lalu klik let\'s go!.');
  });

  if (browseBtn) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,text/plain';
    fileInput.className = 'sr-only';
    fileInput.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fileInput);
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result || '').trim();
        if (textInput) textInput.value = text;
        fileInput.value = '';
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  if (window.TextPlayer) {
    TextPlayer.init({
      onBack: switchToHomeLayout,
    });
  }
})();

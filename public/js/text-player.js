/**
 * Reusable RSVP text player component.
 * Can be used on the home page (demo story) and on the reader page (user content).
 */
(function () {
  const DEMO_STORY = (
    'Pagi itu embun masih melekat di jendela. Ibu menyiapkan teh hangat dan roti panggang. ' +
    'Kucing tua kami berbaring di bawah sinar matahari, ekornya bergoyang pelan. ' +
    'Aku ingat bagaimana nenek selalu bilang: rumah bukan tentang tembok, tapi tentang orang-orang yang menunggu. ' +
    'Sekarang aku mengerti. Kehangatan itu ada di sini, di meja kecil kita, dalam senyum yang tak perlu kata-kata.'
  ).split(/\s+/).filter(Boolean);

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function getIntervalMs(wpm) {
    return Math.round(60000 / wpm);
  }

  function wordEndsWithPeriod(word) {
    return word && /\.$/.test(word);
  }

  function wordIsLong(word) {
    return word && word.length > 6;
  }

  const PAUSE_AFTER_PERIOD_FACTOR = 1;
  const LONG_WORD_EXTRA_FACTOR = 0.4;

  const iconPause =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
  const iconPlay =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M8 5v14l11-7L8 5z"/></svg>';

  let words = [];
  let index = 0;
  let timer = null;
  let isPaused = true;
  let userSeeking = false;
  let onBackCallback = null;

  let wordDisplay, progressText, seekSlider, wpmSlider, wpmValue, btnPause, btnPauseIcon;
  let wordContainer, fontSizeSelect, fontTypeSelect, fontSizeValue, fontTypeValue, themeSelect, themeValue;
  let btnBack, btnPrev, btnNext, btnRestart;
  let wpmUp, wpmDown, fontSizeUp, fontSizeDown, fontTypeUp, fontTypeDown, themeUp, themeDown;

  function getEl(id) {
    return document.getElementById(id);
  }

  function renderWord(word) {
    if (!wordDisplay) return;
    if (!word) {
      wordDisplay.innerHTML = '';
      return;
    }
    const len = word.length;
    const fixationIndex = len <= 2 ? 0 : Math.floor(len / 2);
    const before = word.slice(0, fixationIndex);
    const fixation = word.slice(fixationIndex, fixationIndex + 1);
    const after = word.slice(fixationIndex + 1);
    wordDisplay.innerHTML =
      '<span class="word-before">' + escapeHtml(before) + '</span>' +
      '<span class="word-fixation-wrap"><span class="fixation">' + escapeHtml(fixation) + '</span></span>' +
      '<span class="word-after">' + escapeHtml(after) + '</span>';
  }

  function updateProgress() {
    if (progressText) progressText.textContent = 'Word ' + index + ' of ' + words.length;
    if (seekSlider && !userSeeking) seekSlider.value = index;
  }

  function setPauseButtonIcon(paused) {
    if (!btnPauseIcon) return;
    btnPauseIcon.innerHTML = paused ? iconPlay : iconPause;
    if (btnPause) btnPause.setAttribute('aria-label', paused ? 'Lanjut' : 'Jeda');
  }

  function updateWpmLabel(wpm) {
    if (wpmValue) wpmValue.textContent = wpm;
  }

  function tick() {
    if (isPaused || index >= words.length) {
      if (index >= words.length && timer) {
        clearTimeout(timer);
        timer = null;
        setPauseButtonIcon(true);
        if (btnPause) btnPause.disabled = true;
      }
      return;
    }
    renderWord(words[index]);
    updateProgress();
    index++;
    if (index >= words.length) {
      if (timer) clearTimeout(timer);
      timer = null;
      setPauseButtonIcon(true);
      if (btnPause) btnPause.disabled = true;
      return;
    }
    if (isPaused) return;
    const baseMs = getIntervalMs(Number(wpmSlider ? wpmSlider.value : 300));
    const wordJustShown = words[index - 1];
    let extraMs = 0;
    if (wordEndsWithPeriod(wordJustShown)) extraMs += baseMs * PAUSE_AFTER_PERIOD_FACTOR;
    if (wordIsLong(wordJustShown)) extraMs += baseMs * LONG_WORD_EXTRA_FACTOR;
    timer = setTimeout(tick, baseMs + extraMs);
  }

  function seekTo(newIndex) {
    if (words.length === 0) return;
    index = Math.max(0, Math.min(newIndex, words.length));
    const showIdx = index < words.length ? index : words.length - 1;
    renderWord(words[showIdx]);
    updateProgress();
    if (btnPause) {
      btnPause.disabled = false;
      setPauseButtonIcon(isPaused);
    }
    if (index >= words.length) {
      setPauseButtonIcon(true);
      if (btnPause) btnPause.disabled = true;
    }
  }

  function applyFontSize() {
    if (!wordContainer || !fontSizeSelect) return;
    wordContainer.classList.remove('reader-font-s', 'reader-font-m', 'reader-font-l', 'reader-font-xl');
    wordContainer.classList.add('reader-font-' + fontSizeSelect.value);
    if (fontSizeValue) fontSizeValue.textContent = fontSizeSelect.options[fontSizeSelect.selectedIndex].text;
  }

  function applyFontType() {
    if (!wordContainer || !fontTypeSelect) return;
    wordContainer.classList.remove('reader-type-serif', 'reader-type-sans', 'reader-type-soft');
    wordContainer.classList.add('reader-type-' + fontTypeSelect.value);
    if (fontTypeValue) fontTypeValue.textContent = fontTypeSelect.options[fontTypeSelect.selectedIndex].text;
  }

  function syncThemeDisplay() {
    const t = document.body.dataset.theme || 'light';
    if (themeSelect) themeSelect.value = t;
    if (themeValue && themeSelect) themeValue.textContent = themeSelect.options[themeSelect.selectedIndex].text;
  }

  function applyTheme(themeId) {
    document.body.dataset.theme = themeId;
    try { localStorage.setItem('fastreading-theme', themeId); } catch (_) {}
    syncThemeDisplay();
  }

  function bindElements() {
    wordDisplay = getEl('word-display');
    progressText = getEl('progress-text');
    seekSlider = getEl('seek-slider');
    wpmSlider = getEl('wpm-slider');
    wpmValue = getEl('wpm-value');
    btnPause = getEl('btn-pause');
    btnPauseIcon = getEl('btn-pause-icon');
    wordContainer = getEl('word-container');
    fontSizeSelect = getEl('font-size-select');
    fontTypeSelect = getEl('font-type-select');
    fontSizeValue = getEl('font-size-value');
    fontTypeValue = getEl('font-type-value');
    themeSelect = getEl('theme-select');
    themeValue = getEl('theme-value');
    btnBack = getEl('btn-back');
    btnPrev = getEl('btn-prev');
    btnNext = getEl('btn-next');
    btnRestart = getEl('btn-restart');
    wpmUp = getEl('wpm-up');
    wpmDown = getEl('wpm-down');
    fontSizeUp = getEl('font-size-up');
    fontSizeDown = getEl('font-size-down');
    fontTypeUp = getEl('font-type-up');
    fontTypeDown = getEl('font-type-down');
    themeUp = getEl('theme-up');
    themeDown = getEl('theme-down');
  }

  function bindEvents() {
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        if (index >= words.length) return;
        if (isPaused) resume(); else pause();
      });
    }
    if (btnRestart) btnRestart.addEventListener('click', () => seekTo(0));
    if (btnPrev) btnPrev.addEventListener('click', () => seekTo(index - 5));
    if (btnNext) btnNext.addEventListener('click', () => seekTo(index + 5));
    if (btnBack) btnBack.addEventListener('click', () => { if (onBackCallback) onBackCallback(); });

    if (seekSlider) {
      seekSlider.addEventListener('input', () => {
        if (words.length === 0) return;
        userSeeking = true;
        const pos = parseInt(seekSlider.value, 10);
        index = Math.min(Math.max(0, pos), words.length);
        const showIdx = index < words.length ? index : words.length - 1;
        renderWord(words[showIdx]);
        if (progressText) progressText.textContent = 'Word ' + index + ' of ' + words.length;
        if (btnPause) {
          btnPause.disabled = false;
          setPauseButtonIcon(isPaused);
        }
        if (index >= words.length) {
          setPauseButtonIcon(true);
          if (btnPause) btnPause.disabled = true;
        }
      });
      seekSlider.addEventListener('change', () => { userSeeking = false; });
    }

    if (wpmSlider) {
      wpmSlider.addEventListener('input', () => {
        const wpm = Number(wpmSlider.value);
        updateWpmLabel(wpm);
        if (timer && !isPaused) {
          clearTimeout(timer);
          timer = setTimeout(tick, getIntervalMs(wpm));
        }
      });
    }
    if (wpmUp) wpmUp.addEventListener('click', () => {
      if (!wpmSlider) return;
      const v = Math.min(900, Number(wpmSlider.value) + 50);
      wpmSlider.value = v;
      updateWpmLabel(v);
      if (timer && !isPaused) { clearTimeout(timer); timer = setTimeout(tick, getIntervalMs(v)); }
    });
    if (wpmDown) wpmDown.addEventListener('click', () => {
      if (!wpmSlider) return;
      const v = Math.max(100, Number(wpmSlider.value) - 50);
      wpmSlider.value = v;
      updateWpmLabel(v);
      if (timer && !isPaused) { clearTimeout(timer); timer = setTimeout(tick, getIntervalMs(v)); }
    });

    if (fontSizeSelect) fontSizeSelect.addEventListener('change', applyFontSize);
    if (fontTypeSelect) fontTypeSelect.addEventListener('change', applyFontType);
    if (fontSizeUp) fontSizeUp.addEventListener('click', () => {
      if (!fontSizeSelect) return;
      const next = (fontSizeSelect.selectedIndex + 1) % fontSizeSelect.options.length;
      fontSizeSelect.selectedIndex = next;
      applyFontSize();
    });
    if (fontSizeDown) fontSizeDown.addEventListener('click', () => {
      if (!fontSizeSelect) return;
      const prev = (fontSizeSelect.selectedIndex - 1 + fontSizeSelect.options.length) % fontSizeSelect.options.length;
      fontSizeSelect.selectedIndex = prev;
      applyFontSize();
    });
    if (fontTypeUp) fontTypeUp.addEventListener('click', () => {
      if (!fontTypeSelect) return;
      const next = (fontTypeSelect.selectedIndex + 1) % fontTypeSelect.options.length;
      fontTypeSelect.selectedIndex = next;
      applyFontType();
    });
    if (fontTypeDown) fontTypeDown.addEventListener('click', () => {
      if (!fontTypeSelect) return;
      const prev = (fontTypeSelect.selectedIndex - 1 + fontTypeSelect.options.length) % fontTypeSelect.options.length;
      fontTypeSelect.selectedIndex = prev;
      applyFontType();
    });

    if (themeUp) themeUp.addEventListener('click', () => {
      if (!themeSelect) return;
      const next = (themeSelect.selectedIndex + 1) % themeSelect.options.length;
      applyTheme(themeSelect.options[next].value);
    });
    if (themeDown) themeDown.addEventListener('click', () => {
      if (!themeSelect) return;
      const prev = (themeSelect.selectedIndex - 1 + themeSelect.options.length) % themeSelect.options.length;
      applyTheme(themeSelect.options[prev].value);
    });
    if (themeSelect) themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
  }

  function resume() {
    isPaused = false;
    setPauseButtonIcon(false);
    if (btnPause) btnPause.disabled = false;
    if (timer) clearTimeout(timer);
    tick();
  }

  function pause() {
    isPaused = true;
    setPauseButtonIcon(true);
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function play() {
    if (words.length === 0) return;
    resume();
  }

  function setWords(wordList, autoPlay) {
    words = wordList || [];
    index = 0;
    isPaused = true;
    userSeeking = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (seekSlider) {
      seekSlider.min = 0;
      seekSlider.max = words.length;
      seekSlider.value = 0;
      seekSlider.disabled = words.length <= 1;
    }
    syncThemeDisplay();
    updateWpmLabel(wpmSlider ? Number(wpmSlider.value) : 300);
    updateProgress();
    renderWord(words[0] || '');
    setPauseButtonIcon(true);
    if (btnPause) btnPause.disabled = false;
    if (autoPlay && words.length > 0) {
      setTimeout(() => resume(), 300);
    }
  }

  function init(options) {
    options = options || {};
    onBackCallback = options.onBack || null;
    bindElements();
    bindEvents();
    const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('fastreading-theme') : null;
    if (savedTheme) document.body.dataset.theme = savedTheme;
    syncThemeDisplay();
    applyFontSize();
    applyFontType();
    setWords(DEMO_STORY, true);
  }

  document.addEventListener('keydown', (e) => {
    const section = document.getElementById('reader-section');
    if (!section || section.getAttribute('aria-hidden') === 'true') return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (index >= words.length) return;
      if (isPaused) resume(); else pause();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      seekTo(index - 5);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      seekTo(index + 5);
    }
  });

  window.TextPlayer = {
    init,
    setWords,
    play,
    pause,
    seekTo,
    getDemoStory: function () { return DEMO_STORY.slice(); },
    getWords: function () { return words.slice(); },
    getIndex: function () { return index; },
    getTotal: function () { return words.length; },
  };
})();

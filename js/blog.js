/**
 * 事業承継コンサルティング — Blog JavaScript
 */

/* ============================================================
   1. ACCORDION — Article cards open/close
   ============================================================ */
function toggleArticle(headerEl) {
  const card = headerEl.closest('.article-card');
  const isOpen = card.classList.contains('open');

  // Close all other open cards for cleaner UX (optional: remove if want multi-open)
  // document.querySelectorAll('.article-card.open').forEach(c => { if (c !== card) c.classList.remove('open'); });

  card.classList.toggle('open', !isOpen);

  // Smooth scroll to card if opening
  if (!isOpen) {
    setTimeout(() => {
      const rect = card.getBoundingClientRect();
      const offset = 140;
      if (rect.top < offset) {
        window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: 'smooth' });
      }
    }, 50);
  }
}

/* ============================================================
   2. SERIES FILTER BUTTONS
   ============================================================ */
const filterBtns = document.querySelectorAll('.series-filter-btn');
const series1Sec = document.getElementById('series1-section');
const series2Sec = document.getElementById('series2-section');
const seriesDivider = document.querySelector('.series-divider');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    if (filter === 'all') {
      if (series1Sec) series1Sec.style.display = '';
      if (series2Sec) series2Sec.style.display = '';
      if (seriesDivider) seriesDivider.style.display = '';
    } else if (filter === 'series1') {
      if (series1Sec) series1Sec.style.display = '';
      if (series2Sec) series2Sec.style.display = 'none';
      if (seriesDivider) seriesDivider.style.display = 'none';
    } else if (filter === 'series2') {
      if (series1Sec) series1Sec.style.display = 'none';
      if (series2Sec) series2Sec.style.display = '';
      if (seriesDivider) seriesDivider.style.display = 'none';
    }

    // Scroll to main content
    const blogMain = document.querySelector('.blog-layout');
    if (blogMain) {
      window.scrollTo({ top: blogMain.offsetTop - 140, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   3. REAL-TIME SEARCH
   ============================================================ */
const searchInput = document.getElementById('blogSearch');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const allCards = document.querySelectorAll('.article-card');

    if (!query) {
      // Reset
      allCards.forEach(card => {
        card.classList.remove('hidden-by-search');
      });
      // Show both series headers & divider
      if (series1Sec) series1Sec.style.display = '';
      if (series2Sec) series2Sec.style.display = '';
      if (seriesDivider) seriesDivider.style.display = '';
      // Reset filter buttons
      filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
      return;
    }

    // Show all series when searching
    if (series1Sec) series1Sec.style.display = '';
    if (series2Sec) series2Sec.style.display = '';
    if (seriesDivider) seriesDivider.style.display = '';
    filterBtns.forEach(b => b.classList.remove('active'));

    let matchCount = 0;
    allCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.classList.remove('hidden-by-search');
        card.classList.add('open'); // Auto-open matching cards
        matchCount++;
      } else {
        card.classList.add('hidden-by-search');
        card.classList.remove('open');
      }
    });

    // Hide series sections that have no visible articles
    [series1Sec, series2Sec].forEach(sec => {
      if (!sec) return;
      const visible = sec.querySelectorAll('.article-card:not(.hidden-by-search)');
      sec.style.display = visible.length === 0 ? 'none' : '';
    });
  });

  // Keyboard shortcut: Escape to clear search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
    }
  });
}

/* ============================================================
   4. TAG CLOUD FILTERING
   ============================================================ */
const tagBtns = document.querySelectorAll('.tag-cloud-btn');

tagBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tagText = btn.getAttribute('data-tag');

    // Toggle active state
    const wasActive = btn.classList.contains('active');
    tagBtns.forEach(b => b.classList.remove('active'));

    if (!wasActive) {
      btn.classList.add('active');
      // Fill search box with tag
      if (searchInput) {
        searchInput.value = tagText;
        searchInput.dispatchEvent(new Event('input'));
      }
    } else {
      // Clear filter
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      }
    }
  });
});

/* ============================================================
   5. URL HASH — Auto-open article from URL (e.g., blog.html#article-5)
      Also scroll to hash section
   ============================================================ */
function handleHashNavigation() {
  const hash = window.location.hash;
  if (!hash) return;

  const target = document.querySelector(hash);
  if (!target) return;

  setTimeout(() => {
    const offset = 140;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });

    // If it's an article card, open it
    if (target.classList.contains('article-card')) {
      target.classList.add('open');
    }
  }, 500);
}

window.addEventListener('load', handleHashNavigation);

/* ============================================================
   6. PROGRESS INDICATOR — How far through the blog
   ============================================================ */
function createReadingProgress() {
  const progressBar = document.createElement('div');
  progressBar.id = 'readingProgress';
  progressBar.style.cssText = `
    position: fixed;
    top: 72px;
    left: 0;
    height: 3px;
    background: var(--accent);
    width: 0%;
    z-index: 999;
    transition: width 0.1s linear;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(progress, 100) + '%';
  }, { passive: true });
}
createReadingProgress();

/* ============================================================
   7. EXPAND ALL / COLLAPSE ALL (keyboard shortcut)
   ============================================================ */
document.addEventListener('keydown', (e) => {
  // Alt + E = Expand all
  if (e.altKey && e.key === 'e') {
    document.querySelectorAll('.article-card').forEach(c => c.classList.add('open'));
  }
  // Alt + C = Collapse all
  if (e.altKey && e.key === 'c') {
    document.querySelectorAll('.article-card').forEach(c => c.classList.remove('open'));
  }
});

/* ============================================================
   8. ARTICLE COUNT BADGE — Update dynamically
   ============================================================ */
function updateVisibleCount() {
  const total = document.querySelectorAll('.article-card:not(.hidden-by-search)').length;
  const filterAll = document.querySelector('[data-filter="all"]');
  if (filterAll && total !== 30) {
    filterAll.querySelector('span:last-child') ||
      (filterAll.innerHTML = `<span class="material-symbols-outlined">library_books</span>${total}件表示中`);
  }
}

/* ============================================================
   9. MOBILE — Sticky filter bar scroll behavior
   ============================================================ */
const seriesBar = document.querySelector('.blog-series-bar');
if (seriesBar) {
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 200) {
      // Scrolling down — hide filter bar (optional, keep it visible)
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

console.log('Blog JS loaded ✓ — Alt+E: Expand all, Alt+C: Collapse all');

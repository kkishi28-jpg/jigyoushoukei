/**
 * 事業承継コンサルティング — Main JavaScript
 */

/* ============================================================
   1. LOADER
   ============================================================ */
const loader = document.getElementById('loader');
if (loader) {
  document.body.style.overflow = 'hidden';
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 1800);
  });
}

/* ============================================================
   2. HEADER — Scroll behaviour
   ============================================================ */
const header = document.getElementById('header');
function handleHeaderScroll() {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

/* ============================================================
   3. MOBILE NAV
   ============================================================ */
const hamburger   = document.getElementById('hamburger');
const mobileNav   = document.getElementById('mobile-nav');
const mobileClose = document.getElementById('mobile-close');
const overlay     = document.getElementById('overlay');

function openMobileNav() {
  hamburger.classList.add('open');
  mobileNav.classList.add('open');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMobileNav);
mobileClose.addEventListener('click', closeMobileNav);
overlay.addEventListener('click', closeMobileNav);

// Close on nav link click
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

/* ============================================================
   4. SMOOTH SCROLL (for anchor links)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   5. REVEAL ANIMATIONS (Intersection Observer)
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay for grid items
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        const index = Array.from(siblings).indexOf(entry.target);
        const delay = Math.min(index * 100, 400);
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   6. COUNTER ANIMATIONS
   ============================================================ */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  const start = performance.now();

  function step(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

/* ============================================================
   7. SERVICE TABS
   ============================================================ */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');

    // Update buttons
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update panels
    tabPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `tab-${target}`) {
        panel.classList.add('active');
        // Trigger a small fade-in
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(12px)';
        requestAnimationFrame(() => {
          panel.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          panel.style.opacity = '1';
          panel.style.transform = 'translateY(0)';
        });
      }
    });
  });
});

/* ============================================================
   8. CASES SLIDER
   ============================================================ */
const track    = document.getElementById('casesTrack');
const dotsWrap = document.getElementById('sliderDots');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

if (track) {
  const cards = track.querySelectorAll('.case-card');
  const totalSlides = cards.length;
  let current = 0;
  let autoSlide;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `スライド ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w > 900) return 3;
    if (w > 600) return 1.6;
    return 1.1;
  }

  function updateSlider() {
    const visible  = getVisibleCount();
    const cardWidth = (track.parentElement.offsetWidth + 24) / visible;
    track.style.transform = `translateX(-${current * cardWidth}px)`;

    // Dots
    dotsWrap.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    const maxIndex = Math.max(0, totalSlides - Math.floor(getVisibleCount()));
    current = Math.min(Math.max(index, 0), maxIndex);
    updateSlider();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', () => { next(); resetAutoSlide(); });
  prevBtn.addEventListener('click', () => { prev(); resetAutoSlide(); });

  function startAutoSlide() {
    autoSlide = setInterval(() => {
      const maxIndex = Math.max(0, totalSlides - Math.floor(getVisibleCount()));
      if (current >= maxIndex) goTo(0);
      else next();
    }, 5000);
  }
  function resetAutoSlide() {
    clearInterval(autoSlide);
    startAutoSlide();
  }

  window.addEventListener('resize', updateSlider);
  updateSlider();
  startAutoSlide();

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAutoSlide();
    }
  });
}

/* ============================================================
   9. CONTACT FORM — Demo submit handler
   ============================================================ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Loading state
    submitBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite">refresh</span><span>送信中...</span>';
    submitBtn.disabled = true;

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1600));

    // Show success
    contactForm.style.display = 'none';
    const successEl = document.createElement('div');
    successEl.className = 'form-success';
    successEl.style.display = 'block';
    successEl.innerHTML = `
      <div class="success-icon">
        <span class="material-symbols-outlined" style="font-size:64px;color:#22c55e">check_circle</span>
      </div>
      <h3>お問い合わせありがとうございます</h3>
      <p>担当者より2営業日以内にご連絡いたします。<br />しばらくお待ちください。</p>
    `;
    contactForm.parentElement.appendChild(successEl);
  });
}

/* ============================================================
   10. SCROLL TO TOP
   ============================================================ */
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
}, { passive: true });
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   11. ACTIVE NAV LINK — Highlight on scroll
   ============================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const activeNavObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active-nav',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { threshold: 0.5, rootMargin: '-80px 0px -30% 0px' }
);
sections.forEach(s => activeNavObserver.observe(s));

/* ============================================================
   12. ADD SPIN KEYFRAME DYNAMICALLY
   ============================================================ */
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

/* ============================================================
   13. HERO PARALLAX (subtle)
   ============================================================ */
const heroBgImg = document.querySelector('.hero-bg-img');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBgImg.style.transform = `scale(1.08) translateY(${scrolled * 0.15}px)`;
    }
  }, { passive: true });
}

console.log('事業承継コンサルティング — JS loaded ✓');

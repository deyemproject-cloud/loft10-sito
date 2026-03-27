/* ============================================
   Loft10 — Animation Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Scroll-Reveal via IntersectionObserver ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('[data-animate]').forEach(el => {
    revealObserver.observe(el);
  });

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.counter, 10);
          const suffix = el.dataset.counterSuffix || '';
          const prefix = el.dataset.counterPrefix || '';

          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = prefix + Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  // ---- Parallax-Lite ----
  if (window.innerWidth > 768) {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            parallaxElements.forEach(el => {
              const speed = parseFloat(el.dataset.parallax) || 0.15;
              const rect = el.getBoundingClientRect();
              if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
                el.style.transform = `translateY(${scrollY * speed}px)`;
              }
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  // ---- Smooth Tab Switching (menu.html) ----
  const tabContents = document.querySelectorAll('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (tabContents.length && tabButtons.length) {
    window.switchTab = function(tabId) {
      const currentActive = document.querySelector('.tab-content.active');
      const newTab = document.getElementById(tabId);
      if (!newTab || currentActive === newTab) return;

      // Update buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      const targetBtn = document.querySelector('[data-tab="' + tabId + '"]');
      if (targetBtn) targetBtn.classList.add('active');

      // Fade out current
      if (currentActive) {
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(12px)';
        setTimeout(() => {
          currentActive.classList.remove('active');
          currentActive.style.opacity = '';
          currentActive.style.transform = '';

          // Fade in new
          newTab.classList.add('active');
          newTab.offsetHeight; // Force reflow
          newTab.style.opacity = '1';
          newTab.style.transform = 'translateY(0)';
        }, 200);
      } else {
        newTab.classList.add('active');
      }

      // Smooth scroll to tabs area
      const tabBar = document.querySelector('.tab-bar') || tabButtons[0]?.parentElement;
      if (tabBar) {
        const tabBarTop = tabBar.getBoundingClientRect().top + window.scrollY - 80;
        if (window.scrollY > tabBarTop + 100) {
          window.scrollTo({ top: tabBarTop, behavior: 'smooth' });
        }
      }
    };

    // Handle hash-based deep linking
    if (window.location.hash) {
      const tab = window.location.hash.substring(1);
      if (document.getElementById(tab)) {
        setTimeout(() => window.switchTab(tab), 100);
      }
    }
  }
});

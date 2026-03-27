/* ============================================
   Loft10 — Animation Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll-Reveal via IntersectionObserver ----
  if (!prefersReducedMotion) {
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
  } else {
    // Immediately show everything if reduced motion
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('is-visible');
    });
  }

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

          if (prefersReducedMotion) {
            el.textContent = prefix + target + suffix;
            counterObserver.unobserve(el);
            return;
          }

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
  if (!prefersReducedMotion && window.innerWidth > 768) {
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
              // Only apply parallax when element is near viewport
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
    // Make switchTab available globally (replaces inline version)
    window.switchTab = function(tabId) {
      const currentActive = document.querySelector('.tab-content.active');
      const newTab = document.getElementById(tabId);
      if (!newTab || currentActive === newTab) return;

      // Update buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      const targetBtn = document.querySelector('[data-tab="' + tabId + '"]');
      if (targetBtn) targetBtn.classList.add('active');

      if (prefersReducedMotion) {
        // Instant switch for reduced motion
        if (currentActive) currentActive.classList.remove('active');
        newTab.classList.add('active');
        return;
      }

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
          // Force reflow to restart transition
          newTab.offsetHeight;
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

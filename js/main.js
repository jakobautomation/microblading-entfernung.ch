/* ============================================
   MICROBLADING-ENTFERNUNG.CH – Main JS
   ============================================ */

(function() {
  'use strict';

  /* === ANALYTICS === */
  function _init() {
    try {
      var d = {
        url: location.pathname,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        screen_width: window.screen.width
      };
      var _k = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic2h2cW13ZGlkZml0cmlneHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA2ODksImV4cCI6MjA4OTY4NjY4OX0.oNKzZ1ZmqlcvDDmUvcGlBeWUgobogzyCD6PbomrS0k0';
      fetch('https://fbshvqmwdidfitrigxvp.supabase.co/rest/v1/page_views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': _k, 'Authorization': 'Bearer ' + _k },
        body: JSON.stringify(d),
        keepalive: true
      }).catch(function(){});
    } catch(e) {}
  }

  /* === NAVIGATION === */
  function initNav() {
    var nav = document.querySelector('.nav');
    var burger = document.querySelector('.nav-burger');
    var mobileNav = document.querySelector('.nav-mobile');
    if (!nav) return;
    window.addEventListener('scroll', function() {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
    if (burger && mobileNav) {
      burger.addEventListener('click', function() {
        mobileNav.classList.toggle('open');
      });
      mobileNav.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { mobileNav.classList.remove('open'); });
      });
    }
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (mobileNav && !nav.contains(e.target)) mobileNav.classList.remove('open');
    });
  }

  /* === STICKY BOTTOM CTA (mobile) === */
  function initStickyCta() {
    var stickyEl = document.querySelector('.sticky-cta');
    if (!stickyEl) return;
    var triggered = false;
    window.addEventListener('scroll', function() {
      if (!triggered && window.scrollY > 200) {
        stickyEl.classList.add('visible');
        triggered = true;
      }
    }, { passive: true });
  }

  /* === SCROLL REVEAL === */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function(el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) { io.observe(el); });
  }

  /* === FAQ ACCORDION === */
  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function(item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');
        // Close others
        items.forEach(function(other) {
          other.classList.remove('open');
          var a = other.querySelector('.faq-answer');
          if (a) a.style.maxHeight = '0';
          var b = other.querySelector('.faq-question');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* === INIT === */
  document.addEventListener('DOMContentLoaded', function() {
    _init();
    initNav();
    initStickyCta();
    initReveal();
    initFaq();
  });

})();

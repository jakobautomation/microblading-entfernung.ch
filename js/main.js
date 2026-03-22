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

  /* === WHATSAPP QR-CODE OVERLAY (nur Desktop) === */
  function initWhatsAppQR() {
    if (window.innerWidth < 768) return;

    var overlay = document.createElement('div');
    overlay.id = 'wa-qr-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'WhatsApp QR-Code');
    overlay.innerHTML =
      '<div class="wa-qr-modal">' +
        '<button class="wa-qr-close" aria-label="Schließen">&times;</button>' +
        '<div class="wa-qr-logo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
        '</div>' +
        '<h3>Mit dem Smartphone öffnen</h3>' +
        '<p>Scanne diesen QR-Code mit deiner Kamera-App</p>' +
        '<div class="wa-qr-img-wrap"><img id="wa-qr-img" src="" alt="WhatsApp QR-Code" width="200" height="200"></div>' +
        '<p class="wa-qr-hint">Du hast ein Smartphone dabei? <a id="wa-qr-direct" href="#" target="_blank" rel="noopener">Direkt öffnen →</a></p>' +
      '</div>';
    document.body.appendChild(overlay);

    function openOverlay(href) {
      var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=' + encodeURIComponent(href);
      document.getElementById('wa-qr-img').src = qrUrl;
      document.getElementById('wa-qr-direct').href = href;
      overlay.classList.add('active');
      overlay.querySelector('.wa-qr-close').focus();
    }

    function closeOverlay() {
      overlay.classList.remove('active');
    }

    overlay.querySelector('.wa-qr-close').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeOverlay();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeOverlay();
    });

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href*="wa.me"]');
      if (!link) return;
      e.preventDefault();
      openOverlay(link.getAttribute('href'));
    });
  }

  /* === TEL OVERLAY (nur Desktop) === */
  function initTelOverlay() {
    if (window.innerWidth < 768) return;

    var overlay = document.createElement('div');
    overlay.id = 'tel-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Telefonnummer');
    overlay.innerHTML =
      '<div class="tel-modal">' +
        '<button class="wa-qr-close" aria-label="Schließen">&times;</button>' +
        '<div class="tel-icon">📞</div>' +
        '<h3>Jetzt anrufen</h3>' +
        '<a id="tel-number" href="#" class="tel-number-display"></a>' +
        '<p class="wa-qr-hint" style="margin-top:1rem;">Einfach die Nummer wählen — wir sind Mo–Sa erreichbar.</p>' +
      '</div>';
    document.body.appendChild(overlay);

    function closeTelOverlay() { overlay.classList.remove('active'); }

    overlay.querySelector('.wa-qr-close').addEventListener('click', closeTelOverlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeTelOverlay();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeTelOverlay();
    });

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href^="tel:"]');
      if (!link) return;
      e.preventDefault();
      var href = link.getAttribute('href');
      var number = href.replace('tel:', '');
      // Formatiere Nummer lesbar: +41794132761 → +41 79 413 27 61
      var formatted = number
        .replace(/^\+41(\d{2})(\d{3})(\d{2})(\d{2})$/, '+41 $1 $2 $3 $4')
        .replace(/^\+49(\d{3})(\d{2})(\d{2})(\d{3})$/, '0$1 $2 $3 $4')
        .replace(/^\+49(\d+)/, '0$1');
      var el = document.getElementById('tel-number');
      el.href = href;
      el.textContent = formatted || number;
      overlay.classList.add('active');
      overlay.querySelector('.wa-qr-close').focus();
    });
  }

  /* === INIT === */
  document.addEventListener('DOMContentLoaded', function() {
    _init();
    initNav();
    initStickyCta();
    initReveal();
    initFaq();
    initWhatsAppQR();
    initTelOverlay();
  });

})();

/**
 * Pragma motion & micro-interaction layer.
 * Purely presentational — no form submission, referral, or backend logic here.
 *
 * Architecture:
 *   1. Navbar: scrolled state, hide-on-scroll-down, active section link
 *   2. Word-level text reveals for display headings
 *   3. Scroll-reveal observer
 *   4. Stat counters
 *   5. Animated FAQ open/close
 *   6. CTA scroll-to-form with attention ring
 *   7. Copy referral link (confirmation page)
 *   8. Ambient frame loop: layered parallax, chip float, protocol-card tilt
 *
 * Everything animates transform/opacity/filter only, and every behavior
 * is disabled under prefers-reduced-motion.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ── 1. Navbar ───────────────────────────────────────────────────────

  var nav = document.querySelector('.nav');
  var lastY = window.scrollY;
  var navHidden = false;

  function onNavScroll() {
    if (!nav) return;
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 8);
    if (!reduced) {
      var goingDown = y > lastY + 6;
      var goingUp = y < lastY - 6;
      if (goingDown && y > 520 && !navHidden && !nav.contains(document.activeElement)) {
        nav.classList.add('nav-hidden');
        navHidden = true;
      } else if ((goingUp || y <= 520) && navHidden) {
        nav.classList.remove('nav-hidden');
        navHidden = false;
      }
    }
    lastY = y;
  }
  document.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // Active section highlighting in the nav
  if ('IntersectionObserver' in window) {
    var sectionLinks = {};
    document.querySelectorAll('.nav-link[href^="#"]').forEach(function (a) {
      sectionLinks[a.getAttribute('href').slice(1)] = a;
    });
    var ids = Object.keys(sectionLinks);
    if (ids.length) {
      var navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          ids.forEach(function (id) { sectionLinks[id].classList.remove('active'); });
          sectionLinks[entry.target.id].classList.add('active');
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      ids.forEach(function (id) {
        var section = document.getElementById(id);
        if (section) navIO.observe(section);
      });
    }
  }

  // ── 2. Word-level text reveals ──────────────────────────────────────

  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.setAttribute('aria-label', (el.innerText || el.textContent).replace(/\s+/g, ' ').trim());
    var wordIndex = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          // Split on plain whitespace only — preserves &nbsp; joins.
          child.textContent.split(/([ \t\r\n]+)/).forEach(function (part) {
            if (!part) return;
            if (/^[ \t\r\n]+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            var w = document.createElement('span');
            w.className = 'wd';
            w.setAttribute('aria-hidden', 'true');
            w.style.setProperty('--wi', Math.min(wordIndex++, 18));
            w.textContent = part;
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    }
    walk(el);
    el.classList.add('split');
    el.dataset.splitDone = '1';
  }

  if (!reduced) {
    document
      .querySelectorAll('.hero h1, .h2, .interrupt blockquote, .final h2, .confirm-success h1')
      .forEach(splitWords);
  }

  // ── 3. Living scroll reveals ────────────────────────────────────────
  //
  // First entrance: the full choreographed reveal (.in — kept forever,
  // so word cascades, counters, and ripples never replay).
  // Every later exit/re-entry: a quiet fade-up (.r/.r-out toggling),
  // so the page keeps responding on every pass without being dramatic.

  var revealEls = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var enterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.classList.contains('in')) {
          el.classList.remove('r-out'); // repeat pass: subtle fade-up
        } else {
          el.classList.add('in');       // first pass: full reveal
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    // Arms the re-entrance only once the element is FULLY outside the
    // viewport plus a 60px buffer — the reset is never visible, so
    // nothing pops out of view while on screen.
    var exitIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (!entry.isIntersecting && el.classList.contains('in')) {
          el.classList.add('r');
          el.classList.add('r-out');
        }
      });
    }, { threshold: 0, rootMargin: '60px 0px 60px 0px' });

    revealEls.forEach(function (el) {
      enterIO.observe(el);
      exitIO.observe(el);
    });
  }

  // ── 4. Stat counters ────────────────────────────────────────────────

  function startCounter(el) {
    if (reduced || !el || el.dataset.counted) return;
    var node = null;
    for (var i = 0; i < el.childNodes.length; i++) {
      var c = el.childNodes[i];
      if (c.nodeType === 3 && /\d/.test(c.textContent)) { node = c; break; }
    }
    if (!node) return;
    var m = node.textContent.trim().match(/^([^\d]*)([\d,]+)$/);
    if (!m) return;
    var prefix = m[1] || '';
    var target = parseInt(m[2].replace(/,/g, ''), 10);
    if (!target || target < 2) return;
    var comma = m[2].indexOf(',') !== -1;
    el.dataset.counted = '1';

    var duration = 1250;
    var startTs = null;
    function fmt(v) { return prefix + (comma ? v.toLocaleString('en-US') : String(v)); }
    node.textContent = fmt(0);
    function tick(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min((ts - startTs) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      node.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var statEls = document.querySelectorAll('.stat-num');
  if (statEls.length && !reduced && 'IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          counterIO.unobserve(entry.target);
          startCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { counterIO.observe(el); });
  }

  // Confirmation page: count up the waitlist position once the inline
  // page logic (registered earlier, so it runs first) has set the value.
  if (document.getElementById('position-number') && !reduced) {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        startCounter(document.getElementById('position-number'));
      }, 80);
    });
  }

  // ── 5. Animated FAQ open/close ──────────────────────────────────────

  if (!reduced && typeof Element.prototype.animate === 'function') {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var summary = item.querySelector('summary');
      var panel = item.querySelector('p');
      if (!summary || !panel) return;
      var animating = false;

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (animating) return;
        animating = true;

        var cs = getComputedStyle(panel);
        var padBottom = cs.paddingBottom;
        var padTotal = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);

        if (item.open) {
          item.classList.add('closing');
          var contentH = panel.offsetHeight - padTotal;
          panel.style.overflow = 'hidden';
          var closeAnim = panel.animate([
            { height: contentH + 'px', paddingBottom: padBottom, opacity: 1, transform: 'none' },
            { height: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-6px)' }
          ], { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
          closeAnim.onfinish = function () {
            item.open = false;
            item.classList.remove('closing');
            panel.style.overflow = '';
            animating = false;
          };
        } else {
          item.open = true;
          var openH = panel.offsetHeight - padTotal;
          panel.style.overflow = 'hidden';
          var openAnim = panel.animate([
            { height: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-6px)' },
            { height: openH + 'px', paddingBottom: padBottom, opacity: 1, transform: 'none' }
          ], { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
          openAnim.onfinish = function () {
            panel.style.overflow = '';
            animating = false;
          };
        }
      });
    });
  }

  // ── 6. "Get my stack" buttons → return to the hero at the top ───────
  //
  // Every CTA brings the visitor all the way back to the very top of
  // the page, exactly like a fresh load: hero headline, hero CTA, and
  // hero email input all fully in view. The scroll is driven frame by
  // frame on the scrolling element itself (rather than window.scrollTo)
  // so the landing position is guaranteed to be 0 — it can never get
  // stuck halfway down. Once there, the email field is gently focused
  // (preventScroll keeps the viewport pinned to the top, so it is never
  // re-centered on the input).

  var scrollEl = document.scrollingElement || document.documentElement;

  function smoothToTop(done) {
    var start = scrollEl.scrollTop;
    if (reduced || start <= 0) {
      scrollEl.scrollTop = 0;
      if (done) done();
      return;
    }
    var duration = Math.min(950, 420 + start * 0.16);
    var startTs = null;
    function step(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min((ts - startTs) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic — smooth, no bounce
      scrollEl.scrollTop = Math.round(start * (1 - eased));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        scrollEl.scrollTop = 0; // pin exactly to the hero
        if (done) done();
      }
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('[data-scroll-to-form]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      smoothToTop(function () {
        var form = document.querySelector('.hero-email');
        var input = form ? form.querySelector('input[type="email"]') : null;
        if (input) input.focus({ preventScroll: true });
        if (form && !reduced) {
          form.classList.remove('form-flash');
          void form.offsetWidth;
          form.classList.add('form-flash');
          setTimeout(function () { form.classList.remove('form-flash'); }, 1300);
        }
      });
    });
  });

  document.querySelectorAll('[data-open-guide-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof window.openGuideModal === 'function') window.openGuideModal();
    });
  });

  // Auto-open modal when URL contains ?guide=open (links from about/partner pages)
  if (/[?&]guide=open/.test(window.location.search)) {
    if (typeof window.openGuideModal === 'function') {
      window.openGuideModal();
    } else {
      document.addEventListener('pragma:ready', function () { window.openGuideModal(); }, { once: true });
    }
  }

  // ── 7. Copy referral link (confirmation page) ──────────────────────

  var copyBtn = document.getElementById('copy-referral');
  if (copyBtn) {
    var defaultHtml = copyBtn.innerHTML;
    copyBtn.addEventListener('click', function () {
      var codeEl = document.getElementById('referral-code');
      var code = codeEl ? codeEl.textContent.trim() : '';
      if (!code || /loading|error|missing/i.test(code)) return;

      var link = window.location.origin + '/?ref=' + encodeURIComponent(code);

      function flashCopied() {
        copyBtn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> Link copied';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.innerHTML = defaultHtml;
          copyBtn.classList.remove('copied');
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(flashCopied, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = link;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); flashCopied(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  }

  // ── 8. Ambient frame loop: parallax, chip float, card tilt ─────────
  //
  // One requestAnimationFrame loop drives every scroll-linked transform.
  // Desktop fine-pointer only; cleanly disengages if the viewport
  // shrinks, restoring the pure-CSS behaviors.

  var motionOK = !reduced && finePointer;

  var pxItems = [];
  document.querySelectorAll('[data-px]').forEach(function (el) {
    pxItems.push({
      el: el,
      factor: parseFloat(el.getAttribute('data-px')) || 0.05,
      y: 0,
      inSince: 0,
      ready: !el.classList.contains('reveal') // reveal elements wait for their entrance
    });
  });

  var card = document.querySelector('.protocol-card');
  var chipEls = document.querySelectorAll('.float-chip');
  var chips = [];
  var tilt = { tx: 0, ty: 0, cx: 0, cy: 0, bound: false };
  var heroOnScreen = true;
  var engaged = false;

  var heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroOnScreen = entries[0].isIntersecting;
    }, { rootMargin: '120px' }).observe(heroVisual);
  }

  function wideEnough() { return window.innerWidth > 980; }

  function engage() {
    if (engaged) return;
    engaged = true;
    chips = [];
    chipEls.forEach(function (el, i) {
      el.classList.add('js-float');
      chips.push({ el: el, phase: i * 2.4, speed: 0.00048 + i * 0.00014, amp: 5 + i * 2 });
    });
    if (card && !tilt.bound) {
      tilt.bound = true;
      card.addEventListener('pointermove', function (e) {
        if (!engaged) return;
        var r = card.getBoundingClientRect();
        tilt.ty = ((e.clientX - r.left) / r.width - 0.5) * 4;
        tilt.tx = ((e.clientY - r.top) / r.height - 0.5) * -4;
      });
      card.addEventListener('pointerleave', function () {
        tilt.tx = 0;
        tilt.ty = 0;
      });
    }
  }

  function disengage() {
    if (!engaged) return;
    engaged = false;
    chips.forEach(function (c) {
      c.el.classList.remove('js-float');
      c.el.style.transform = '';
    });
    chips = [];
    pxItems.forEach(function (it) {
      it.el.style.transform = '';
      it.y = 0;
    });
    if (card) card.style.transform = '';
    tilt.tx = tilt.ty = tilt.cx = tilt.cy = 0;
  }

  function frame(t) {
    if (wideEnough()) { engage(); } else { disengage(); }

    if (engaged) {
      var vh = window.innerHeight;

      // Layered parallax — elements glide toward the viewport center,
      // each at its own depth factor.
      for (var i = 0; i < pxItems.length; i++) {
        var it = pxItems[i];
        if (!it.ready) {
          if (!it.el.classList.contains('in')) continue;
          if (!it.inSince) it.inSince = t;
          if (t - it.inSince < 1000) continue; // let the entrance finish
          it.ready = true;
          it.el.classList.add('px-on');
        }
        var r = it.el.getBoundingClientRect();
        var baseCenter = r.top + r.height / 2 - it.y;
        if (baseCenter > -vh && baseCenter < vh * 2) {
          var ny = (vh / 2 - baseCenter) * it.factor;
          if (Math.abs(ny - it.y) > 0.1) {
            it.y = ny;
            it.el.style.transform = 'translate3d(0,' + ny.toFixed(2) + 'px,0)';
          }
        }
      }

      if (heroOnScreen) {
        // Floating chips — sine drift, each on its own period.
        for (var j = 0; j < chips.length; j++) {
          var c = chips[j];
          c.el.style.transform =
            'translate3d(0,' + (Math.sin(t * c.speed + c.phase) * c.amp).toFixed(2) + 'px,0)';
        }
        // Protocol card tilt — lerped toward the pointer for weight.
        if (card) {
          tilt.cx += (tilt.tx - tilt.cx) * 0.085;
          tilt.cy += (tilt.ty - tilt.cy) * 0.085;
          if (Math.abs(tilt.cx) > 0.02 || Math.abs(tilt.cy) > 0.02) {
            card.style.transform =
              'perspective(1100px) rotateX(' + tilt.cx.toFixed(2) + 'deg) rotateY(' + tilt.cy.toFixed(2) + 'deg)';
          } else if (card.style.transform) {
            card.style.transform = '';
          }
        }
      }
    }
    requestAnimationFrame(frame);
  }

  if (motionOK && (pxItems.length || card || chipEls.length)) {
    requestAnimationFrame(frame);
  }

  // ── 9. Scroll-driven how-it-works timeline ─────────────────────────
  //
  // As the user scrolls, each step circle fills with color, the connector
  // line animates downward, and the mock app card switches panels to
  // match. Uses getBoundingClientRect on scroll (cheap — only 4 elements)
  // rather than IntersectionObserver so the active step tracks smoothly
  // in both scroll directions.

  (function () {
    var howSection = document.querySelector('.how-section');
    var howPreview = document.querySelector('.how-preview[data-active]');
    var stepRows   = Array.prototype.slice.call(document.querySelectorAll('.step-row[data-step]'));
    var panelEls   = Array.prototype.slice.call(document.querySelectorAll('.mock-panel[data-panel]'));

    if (!stepRows.length) return;

    var currentActive = 0;

    function activateStep(n) {
      if (n === currentActive) return;
      currentActive = n;

      stepRows.forEach(function (row) {
        var rn = parseInt(row.getAttribute('data-step'), 10);
        row.classList.remove('step-active', 'step-done');
        if (rn < n) row.classList.add('step-done');
        else if (rn === n) row.classList.add('step-active');
      });

      if (howPreview) howPreview.setAttribute('data-active', String(n));

      panelEls.forEach(function (p) {
        var pn = parseInt(p.getAttribute('data-panel'), 10);
        p.classList.toggle('is-active', pn === n);
      });
    }

    // Initialize: panel 1 active right away.
    activateStep(1);

    if (reduced) return;

    function onScroll() {
      var vh  = window.innerHeight;
      var trigger = vh * 0.45; // step becomes active when its top crosses 45% down the viewport
      var best = 1;

      for (var i = 0; i < stepRows.length; i++) {
        var rect = stepRows[i].getBoundingClientRect();
        if (rect.top < trigger) {
          best = parseInt(stepRows[i].getAttribute('data-step'), 10);
        }
      }

      activateStep(best);
    }

    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }());

}());

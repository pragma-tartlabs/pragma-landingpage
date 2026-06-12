/**
 * Pragma motion & micro-interaction layer.
 * Purely presentational — no form submission, referral, or backend logic here.
 */
(function () {

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Nav scroll state ───────────────────────────────────────────────
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Scroll-reveal ──────────────────────────────────────────────────
  var revealEls = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ── "Join" buttons that jump to the nearest signup form ───────────
  document.querySelectorAll('[data-scroll-to-form]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var form = document.querySelector('.hero-email') || document.querySelector('.final-form');
      if (!form) return;
      form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      var input = form.querySelector('input[type="email"]');
      if (input) {
        setTimeout(function () {
          input.focus({ preventScroll: true });
        }, reduced ? 0 : 500);
      }
    });
  });

  // ── Copy referral link (confirmation page) ─────────────────────────
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
        try { document.execCommand('copy'); flashCopied(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

}());

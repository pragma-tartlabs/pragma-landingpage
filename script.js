(function () {

  // ── Supabase client ────────────────────────────────────────────────────────

  var supabaseClient = null;

  function getClient() {
    if (supabaseClient) return supabaseClient;

    var cfg = window.PRAGMA_CONFIG;
    if (!cfg || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      throw new Error('[Pragma] Supabase config missing. Check config.local.js.');
    }
    if (!window.supabase) {
      throw new Error('[Pragma] Supabase JS library not loaded.');
    }

    supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    return supabaseClient;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function generateReferralCode() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = '';
    for (var i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name) || null;
  }

  /**
   * Returns true only for addresses that have:
   *   - a non-empty local part (no leading @)
   *   - an @ sign
   *   - a domain segment with at least one dot
   *   - a TLD of 2+ non-whitespace, non-@ characters
   *
   * Rejects: abc  abc@  @abc  abc@abc  abc@gmail  abc@gmail.
   * Accepts: abc@gmail.com  test@example.org  hello@pragmahealth.io
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  // ── Core signup flow ───────────────────────────────────────────────────────

  async function addToKit(email, firstName) {
    // Non-blocking: call Kit API via Netlify Function.
    // If it fails, log it but don't block the confirmation page redirect.
    try {
      var response = await fetch('/.netlify/functions/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, first_name: firstName || '' }),
      });
      if (!response.ok) {
        console.warn('[Pragma] Kit subscription failed:', response.status);
      }
    } catch (err) {
      console.warn('[Pragma] Kit request failed:', err);
    }
  }

  async function signUp(email, firstName) {
    var client = getClient();

    // Count existing rows to derive position.
    // Uses head:true so PostgREST returns only the count header — no row data.
    var countResult = await client
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (countResult.error) throw countResult.error;

    var position = (countResult.count || 0) + 1;
    var referralCode = generateReferralCode();

    var insertResult = await client
      .from('waitlist')
      .insert({
        email:         email,
        first_name:    firstName || null,
        referral_code: referralCode,
        referred_by:   getUrlParam('ref'),
        position:      position,
        status:        'pending',
        utm_source:    getUrlParam('utm_source'),
        utm_medium:    getUrlParam('utm_medium'),
        utm_campaign:  getUrlParam('utm_campaign'),
      });

    if (insertResult.error) {
      // Postgres unique-violation code: 23505
      if (insertResult.error.code === '23505') {
        var dup = new Error('duplicate');
        dup.type = 'duplicate';
        throw dup;
      }
      throw insertResult.error;
    }

    // Await Kit subscription before returning so the fetch isn't cancelled
    // by the page redirect. addToKit never throws — failure is swallowed.
    await addToKit(email, firstName);

    return { position: position, referralCode: referralCode };
  }

  // ── Form state helpers ─────────────────────────────────────────────────────

  function setFormState(btn, inputs, state) {
    var states = {
      submitting: { text: 'Joining…',            btnDisabled: true,  inputDisabled: true  },
      success:    { text: 'You\'re on the list!', btnDisabled: true,  inputDisabled: false },
      duplicate:  { text: 'Already on the list!', btnDisabled: true,  inputDisabled: false },
      error:      { text: 'Error — try again?',   btnDisabled: false, inputDisabled: false },
    };
    var s = states[state];
    btn.textContent = s.text;
    btn.disabled    = s.btnDisabled;
    inputs.forEach(function (inp) { inp.disabled = s.inputDisabled; });
  }

  // ── Shared submit handler ──────────────────────────────────────────────────

  async function handleSubmit(btn, nameInput, emailInput, modalEl) {
    var firstName = nameInput ? nameInput.value.trim() : '';
    var email     = emailInput.value.trim().toLowerCase();
    var inputs    = [emailInput].concat(nameInput ? [nameInput] : []);

    if (nameInput && !firstName) {
      nameInput.setCustomValidity('Please enter your first name');
      nameInput.reportValidity();
      nameInput.focus();
      return;
    }
    if (nameInput) nameInput.setCustomValidity('');

    if (!email || !isValidEmail(email)) {
      emailInput.setCustomValidity('Please enter a valid email address (e.g. you@example.com)');
      emailInput.reportValidity();
      emailInput.focus();
      return;
    }
    emailInput.setCustomValidity('');

    setFormState(btn, inputs, 'submitting');

    try {
      var result = await signUp(email, firstName);
      if (modalEl) modalEl.classList.remove('is-open');
      var confirmUrl = 'confirm.html?' +
        'email=' + encodeURIComponent(email) +
        '&position=' + encodeURIComponent(result.position);
      window.location.href = confirmUrl;
    } catch (err) {
      if (err.type === 'duplicate') {
        btn.textContent = 'Finding your spot…';
        btn.disabled = true;
        try {
          var client = getClient();
          var lookup = await client
            .from('waitlist')
            .select('position')
            .eq('email', email)
            .single();
          if (lookup.error) throw lookup.error;
          if (modalEl) modalEl.classList.remove('is-open');
          var confirmUrl = 'confirm.html?' +
            'email=' + encodeURIComponent(email) +
            '&position=' + encodeURIComponent(lookup.data.position);
          window.location.href = confirmUrl;
        } catch (lookupErr) {
          console.error('[Pragma] Position lookup failed:', lookupErr);
          setFormState(btn, inputs, 'duplicate');
        }
      } else {
        console.error('[Pragma] Signup error:', err);
        setFormState(btn, inputs, 'error');
        emailInput.focus();
      }
    }
  }

  // ── Form binding ───────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {

    // Modal form
    var modal     = document.getElementById('guide-modal');
    var modalForm = modal ? modal.querySelector('.modal-form') : null;
    if (modal && modalForm) {
      var modalBtn        = modalForm.querySelector('button[type="submit"]');
      var modalNameInput  = modalForm.querySelector('input[name="first_name"]');
      var modalEmailInput = modalForm.querySelector('input[type="email"]');

      modalNameInput.addEventListener('input', function () { modalNameInput.setCustomValidity(''); });
      modalEmailInput.addEventListener('input', function () { modalEmailInput.setCustomValidity(''); });

      modalBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleSubmit(modalBtn, modalNameInput, modalEmailInput, modal);
      });

      // Close on backdrop click
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('is-open');
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') modal.classList.remove('is-open');
      });

      // Close button
      var closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () { modal.classList.remove('is-open'); });
      }
    }

    // Expose opener for motion.js and inline onclick
    window.openGuideModal = function () {
      if (modal) {
        modal.classList.add('is-open');
        if (modalNameInput) modalNameInput.focus();
      }
    };

    // Auto-open when navigated from about/partner pages via ?guide=open
    if (new URLSearchParams(window.location.search).get('guide') === 'open') {
      window.openGuideModal();
      history.replaceState(null, '', window.location.pathname);
    }

  });

}());

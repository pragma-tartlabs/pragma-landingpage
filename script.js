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

  async function addToKit(email) {
    // Non-blocking: call Kit API via Netlify Function.
    // If it fails, log it but don't block the confirmation page redirect.
    try {
      var response = await fetch('/.netlify/functions/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });
      if (!response.ok) {
        console.warn('[Pragma] Kit subscription failed:', response.status);
      }
    } catch (err) {
      console.warn('[Pragma] Kit request failed:', err);
    }
  }

  async function signUp(email) {
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
    await addToKit(email);

    return { position: position, referralCode: referralCode };
  }

  // ── Form state helpers ─────────────────────────────────────────────────────

  function setFormState(btn, input, state) {
    var states = {
      submitting: { text: 'Joining…',            btnDisabled: true,  inputDisabled: true  },
      success:    { text: 'You\'re on the list!', btnDisabled: true,  inputDisabled: false },
      duplicate:  { text: 'Already on the list!', btnDisabled: true,  inputDisabled: false },
      error:      { text: 'Error — try again?',   btnDisabled: false, inputDisabled: false },
    };
    var s = states[state];
    btn.textContent   = s.text;
    btn.disabled      = s.btnDisabled;
    input.disabled    = s.inputDisabled;
  }

  // ── Form binding ───────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('.hero-email, .final-form');

    forms.forEach(function (form) {
      var btn   = form.querySelector('button');
      var input = form.querySelector('input[type="email"]');

      input.addEventListener('input', function () {
        input.setCustomValidity('');
      });

      btn.addEventListener('click', async function (e) {
        e.preventDefault();

        var email = input.value.trim().toLowerCase();

        if (!email || !isValidEmail(email)) {
          input.setCustomValidity('Please enter a valid email address (e.g. you@example.com)');
          input.reportValidity();
          input.focus();
          return;
        }
        input.setCustomValidity('');

        setFormState(btn, input, 'submitting');

        try {
          var result = await signUp(email);
          // Redirect to confirmation page with email and position
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
              var confirmUrl = 'confirm.html?' +
                'email=' + encodeURIComponent(email) +
                '&position=' + encodeURIComponent(lookup.data.position);
              window.location.href = confirmUrl;
            } catch (lookupErr) {
              console.error('[Pragma] Position lookup failed:', lookupErr);
              setFormState(btn, input, 'duplicate');
            }
          } else {
            console.error('[Pragma] Signup error:', err);
            setFormState(btn, input, 'error');
            input.focus();
          }
        }
      });
    });
  });

}());

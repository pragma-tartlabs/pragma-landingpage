/**
 * Pragma Application Configuration
 *
 * Reads from window.PRAGMA_CONFIG (set by config.local.js in dev,
 * or injected by the hosting platform at build time in production).
 *
 * FRONTEND-SAFE (public, anon key has RLS + rate limiting):
 *   supabaseUrl, supabaseAnonKey, siteUrl, appEnv
 *
 * SERVER-SIDE ONLY (never put these here):
 *   SUPABASE_SERVICE_ROLE_KEY, CONVERTKIT_API_KEY
 */

(function () {
  var src = window.PRAGMA_CONFIG || {};

  window.PRAGMA_CONFIG = {
    supabaseUrl:     src.supabaseUrl     || '',
    supabaseAnonKey: src.supabaseAnonKey || '',
    siteUrl:         src.siteUrl         || window.location.origin,
    appEnv:          src.appEnv          || 'production',
    hasBackendApi:   src.hasBackendApi   || false,
  };

  var missing = ['supabaseUrl', 'supabaseAnonKey'].filter(function (k) {
    return !window.PRAGMA_CONFIG[k];
  });

  if (missing.length > 0) {
    console.warn(
      '[Pragma] Missing config keys: ' + missing.join(', ') + '. ' +
      'Copy config.local.js.example → config.local.js and populate your Supabase credentials.'
    );
  }
}());

#!/usr/bin/env node
/**
 * Pragma build script
 * Generates config.local.js from Netlify environment variables.
 * Runs once at deploy time; the output is served as a static file.
 */

'use strict';

var fs = require('fs');

var SUPABASE_URL     = process.env.SUPABASE_URL;
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
var SITE_URL         = process.env.SITE_URL || 'https://pragma.health';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[build] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

var config = {
  supabaseUrl:     SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
  siteUrl:         SITE_URL,
  appEnv:          'production',
  hasBackendApi:   false,
};

var output = 'window.PRAGMA_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n';

fs.writeFileSync('config.local.js', output, 'utf8');
console.log('[build] config.local.js generated from environment variables.');

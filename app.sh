#!/usr/bin/env sh

# /config.js is written only when MATOMO_URL is set. Site id is included only when it is set too.
if [ -n "$MATOMO_URL" ]; then
  node <<'EOF'
const fs = require('fs');
const config = {};
if (process.env.MATOMO_URL) config.matomoUrl = process.env.MATOMO_URL;
if (process.env.MATOMO_SITE_ID) config.matomoSiteId = process.env.MATOMO_SITE_ID;
fs.writeFileSync('dist/config.js', `window.__CONFIG__ = ${JSON.stringify(config)};\n`);
EOF
fi

serve -p 1234 -s dist/.

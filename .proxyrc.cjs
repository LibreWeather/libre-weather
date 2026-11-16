const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env.development') });

// Dev stand-in for app.sh: /config.js exists only when MATOMO_URL is set.
module.exports = (app) => {
  app.use((req, res, next) => {
    if ((req.url || '').split('?')[0] !== '/config.js') return next();

    const matomoUrl = process.env.MATOMO_URL;
    if (!matomoUrl) {
      res.statusCode = 404;
      res.end();
      return;
    }

    const config = { matomoUrl };
    if (process.env.MATOMO_SITE_ID) config.matomoSiteId = process.env.MATOMO_SITE_ID;
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(`window.__CONFIG__ = ${JSON.stringify(config)};\n`);
  });
};

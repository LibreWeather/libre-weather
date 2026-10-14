# [1.8.0](https://github.com/LibreWeather/libre-weather/compare/v1.7.0...v1.8.0) (2026-10-14)


### Bug Fixes

* log handled fetch errors as warnings (avoids Parcel dev overlay) ([c5519ca](https://github.com/LibreWeather/libre-weather/commit/c5519ca83f42e60881ddc4cc2a492fc588dbe514))


### Features

* useFetch (axios-hooks style, native fetch) and useStorage; providers use them ([c4fc822](https://github.com/LibreWeather/libre-weather/commit/c4fc8224981e6282b34a5299064da3e195dd920e))

# [1.7.0](https://github.com/LibreWeather/libre-weather/compare/v1.6.0...v1.7.0) (2026-10-13)


### Features

* 12/24-hour time from the browser locale ([56c6f9a](https://github.com/LibreWeather/libre-weather/commit/56c6f9a60c20367d05fbbcee3b8cabc368b14786))
* condensed view with navbar summary on scroll and compact layout preference ([67f45f3](https://github.com/LibreWeather/libre-weather/commit/67f45f3f93fcca3f9726875cbc57e7183fabf091))
* default temperature units from the browser locale ([6a2c938](https://github.com/LibreWeather/libre-weather/commit/6a2c9388db3c19a0ae91f012311d193eb051a91c))
* preferences panel for units, clock, alerts, motion and transparency ([1d85cd6](https://github.com/LibreWeather/libre-weather/commit/1d85cd6db0c10cef6d632abb3e3479514ad590b5))
* remember open forecast days across refreshes and reloads ([b566b33](https://github.com/LibreWeather/libre-weather/commit/b566b330ed4db1eaf2c8c8e47729c55631ba2d30))
* view full alert from the collapsed alert bar ([d99110d](https://github.com/LibreWeather/libre-weather/commit/d99110d364a9f1a94d56dc73d0d87580bf7396af))

# [1.6.0](https://github.com/LibreWeather/libre-weather/compare/v1.5.0...v1.6.0) (2026-10-13)


### Features

* dismissible install banner ([c5fb67e](https://github.com/LibreWeather/libre-weather/commit/c5fb67ee4cabdcc717dae2049e69ddf747ff91ba))

# [1.5.0](https://github.com/LibreWeather/libre-weather/compare/v1.4.0...v1.5.0) (2026-10-13)


### Features

* expand today by default ([b127eb5](https://github.com/LibreWeather/libre-weather/commit/b127eb57500e6a90f2a8e2aaf8ef5ebf81ae3bf3))
* full alert details in a shareable dialog ([fb19b04](https://github.com/LibreWeather/libre-weather/commit/fb19b04269859dfef5a6674354e1914fe29b2a35))

# [1.4.0](https://github.com/LibreWeather/libre-weather/compare/v1.3.0...v1.4.0) (2026-10-13)


### Bug Fixes

* remember the chosen location across reloads ([ebc4838](https://github.com/LibreWeather/libre-weather/commit/ebc483874259bc0fe5028ec848cf9d5c44417e01))
* weather skeleton ([bbff845](https://github.com/LibreWeather/libre-weather/commit/bbff845a70c833603032869e38bade69a3f862c6))


### Features

* **pwa:** installable manifest, offline service worker, mobile/HD layout, loading skeleton ([a8563cb](https://github.com/LibreWeather/libre-weather/commit/a8563cb6339e8c3fb1e4f887875f7b136d909208)), closes [#7](https://github.com/LibreWeather/libre-weather/issues/7)
* show active weather alerts from NWS and MET Norway ([2496410](https://github.com/LibreWeather/libre-weather/commit/24964105d9430e39d9714ee9518ad92927e6d852))

# [1.3.0](https://github.com/LibreWeather/libre-weather/compare/v1.2.0...v1.3.0) (2026-10-13)


### Features

* **ui:** floating navbar, grouped forecast card, rounded overview; expand cypress e2e ([6160087](https://github.com/LibreWeather/libre-weather/commit/61600876922cbe640d30f156989b8e1c0acbe860))

# [1.2.0](https://github.com/LibreWeather/libre-weather/compare/v1.1.0...v1.2.0) (2026-10-13)


### Features

* chart today from midnight with a now marker ([e4fdbc9](https://github.com/LibreWeather/libre-weather/commit/e4fdbc94167a9744d2c81322ebb4a10649121ada))

# [1.1.0](https://github.com/LibreWeather/libre-weather/compare/v1.0.5...v1.1.0) (2026-10-13)


### Bug Fixes

* Bootstrap 5 layout, brand cluster, and type ([#68](https://github.com/LibreWeather/libre-weather/issues/68)) ([7cc9506](https://github.com/LibreWeather/libre-weather/commit/7cc95069e7ae0ab10f92ec5e6d25de41dc037e63))
* **ci:** load semantic-release config from mjs ([2ae3201](https://github.com/LibreWeather/libre-weather/commit/2ae320185a1e39488b0e550e0d902cde14779244))
* **ci:** move semantic-release config to root ([566405a](https://github.com/LibreWeather/libre-weather/commit/566405a261625ce2dbed7dae5a5e456ab5980cef))
* **ci:** resolve semantic-release plugins from action ([d8e5c9f](https://github.com/LibreWeather/libre-weather/commit/d8e5c9fa895cb70835e62df8f7075112d1910e4d))
* **ci:** skip husky hooks in release ([b8a5830](https://github.com/LibreWeather/libre-weather/commit/b8a5830b67d8b53caafa7daefc8caa4f5a5fd6c2))
* **deps:** bump brace-expansion from 1.1.13 to 1.1.18 ([#62](https://github.com/LibreWeather/libre-weather/issues/62)) ([e4b1099](https://github.com/LibreWeather/libre-weather/commit/e4b10993c43610ffe606093f7656608b47db4cb2))
* **deps:** bump decode-uri-component and @testing-library/jest-dom ([#63](https://github.com/LibreWeather/libre-weather/issues/63)) ([d0bf4c6](https://github.com/LibreWeather/libre-weather/commit/d0bf4c6f71253d6dbe0ea6efa7a0e01340bd7bed))
* **deps:** bump fast-uri from 3.1.4 to 3.1.5 ([#61](https://github.com/LibreWeather/libre-weather/issues/61)) ([f15ebff](https://github.com/LibreWeather/libre-weather/commit/f15ebff745492d8459d91fa141639d37b06a3944))
* **deps:** bump fast-uri from 3.1.5 to 3.1.7 ([#64](https://github.com/LibreWeather/libre-weather/issues/64)) ([40b7f63](https://github.com/LibreWeather/libre-weather/commit/40b7f6338548d0713fc886ecd971cd7c54993acf))
* **deps:** bump js-yaml ([#66](https://github.com/LibreWeather/libre-weather/issues/66)) ([48a22fe](https://github.com/LibreWeather/libre-weather/commit/48a22fe0dcb7db9920e3362b7684f22c834b0229))
* **deps:** bump react-router and react-router-dom ([#65](https://github.com/LibreWeather/libre-weather/issues/65)) ([35bc12d](https://github.com/LibreWeather/libre-weather/commit/35bc12dd72c7f21a78b33bfde92147824120f7bf))
* **sec:** bump @parcel/reporter-dev-server and parcel ([#60](https://github.com/LibreWeather/libre-weather/issues/60)) ([523a513](https://github.com/LibreWeather/libre-weather/commit/523a513064f2db97d2cceea67365a6172bcfd281))


### Features

* collapse hour strip and add 8h daily graphs ([#69](https://github.com/LibreWeather/libre-weather/issues/69)) ([2936421](https://github.com/LibreWeather/libre-weather/commit/2936421e61d4eab0aa1bd034906c36cd8c976d51))
* expand default weather fixture with hourly extras ([#70](https://github.com/LibreWeather/libre-weather/issues/70)) ([a67e87b](https://github.com/LibreWeather/libre-weather/commit/a67e87b25dec6f4d5ca986473bb82bac0090a67d))
* rewrite ui to typescript ([#72](https://github.com/LibreWeather/libre-weather/issues/72)) ([f05cc06](https://github.com/LibreWeather/libre-weather/commit/f05cc0642b21e9c05a65d1e5f55bf43f6a77c6fa))

## [1.0.5](https://github.com/LibreWeather/libre-weather/compare/v1.0.4...v1.0.5) (2026-04-10)


### Bug Fixes

* **sec:** bump lodash from 4.17.23 to 4.18.1 ([#53](https://github.com/LibreWeather/libre-weather/issues/53)) ([8e86a3c](https://github.com/LibreWeather/libre-weather/commit/8e86a3cba7599a1af6e908b1418149ee5b433544))

## [1.0.4](https://github.com/LibreWeather/libre-weather/compare/v1.0.3...v1.0.4) (2026-01-09)


### Bug Fixes

* **deps-dev:** bump base-x from 3.0.10 to 3.0.11 ([#43](https://github.com/LibreWeather/libre-weather/issues/43)) ([dd44870](https://github.com/LibreWeather/libre-weather/commit/dd44870b9bdeaf1313d38bf50197665af0908b7d))

## [1.0.3](https://github.com/LibreWeather/libre-weather/compare/v1.0.2...v1.0.3) (2025-01-10)


### Bug Fixes

* handle null hours ([2661288](https://github.com/LibreWeather/libre-weather/commit/266128824490aa24dce0fbdee77eb75fb1df068b))

## [1.0.2](https://github.com/LibreWeather/libre-weather/compare/v1.0.1...v1.0.2) (2025-01-09)


### Bug Fixes

* dockerfile labels in scope ([1e33cc6](https://github.com/LibreWeather/libre-weather/commit/1e33cc64e69841ce1bbe93e15f1794b4d65d14d7))
* render failures from axios ([4659716](https://github.com/LibreWeather/libre-weather/commit/465971627f6acffc9da2458c4792823b17dad046))

## [1.0.1](https://github.com/LibreWeather/libre-weather/compare/v1.0.0...v1.0.1) (2025-01-09)


### Bug Fixes

* don't muck with times ([#42](https://github.com/LibreWeather/libre-weather/issues/42)) ([6d5a3d5](https://github.com/LibreWeather/libre-weather/commit/6d5a3d577fce57e2636b236dde483b8084970f21))

# 1.0.0 (2025-01-08)


### Bug Fixes

* licencesview key issues ([d506299](https://github.com/LibreWeather/libre-weather/commit/d506299feb6a3f4bf9290e862cb09c852a9dd736))
* scale ticks and stuff better ([#31](https://github.com/LibreWeather/libre-weather/issues/31)) ([13292b0](https://github.com/LibreWeather/libre-weather/commit/13292b0a87fbb9be131c07d44cbf89bd827c9b60))


### Features

* add dropdown on zip search ([#36](https://github.com/LibreWeather/libre-weather/issues/36)) ([b32cd00](https://github.com/LibreWeather/libre-weather/commit/b32cd00cf2eb9e829b57eece4b8e8cb7866e43a8))
* better mobile support ([#22](https://github.com/LibreWeather/libre-weather/issues/22)) ([0d9d7be](https://github.com/LibreWeather/libre-weather/commit/0d9d7be42b502094aa3b6a8a1fe9fcfd33d36462))
* gh docker package for libreweather ([#38](https://github.com/LibreWeather/libre-weather/issues/38)) ([975fdab](https://github.com/LibreWeather/libre-weather/commit/975fdab6fc962b946045af3a5324b93eba238314))
* increase symbol padding ([#33](https://github.com/LibreWeather/libre-weather/issues/33)) ([706995c](https://github.com/LibreWeather/libre-weather/commit/706995cabaea91c15282eeaefd8bee19f19c9811))
* service worker & height fix ([23456d3](https://github.com/LibreWeather/libre-weather/commit/23456d37d19c2ed64363f72a14e6ad81feca56e5))
* **site:** Add MVP implementation ([#5](https://github.com/LibreWeather/libre-weather/issues/5)) ([741a291](https://github.com/LibreWeather/libre-weather/commit/741a291767fdbac52013d18030770d6cf4ad5661))
* support open-meteo and parcel v2 ([#13](https://github.com/LibreWeather/libre-weather/issues/13)) ([340ec54](https://github.com/LibreWeather/libre-weather/commit/340ec5409cd4461425f5046ed3ae17c00cda0fc0))


### Performance Improvements

* run serve w/ spa support ([#15](https://github.com/LibreWeather/libre-weather/issues/15)) ([5d1f149](https://github.com/LibreWeather/libre-weather/commit/5d1f1494157d6966826f8ffddaa6a8f6f9b91393)), closes [#14](https://github.com/LibreWeather/libre-weather/issues/14)

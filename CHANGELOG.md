## ...develop


### 🚀 Enhancements

- **api:** Created an NPM lib for JavaScript ([d43dcb3](https://github.com/chrisaugu/pngx-api/commit/d43dcb3))
- Added `etl.js` - a process that fetches data from PNGX.com.pg and compare it against the database and save any data from PNGX that are missing from db.
- Added `webhook.js` - to allow external connections into the system to receive payloads
- Added `ws.js` - websocket addon to receive stock data in real-time
- Added `sse.js` - websocket addon to send events to clients

### 🩹 Fixes

- Uncomment loop to iterate through the dataset and add all the data to the db ([77d96bd](https://github.com/chrisaugu/pngx-api/commit/77d96bd))
- Comment loop out ([8582d17](https://github.com/chrisaugu/pngx-api/commit/8582d17))
- Fixed query issues ([69d6756](https://github.com/chrisaugu/pngx-api/commit/69d6756))
- Fixed date issues on clevercloud.io ([b712a34](https://github.com/chrisaugu/pngx-api/commit/b712a34))
- Fixed winston issues ([e641c8a](https://github.com/chrisaugu/pngx-api/commit/e641c8a))
- Added missing dependencies ([b98bacd](https://github.com/chrisaugu/pngx-api/commit/b98bacd))
- Removed unused boxen dependency ([d7af0cf](https://github.com/chrisaugu/pngx-api/commit/d7af0cf))
- Package.json & package-lock.json to reduce vulnerabilities ([8c1fb70](https://github.com/chrisaugu/pngx-api/commit/8c1fb70))
- Upgrade winston from 3.15.0 to 3.17.0 ([02b89fa](https://github.com/chrisaugu/pngx-api/commit/02b89fa))
- Upgrade marked from 14.1.3 to 14.1.4 ([e1f0b3a](https://github.com/chrisaugu/pngx-api/commit/e1f0b3a))

### 📖 Documentation

- Made changes to the documentation ([0cbe2cf](https://github.com/chrisaugu/pngx-api/commit/0cbe2cf))
- **api:** Updated the docs ([d76cce4](https://github.com/chrisaugu/pngx-api/commit/d76cce4))
- Updated Readme file ([e11c0ab](https://github.com/chrisaugu/pngx-api/commit/e11c0ab))

### ❤️ Contributors

- Snyk-bot <snyk-bot@snyk.io>
- Christian Augustyn ([@chrisaugu](http://github.com/chrisaugu))




Unreleased
==========

New Release
===========
Added – for new features,
Deprecated – for deprecated features that will be removed in future versions,
Removed – for removed functions,
Fixed – for fixed bugs and refactoring.


2.0.0 / 2024-12-29
==================
  * upgrade to v2
  * include endpoints
    - `GET /api/v2/companies`
    - `POST /api/v2/stocks`
    - `GET /api/v2/tickers`
    - `GET /api/v2/tickers/:symbol`
  * Added `ticker` as a timeseries model to `quote` model
  * Added `company` model 
  * Fixed error codes
  * Existing routes in the initial release were moved to `v1.js` file and are accessible under the route `/api/v1`
  * Codes in `server.js` were segregated into; 
    - `app.js` - for application logic, 
    - `server.js` - for running the server, 
    - `database.js` - for handling database connections, 
    - `routes/index.js`, `routes/v1.js` and `routes/v2.js` - for handling routes, 
    - `models/*` - for handling models, 
    - `middlewares.js` - for handling middlewares, 
    - `utils.js` - for handling utility functions, 
    - `constants.js` - for keeping constants in one place, and 
    - `serverless.js` - for running serverless app.
  * Added `Dockerfile` and `docker-compose.yaml` file
  * Added `OpenAPI` documentation at `/api/docs`
  * Migrated `mongoose` to `^8.8.3`
    - fixed callback issues 

1.0.0 / 2024-10-20
==================
  * Added `redis` to take of load
  * Added `node-celery` to handle tasks out of the main thread 

1.0.0 / 2024-01-15
==================
  * Added `express-rate-limit` to limit the requests
  * Added `helmet`

1.0.0 / 2023-12-17
==================
  * Added `STO` and `NEM` property to model
  * Removed `OSH` and `NCM` property to model

1.0.0 / 2023-01-28
==================
  * Added `timeseries` property to model

<!-- 4.17.1 / 2019-05-25
===================
  * Revert "Improve error message for `null`/`undefined` to `res.status`"

4.17.0 / 2019-05-16
===================

  * Add `express.raw` to parse bodies into `Buffer`
  * Add `express.text` to parse bodies into string
  * Improve error message for non-strings to `res.sendFile`
  * Improve error message for `null`/`undefined` to `res.status`
  * Support multiple hosts in `X-Forwarded-Host`
  * deps: accepts@~1.3.7
  * deps: body-parser@1.19.0
    - Add encoding MIK
    - Add petabyte (`pb`) support
    - Fix parsing array brackets after index
    - deps: bytes@3.1.0
    - deps: http-errors@1.7.2
    - deps: iconv-lite@0.4.24
    - deps: qs@6.7.0
    - deps: raw-body@2.4.0
    - deps: type-is@~1.6.17
  * deps: content-disposition@0.5.3
  * deps: cookie@0.4.0
    - Add `SameSite=None` support
  * deps: finalhandler@~1.1.2
    - Set stricter `Content-Security-Policy` header
    - deps: parseurl@~1.3.3
    - deps: statuses@~1.5.0
  * deps: parseurl@~1.3.3
  * deps: proxy-addr@~2.0.5
    - deps: ipaddr.js@1.9.0
  * deps: qs@6.7.0
    - Fix parsing array brackets after index
  * deps: range-parser@~1.2.1
  * deps: send@0.17.1
    - Set stricter CSP header in redirect & error responses
    - deps: http-errors@~1.7.2
    - deps: mime@1.6.0
    - deps: ms@2.1.1
    - deps: range-parser@~1.2.1
    - deps: statuses@~1.5.0
    - perf: remove redundant `path.normalize` call
  * deps: serve-static@1.14.1
    - Set stricter CSP header in redirect response
    - deps: parseurl@~1.3.3
    - deps: send@0.17.1
  * deps: setprototypeof@1.1.1
  * deps: statuses@~1.5.0
    - Add `103 Early Hints`
  * deps: type-is@~1.6.18
    - deps: mime-types@~2.1.24
    - perf: prevent internal `throw` on invalid type

4.16.4 / 2018-10-10
===================

  * Fix issue where `"Request aborted"` may be logged in `res.sendfile`
  * Fix JSDoc for `Router` constructor
  * deps: body-parser@1.18.3
    - Fix deprecation warnings on Node.js 10+
    - Fix stack trace for strict json parse error
    - deps: depd@~1.1.2
    - deps: http-errors@~1.6.3
    - deps: iconv-lite@0.4.23
    - deps: qs@6.5.2
    - deps: raw-body@2.3.3
    - deps: type-is@~1.6.16
  * deps: proxy-addr@~2.0.4
    - deps: ipaddr.js@1.8.0
  * deps: qs@6.5.2
  * deps: safe-buffer@5.1.2 -->

1.0.0 / 2021-01-03
==================

  * Initial release

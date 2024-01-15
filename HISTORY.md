0.0.1 / 2024-01-15
==================
  * Added `express-rate-limit` to limit the requests
  * Added `helmet`

0.0.1 / 2023-012-17
==================
  * Added `STO` and `NEM` property to model
  * Removed `OSH` and `NCM` property to model

0.0.1 / 2023-01-28
==================
  * Added `timeseries` property to model

4.17.1 / 2019-05-25
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
  * deps: safe-buffer@5.1.2

0.0.1 / 2010-01-03
==================

  * Initial release

const setRateLimit = require("express-rate-limit");
const cors = require("cors");

exports.allowCrossDomain = function allowCrossDomain(req, res, next) {
  // let allowHeaders = DEFAULT_ALLOWED_HEADERS;

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  // res.header('Access-Control-Allow-Headers', allowHeaders);
  res.header(
    "Access-Control-Expose-Headers",
    "X-Parse-Job-Status-Id, X-Parse-Push-Status-Id"
  ); // intercept OPTIONS method

  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};

exports.allowMethodOverride = function allowMethodOverride(req, res, next) {
  if (req.method === "POST" && req.body._method) {
    req.originalMethod = req.method;
    req.method = req.body._method;
    delete req.body._method;
  }

  next();
};

exports.error404Handler = function error404Handler(error, req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err) || next(createError(404));
};

exports.errorHandler = function errorHandler(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);

  var html = "<!DOCTYPE html>";
  html += "<html>";
  html += "  <head>";
  html += "    <title></title>";
  html += "  </head>";
  html += "  <body>";
  html += "    <h1>" + err.message + "</h1>";
  html += "    <h2>" + err.status + "</h2>";
  html += "    <h2>More information: hello@christianaugustyn.me</h2>";
  html += "    <pre>" + err.stack + "</pre>";
  html += "  </body>";
  html += "</html>";
  res.send(html);
};

exports.errorLogHandler = function errorLogHandler(err, req, res, next) {
  logger.error(
    `${req.method} - ${err.message}  - ${req.originalUrl} - ${req.ip}`
  );
  next(err);
};

const allowlist = ["192.168.0.56", "192.168.0.21", "localhost", "127.0.0.1"];
exports.rateLimitMiddleware = setRateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 100,
  message: "You have exceeded your 100 requests per second limit.",
  headers: true,
  handler: function (req, res) {
    // applyFeesForConsumer()
    // next()
    return res.status(429).json({
      error: "You sent too many requests. Please wait a while then try again",
    });
  },
  skip: (req) => allowlist.includes(req.ip),
});

exports.corsMiddleware = cors({
  origin: "http://localhost:3000",
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET,PUT,PATCH,POST,DELETE",
});
const cors = require("cors");
const semver = require("semver");
const rateLimiter = require("ratelimiter");
const setRateLimit = require("express-rate-limit");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const createError = require("http-errors");
const mcache = require("memory-cache");
const { ALLOWED_IP_LIST, ORIGINAL_URL } = require("./config");
const logger = require("./libs/logger").winstonLogger;
const apiUsageLogger = require("./libs/logger").apiUsageLogger;
const createRedisClient = require("./libs/redis").createRedisClient;

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

exports.corsMiddleware = cors({
  origin: ORIGINAL_URL,
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET,PUT,PATCH,POST,DELETE",
});

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
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

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
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
  });
  next(err);
};

// Create a write stream for morgan (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" }
);

// Use winston for morgan logging
const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms";

// Custom morgan format
const morganFormatx =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
// ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'

// Stream morgan output to winston
const morganStream = {
  write: (message) => logger.http(message.trim()),
};

// Morgan token for request body (for POST/PUT requests)
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

// log only 4xx and 5xx responses to console
exports.morganDevMiddlware = morgan("dev", {
  // skip: function (req, res) {
  //   return res.statusCode < 400;
  // },
});
// log all requests to access.log
exports.morganCommonMiddlware = morgan("common", {
  stream: accessLogStream,
});
// log all requests to console
exports.morganCombinedMiddlware = morgan("combined", {
  stream: morganStream,
  skip: function (req, res) {
    // Skip logging for health check endpoint
    return req.path === "/health" || req.method === "OPTIONS";
  },
});
exports.morganMiddlware = morgan(morganFormat, { stream: morganStream });
// Also log to file
exports.morganFileMiddlware = morgan(morganFormat, {
  stream: accessLogStream,
});
// For POST/PUT requests, log the body too
exports.morganBodyMiddlware = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body",
  {
    skip: (req) => req.method !== "POST" && req.method !== "PUT",
    stream: morganStream,
  }
);

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
  skip: (req) => ALLOWED_IP_LIST.includes(req.ip),
});

exports.rateLimit = function rateLimit(req, res, next) {
  var id = req.user._id;
  var limit = new rateLimiter({ id: id, db: db });
  limit.get(function (err, limit) {
    if (err) return next(err);

    res.set("X-RateLimit-Limit", limit.total);
    res.set("X-RateLimit-Remaining", limit.remaining - 1);
    res.set("X-RateLimit-Reset", limit.reset);

    // all good
    debug("remaining %s/%s %s", limit.remaining - 1, limit.total, id);
    if (limit.remaining) return next();

    // not good
    var delta = (limit.reset * 1000 - Date.now()) | 0;
    var after = (limit.reset - Date.now() / 1000) | 0;
    res.set("Retry-After", after);
    res.send(429, "Rate limit exceeded, retry in " + ms(delta, { long: true }));
  });
};

var emailBasedRatelimit = rateLimiter({
  db: createRedisClient(),
  duration: 60000,
  max: 10,
  id: function (context) {
    return context.body.email;
  },
});

var ipBasedRatelimit = rateLimiter({
  db: createRedisClient(),
  duration: 60000,
  max: 10,
  id: function (context) {
    return context.ip;
  },
});

exports.corsMiddleware = cors({
  origin: "http://localhost:3000",
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET,PUT,PATCH,POST,DELETE",
});

exports.versionMiddleware = function (version) {
  return function (req, res, next) {
    if (semver.gte(req.headers["x-version"], version)) {
      return next();
    }
    return next("route"); // skip to the next route
  };
};

// Create a write stream for morgan (in append mode)
const apiUsageLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "api-usage.log"),
  { flags: "a" }
);
// Log api usage
exports.apiUsageLogMiddlware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || "anonymous";
  apiUsageLogger.info(
    `User: ${apiKey}, ${req.ip} called ${req.method} ${req.originalUrl}`
  );
  next();
};

/**
 * this function applies to all /api/v2 routes
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.globalProperties = function (req, res, next) {
  const limit = req.query["limit"];
  if (limit) {
  }
};

/**
 * cache response for the number of time specified in duration
 * @param {number} duration
 * @returns
 */
exports.cache = (duration) => (req, res, next) => {
  const key = "__express__" + req.originalUrl || req.url;
  const cachedBody = mcache.get(key);
  if (cachedBody) {
    res.send(cachedBody);
    return;
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    // next();
  }
};

/**
 * cache response using redis
 * @returns
 */
exports.cacheMiddleware = async (duration = 1) => {
  const client = await createRedisClient();

  // Define a caching function
  function cacheData(key, data) {
    // Store data in Redis
    client.set(key, data, (err, reply) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Cached data for key ${key}`);
      }
    });
  }

  // Define a function to retrieve cached data
  function getCachedData(key) {
    // Retrieve data from Redis
    client.get(key, (err, reply) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Retrieved cached data for key ${key}`);
        return reply;
      }
    });
  }

  // Define a function to invalidate cached data
  function invalidateCachedData(key) {
    // Remove data from Redis
    client.del(key, (err, reply) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Invalidated cached data for key ${key}`);
      }
    });
  }

  return (req, res, next) => {
    const key = req.originalUrl;

    client.get(key, (err, data) => {
      if (err) throw err;

      if (data) {
        res.send(JSON.parse(data)); // Serve cached data
        return;
      } else {
        res.sendResponse = res.send;
        res.send = (body) => {
          // Cache data for 1 hour (3600 seconds)
          client.setex(key, duration * 1000, JSON.stringify(body));
          res.sendResponse(body);
        };
        return;
        // next(); // Proceed to route handler if no cache
      }
    });
  };
};

exports.rateLimitedRequest = (url, callback) => {
  const requestQueue = [];
  let lastRequestTime = 0;

  return () => {
    const now = Date.now();
    const delay = Math.max(0, lastRequestTime + 1000 - now); // 1 request per second

    requestQueue.push({ url, callback });

    setTimeout(() => {
      const { url, callback } = requestQueue.shift();
      axios
        .get(url)
        .then((response) => callback(null, response.data))
        .catch((error) => callback(error));

      lastRequestTime = Date.now();
    }, delay);
  };
};

// Cache middleware
const cacheData = (expireTime = 3600) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create a cache key based on the full URL
    const cacheKey = `students:${req.originalUrl}`;

    try {
      // Check if cache exists
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache miss for ${cacheKey}`);

      // If not in cache, continue but modify res.json
      res.originalJson = res.json;
      res.json = function (data) {
        // Store in cache before sending response
        redisClient
          .set(cacheKey, JSON.stringify(data), { EX: expireTime })
          .catch((err) => console.error("Redis cache error:", err));

        // Continue with the original response
        return res.originalJson(data);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };
};

// Clear cache helper
const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      console.log(`Clearing cache keys matching: ${pattern}`);
      await Promise.all(keys.map((key) => redisClient.del(key)));
    }
  } catch (err) {
    console.error("Error clearing cache:", err);
  }
};

// Clear the list cache when a new student is added
// await clearCache('students:/api/students*');

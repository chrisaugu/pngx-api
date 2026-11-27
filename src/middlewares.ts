import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import cors from "cors";
import semver from "semver";
import RateLimiter from "ratelimiter";
import setRateLimit from "express-rate-limit";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import createError from "http-errors";
import mcache from "memory-cache";
import requestIp from "request-ip";
import { ALLOWED_IP_LIST, ORIGINAL_URL } from "./config/index";
import { winstonLogger as logger, apiUsageLogger } from "./libs/logger";
import { getRedisClient } from "./libs/redis";

const ipMiddleware = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const clientIp = requestIp.getClientIp(req);
  next();
};

export const allowCrossDomain = function allowCrossDomain(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // let allowHeaders = DEFAULT_ALLOWED_HEADERS;

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  // res.header('Access-Control-Allow-Headers', allowHeaders);
  res.header(
    "Access-Control-Expose-Headers",
    "X-Parse-Job-Status-Id, X-Parse-Push-Status-Id",
  ); // intercept OPTIONS method

  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};

export const corsMiddleware = cors({
  origin: ORIGINAL_URL,
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET,PUT,PATCH,POST,DELETE",
});

export const allowMethodOverride = function allowMethodOverride(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.method === "POST" && req.body._method) {
    (req as any).originalMethod = req.method;
    req.method = req.body._method;
    delete req.body._method;
  }

  next();
};

export const error404Handler = function error404Handler(
  error: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  next(createError(404));
};

export const errorHandler = function errorHandler(
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`,
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

export const errorLogHandler = function errorLogHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(
    `${req.method} - ${err.message}  - ${req.originalUrl} - ${req.ip}`,
  );
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
  });
  next(err);
};

// Create a write stream for morgan (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(import.meta.dirname, "logs", "access.log"),
  { flags: "a" },
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
  write: (message: any) => logger.http(message.trim()),
};

// Morgan token for request body (for POST/PUT requests)
morgan.token("body", (req) => {
  return JSON.stringify((req as any).body);
});

// log only 4xx and 5xx responses to console
export const morganDevMiddlware = morgan("dev", {
  // skip: function (req, res) {
  //   return res.statusCode < 400;
  // },
});
// log all requests to access.log
export const morganCommonMiddlware = morgan("common", {
  stream: accessLogStream,
});
// log all requests to console
export const morganCombinedMiddlware = morgan("combined", {
  stream: morganStream,
  skip: function (req, res) {
    // Skip logging for health check endpoint
    return req.path === "/health" || req.method === "OPTIONS";
  },
});
export const morganMiddlware = morgan(morganFormat, { stream: morganStream });
// Also log to file
export const morganFileMiddlware = morgan(morganFormat, {
  stream: accessLogStream,
});
// For POST/PUT requests, log the body too
export const morganBodyMiddlware = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body",
  {
    skip: (req) => req.method !== "POST" && req.method !== "PUT",
    stream: morganStream,
  },
);

export const rateLimitMiddleware = setRateLimit({
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

export const rateLimit = function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  var id = req.user._id;
  const redisClient = getRedisClient();

  var limit = new RateLimiter({ id, db: redisClient });
  limit.get(function (err, limit) {
    if (err) return next(err);

    res.set("X-RateLimit-Limit", limit.total);
    res.set("X-RateLimit-Remaining", limit.remaining - 1);
    res.set("X-RateLimit-Reset", limit.reset);

    // all good
    logger.debug("remaining %s/%s %s", limit.remaining - 1, limit.total, id);
    if (limit.remaining) return next();

    // not good
    var delta = (limit.reset * 1000 - Date.now()) | 0;
    var after = (limit.reset - Date.now() / 1000) | 0;
    res.set("Retry-After", after);
    res.send(429, "Rate limit exceeded, retry in " + ms(delta, { long: true }));
  });
};

var emailBasedRatelimit = new RateLimiter({
  db: getRedisClient(),
  duration: 60000,
  max: 10,
  id: function (context) {
    return context.body.email;
  },
});

var ipBasedRatelimit = new RateLimiter({
  db: getRedisClient(),
  duration: 60000,
  max: 10,
  id: (context) => {
    return context.ip as string;
  },
});

export const rateLimitedRequest = (url, callback) => {
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

export const versionMiddleware = function (version) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (semver.gte(req.headers["x-version"], version)) {
      return next();
    }
    return next("route"); // skip to the next route
  };
};

// Create a write stream for morgan (in append mode)
const apiUsageLogStream = fs.createWriteStream(
  path.join(import.meta.dirname, "logs", "api-usage.log"),
  { flags: "a" },
);
// Log api usage
export const apiUsageLogMiddlware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"] || "anonymous";
  apiUsageLogger.info(
    `User: ${apiKey}, ${req.ip} called ${req.method} ${req.originalUrl}`,
  );
  next();
};

/**
 * this function applies to all /api/v2 routes
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const globalProperties = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const limit = req.query["limit"];
  if (limit) {
  }
};

/**
 * cache response for the number of time specified in duration.
 * Default 60 seconds
 * @param {number} duration
 * @returns
 */
export const cache = (duration = 60) => {
  // const mcache = await getRedisClient();
  const TTL = duration * 1000;

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = "__express__" + req.originalUrl || req.url;
    const cachedBody = mcache.get(key);
    if (cachedBody) {
      res.setHeader("X-Cache", "HIT");
      res.json(cachedBody);
      return;
    } else {
      res.setHeader("X-Cache", "MISS");
      res.jsonResponse = res.json;

      res.json = (body) => {
        mcache.put(key, body, TTL);

        res.jsonResponse(body);
      };
      next();
    }
  };
};

/**
 * cache response using redis
 * @returns
 */
export const cacheMiddleware = async (duration = 1) => {
  const client = await getRedisClient();

  // Define a caching function
  function cacheData(key, data) {
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
    client.del(key, (err, reply) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Invalidated cached data for key ${key}`);
      }
    });
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;

    client.get(key, (err, data) => {
      if (err) throw err;

      if (data) {
        res.json(JSON.parse(data));
        return;
      } else {
        res.jsonResponse = res.json;
        res.json = (body) => {
          // Cache data for 1 hour (3600 seconds)
          client.setex(key, duration * 1000, JSON.stringify(body));
          res.jsonResponse(body);
        };
        next(); // Proceed to route handler if no cache
      }
    });
  };
};

// Cache middleware
const cacheData = async (expireTime = 3600) => {
  const client = await getRedisClient();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create a cache key based on the full URL
    const cacheKey = `students:${req.originalUrl}`;

    try {
      // Check if cache exists
      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache miss for ${cacheKey}`);

      // If not in cache, continue but modify res.json
      res.originalJson = res.json;
      res.json = function (data) {
        // Store in cache before sending response
        client
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
  const client = await getRedisClient();
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      console.log(`Clearing cache keys matching: ${pattern}`);
      await Promise.all(keys.map((key) => client.del(key)));
    }
  } catch (err) {
    console.error("Error clearing cache:", err);
  }
};

// Clear the list cache when a new student is added
// await clearCache('students:/api/students*');

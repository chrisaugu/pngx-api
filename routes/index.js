const express = require("express");
const router = express.Router();
const { BASE_URL } = require("../constants");
const { versionMiddleware } = require("../middlewares");
const Redis = require("ioredis");
const redis = new Redis(6379);
const logger = require("../libs/logger").winstonLogger;

router.get("/", (req, res) => {
  res.status(200).json({
    message: `Welcome to the Nuku API! Documentation is available at ${BASE_URL.protocol}//${BASE_URL.host}/api/docs/`,
  });
});

// Health check endpoint
router.get("/health", async (_req, res, _next) => {
  // optional: add further things to check (e.g. connecting to dababase)
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };

  try {
    await redis.ping();
    res.status(200).json({
      ...healthcheck,
      redis: "healthy",
    });
  } catch (e) {
    healthcheck.message = e;
    // res.status(503).json({ redis: "unavailable" });
    logger.error("Error creating user", {
      error: e.message,
      stack: e.stack,
      body: _req.body,
    });
    res.json(healthcheck);
    res.status(503).send();
  }
});
router.get("/health", versionMiddleware("3.0.0"), async (_req, res, _next) => {
  const data = await _req.ctx.db.query("SELECT * FROM users");
  // optional: add further things to check (e.g. connecting to dababase)
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };

  try {
    res.json(healthcheck);
  } catch (e) {
    healthcheck.message = e;
    res.status(503).send();
  }
});

exports.V3 = async function (req, res) {
  res
    .status(410)
    .send({ error: "Adding books is no longer active since version 2.7.0." });
};

/**
 * /api/v1
 * @deprecated Please use v2 as this version is deprecated and will be removed in the future
 */
router.use("/v1", require("./v1"));

/**
 * /api/v2
 */
router.use("/v2", require("./v2"));

// router.use('/webhook', require('./webhook'));

router.all("/*splat", (req, res) => {
  logger.error("Unknown request URL", {
    message: `Unknown request URL: GET /api${req.url}. Please check the URL for typos, or see the docs at ${BASE_URL.protocol}//${BASE_URL.host}/docs/`,
    type: "invalid_request_error",
    code: "unknown_url",
  });
  res.status(404).json({
    error: {
      message: `Unknown request URL: GET /api${req.url}. Please check the URL for typos, or see the docs at ${BASE_URL.protocol}//${BASE_URL.host}/api/docs/`,
      type: "invalid_request_error",
      code: "unknown_url",
    },
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { BASE_URL } = require("../constants");

router.get("/", (req, res) => {
  res.status(200).json({
    message: `Welcome to the Nuku API! Documentation is available at ${BASE_URL.protocol}//${BASE_URL.host}/docs/`,
  });
});

// Health check endpoint
router.get('/health', async (_req, res, _next) => {
	// optional: add further things to check (e.g. connecting to dababase)
	const healthcheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now()
	};

	try {
		res.json(healthcheck);
	} catch (e) {
		healthcheck.message = e;
		res.status(503).send();
	}
});

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

router.all("/*", (req, res) => {
  res.status(404).json({
    error: {
      message: `Unknown request URL: GET /api${req.url}. Please check the URL for typos, or see the docs at ${BASE_URL.protocol}//${BASE_URL.host}/docs/`,
      type: "invalid_request_error",
      code: "unknown_url",
    },
  });
});

module.exports = router;

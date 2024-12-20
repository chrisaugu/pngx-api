const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // let url = new URL(req.url);
  res.status(200).json({
    message:
      `Welcome to the Nuku API! Documentation is available at {url.protocol}://{url.host}/docs/`,
  });
});

/**
 * /api/v1
 */
router.use("/v1", require("./v1"));

/**
 * /api/v2
 */
router.use("/v2", require("./v2"));

router.all("/*", (req, res) => {
  res.status(200).json({
    error: {
      message:
        "Unknown request URL: GET /api/v1. Please check the URL for typos, or see the docs at {url.protocol}://{url.host}/docs/",
      type: "invalid_request_error",
      code: "unknown_url",
    },
  });
});


module.exports = router;

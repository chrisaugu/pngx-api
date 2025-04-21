const { Router } = require("express");
const { verifySignature } = require("../utils");

const app = Router();

const WEBHOOK_TOKEN = "your_shared_webhook_token";

const SECRET = "your_shared_secret";
const MAX_TIME_DIFFERENCE = +process.env.MAX_TIME_DIFFERENCE || 60;

// Middleware to verify the webhook tooken, signature and timestamp of incoming webhook requests
const verifyWebhookMiddleware2 = (webhookToken, secret, timeDifference) => {
  return (req, res, next) => {
    const token = req.headers["x-webhook-token"];
    const signature = req.headers["x-signature"];
    const timestamp = req.headers["x-timestamp"];
    const payload = req.body;

    // Check if webhook teken headers is missing or invalid
    if (!token || token !== webhookToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if signature or timestamp headers are missing
    if (!signature || !timestamp) {
      return res
        .status(401)
        .json({ error: "Signature or timestamp header is missing" });
    }

    // Validate timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTimestamp - timestamp) > timeDifference) {
      return res.status(401).json({ error: "Expired timestamp" });
    }

    // Check if the payload is valid
    if (!payload?.event || !payload?.data) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Verify the signature
    const payloadWithTimestamp = JSON.stringify(req.body) + timestamp;
    if (!verifySignature(secret, payloadWithTimestamp, signature)) {
      return res.status(403).json({ error: "Invalid signature" });
    }
    next();
  };
};

// Middleware to verify the webhook token of incoming webhook requests
const verifyWebhookMiddleware = (webhookToken) => {
  return (req, res, next) => {
    const token = req.headers["x-webhook-token"];

    // Check if webhook teken headers is missing or invalid
    if (!token || token !== webhookToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
};

// Endpoint to receive webhook payloads
app.post(
  "/webhook",
  verifyWebhookMiddleware(WEBHOOK_TOKEN, SECRET, MAX_TIME_DIFFERENCE),
  (req, res) => {
    console.log("Received webhook payload:", req.body);
    const { event, data } = req.body;

    // Example: handling a specific event
    if (event === "user.created") {
      console.log(`New user created: ${data.id}`);
      // Add your logic here to handle the new user creation
    }
    res.status(200).send("Webhook received successfully");
  }
);

module.exports = app;

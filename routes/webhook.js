const { Router } = require("express");
const { verifySignature } = require("../utils");
const logger = require("../libs/logger").winstonLogger;

const route = Router();

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
      logger.debug("Expired timestamp")
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
route.post(
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

route.post("/webhook-endpoint", (req, res) => {
  const signature = req.headers["x-signature"];
  const payload = JSON.stringify(req.body);
  const secret = "your-secret"; // The secret you share with the third-party service

  // Verify the signature
  const hash = verifySignature(secret, payload, signature);

  if (hash === signature) {
    console.log("Valid webhook signature. Process the request.");

    // Process the verified webhook
    // ...
  } else {
    console.log("Invalid webhook signature. Do not process the request.");
    return res.status(401).send("Invalid signature");
  }

  res.status(200).send("Webhook received!");
});

const Queue = require("bull");
const webhookQueue = new Queue("webhook", "redis://127.0.0.1:6379");

route.post("/webhook-endpoint", (req, res) => {
  // Add the processing of the webhook event to the queue
  webhookQueue.add(req.body);

  res.status(200).send("Webhook received!");
});

// Process the queue jobs
webhookQueue.process((job, done) => {
  // Process the job data (webhook event)
  console.log("Processing webhook event:", job.data);

  // Perform the necessary operations
  // ...

  done();
});

const axios = require("axios");

function sendWebhook(eventData) {
  axios
    .post("https://thirdparty.service/webhook-receiver", eventData)
    .then((response) =>
      console.log("Webhook sent successfully:", response.data)
    )
    .catch((error) => console.error("Failed to send webhook:", error));
}

// Somewhere in your code when an event occurs:
sendWebhook({
  event: "item_purchased",
  item: "Node.js Handbook",
  quantity: 1,
  // additional data
});

module.exports = route;

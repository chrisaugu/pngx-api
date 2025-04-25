const { Router } = require("express");
const { verifySignature, generateSignature } = require("../utils");
const { Webhook } = require("../models");
const Env = require("../config/env");

const router = Router();

const WEBHOOK_TOKEN = Env.WEBHOOK_TOKEN || "your_shared_webhook_token";

const SECRET = "your_shared_secret";
const MAX_TIME_DIFFERENCE = +Env.MAX_TIME_DIFFERENCE || 60;

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
router.post(
  "/webhook",
  verifyWebhookMiddleware(WEBHOOK_TOKEN /*, SECRET, MAX_TIME_DIFFERENCE*/),
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

router.post("/webhook2", (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received");
});

router.post("/webhook2", (req, res) => {
  const signature = generateSignature(
    req.method,
    req.url,
    req.headers["x-cs-timestamp"],
    req.rawBody
  );

  if (signature !== req.headers["x-cs-signature"]) {
    return res.sendStatus(401);
  }

  console.log("received webhook", req.body);
  res.sendStatus(200);
});

router.get("/webhooks", async (req, res) => {
  try {
    const webhooks = await Webhook.find();
    res.json(webhooks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/webhooks", async (req, res) => {
  try {
    const newWebhook = new Webhook(req.body);
    const savedWebhook = await newWebhook.save();
    res.status(201).json(savedWebhook);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/webhooks/:id", async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.id);
    if (!webhook) {
      return res.status(404).send("Webhook not found");
    }
    res.json(webhook);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.put("/webhooks/:id", async (req, res) => {
  try {
    const updatedWebhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (!updatedWebhook) {
      return res.status(404).send("Webhook not found");
    }
    res.json(updatedWebhook);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.delete("/webhooks/:id", async (req, res) => {
  try {
    const deletedWebhook = await Webhook.findByIdAndDelete(req.params.id);
    if (!deletedWebhook) {
      return res.status(404).send("Webhook not found");
    }
    res.json({ message: "Webhook deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/generate-event", async (req, res) => {
  try {
    const { event, data } = req.body;

    // fetch all webhooks that subscribed to this event
    const webhooks = await Webhook.find({
      events: event,
    });

    // Define webhook payload
    const webhookPayload = {
      event: event,
      data: data,
    };

    // Send POST request to each webhook endpoint
    for (const webhook of webhooks) {
      await axios.post(webhook?.url, webhookPayload);
    }

    res
      .status(200)
      .json({ message: "Event generated and webhook triggered successfully" });
  } catch (error) {
    console.error("Error generating event and triggering webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

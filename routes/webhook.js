/**
 * TODO:
 * Add a message queue between receiving and sending payloads out
 */
const { Router } = require("express");
const { verifySignature, generateSignature } = require("../utils");
const { Webhook } = require("../models");
const Env = require("../config/env");
const { default: axios } = require("axios");
const logger = require("../config/logger");

const router = Router();

const WEBHOOK_TOKEN = Env.WEBHOOK_TOKEN || "your_shared_webhook_token";

const SECRET = "your_shared_secret";
const MAX_TIME_DIFFERENCE = +Env.MAX_TIME_DIFFERENCE || 60;

/**
 * Stock Market events:
 * stock.price_threshold_hit
 * stock.price_updated
 * stock.volume_spike
 * stock.hlated
 * stock.resumed
 * stock.ipo_announced
 * stock.dividend_declared
 * stock.earnings_report_released

Event Name | Description
stock.price_threshold_hit | A stock crosses a user-defined price (up or down).
stock.price_updated | Regular stock price updates (throttled).
stock.volume_spike | Volume anomaly detected (e.g., 3× 30-day average).
stock.news_published | News or announcement related to a stock.
stock.earnings_report | Company publishes an earnings report.
stock.dividend_declared | Company declares a dividend.
stock.dividend_paid | Dividend has been paid out.
stock.split_announced | Company announces a stock split.
stock.split_executed | Stock split takes effect.
stock.delisted | Stock has been delisted from an exchange.

 */

// Middleware to verify the webhook tooken, signature and timestamp of incoming webhook requests
// const verifyWebhookMiddleware = (webhookToken, secret, timeDifference) => {
//   return (req, res, next) => {
//     const token = req.headers["x-webhook-token"];
//     const signature = req.headers["x-signature"];
//     const timestamp = req.headers["x-timestamp"];
//     const eventId = req.headers['X-Webhook-Event-Id'];
//     const payload = req.body;

//     // Check if webhook token headers is missing or invalid
//     if (!token || token !== webhookToken) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     // Check if signature or timestamp headers are missing
//     if (!signature || !timestamp) {
//       return res
//         .status(401)
//         .json({ error: "Signature or timestamp header is missing" });
//     }

//     // Validate timestamp
//     const currentTimestamp = Math.floor(Date.now() / 1000);
//     if (Math.abs(currentTimestamp - timestamp) > timeDifference) {
//       return res.status(401).json({ error: "Expired timestamp" });
//     }

//     // Check if the payload is valid
//     if (!payload?.event || !payload?.data) {
//       return res.status(400).json({ error: "Invalid payload" });
//     }

//     // Verify the signature
//     const payloadWithTimestamp = JSON.stringify(req.body) + timestamp;
//     if (!verifySignature(secret, payloadWithTimestamp, signature)) {
//       return res.status(403).json({ error: "Invalid signature" });
//     }

//     next();
//   };
// };

// // client's webhook Endpoint to receive incoming webhook payloads
// router.post(
//   "/webhook",
//   // verifyWebhookMiddleware(WEBHOOK_TOKEN, SECRET, MAX_TIME_DIFFERENCE),
//   (req, res) => {
//     console.log("Received webhook payload:", req.body);
//     const { event, data } = req.body;

//     if (event === "user.created") {
//       console.log(`New user created: ${data.id}`);
//       // Add your logic here to handle the new user creation
//     }
//     res.status(200).send("Webhook received successfully");

//     // const signature = generateSignature(
//     //   SECRET,
//     //   req.method,
//     //   req.url,
//     //   req.headers["x-timestamp"],
//     //   req.body
//     // );

//     // if (signature !== req.headers["x-signature"]) {
//     //   return res.sendStatus(401);
//     // }

//     // console.log("received webhook", req.body);
//     // res.sendStatus(200);
//   }
// );

/**
 * system's webhook endpoint
 */
router.get("/webhooks", async (req, res) => {
  try {
    const webhooks = await Webhook.find().select('-secret');
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
      { new: true }
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

router.patch("/webhooks/:id", async (req, res) => {
  try {
    const updatedWebhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
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
      // event: "stock.price_threshold_hit",
      timestamp: Date.now(),
      id: "evt_abc123456",
      // user_id: "user_789",
      // payload: {
      //   // event-specific content
      // },
      // source: "stock-api-service",
    };

    // Send POST request to each webhook endpoint
    for (const webhook of webhooks) {
      webhookPayload['id'] = `evt_${webhook.id}`
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

function formatWebhook(webhook) {
  return ([
    { label: 'ID', value: webhook.id },
    { label: 'Event', value: webhook.event },
    { label: 'URL', value: webhook.url },
    { label: 'Created at', value: new Date(webhook.createdAt).toLocaleString() },
    { label: 'Updated at', value: new Date(webhook.updatedAt).toLocaleString() },
  ]);
}


module.exports = router;

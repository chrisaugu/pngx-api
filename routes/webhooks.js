/**
 * TODO:
 * Add a message queue between receiving and sending payloads out
 */
const { Router } = require("express");
const axios = require("axios");
const Queue = require("bull");
const { verifySignature, generateSignature } = require("../utils");
const { Webhook } = require("../models");
const Env = require("../config/env");
const logger = require("../libs/logger").winstonLogger;
const { randomUUID } = require("crypto");
const path = require("node:path");

const webhookQueue = new Queue("webhook", Env.redis.broker);

const router = Router();
module.exports = router;

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
|----------|-----------|
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
    const webhooks = await Webhook.find().select("-secret");
    res.json(webhooks);
  } catch (error) {
    logger.error("Error occurred", {
      error: error.message,
      stack: error.stack,
      query: req.query,
      params: req.params,
    });
    res.status(500).send("Server Error");
  }
});

router.post("/webhooks", async (req, res) => {
  try {
    const newWebhook = new Webhook(req.body);
    const savedWebhook = await newWebhook.save();
    res.status(201).json(savedWebhook);
  } catch (error) {
    logger.error("Error occurred", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
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
    logger.error("Error occurred", {
      error: error.message,
      stack: error.stack,
      query: req.query,
      params: req.params,
    });
    res.status(500).send("Server Error");
  }
});

router.put("/webhooks/:id", async (req, res) => {
  try {
    const updatedWebhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedWebhook) {
      return res.status(404).send("Webhook not found");
    }
    res.json(updatedWebhook);
  } catch (error) {
    logger.error("Error occurred", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).send("Server Error");
  }
});

router.patch("/webhooks/:id", async (req, res) => {
  try {
    const updatedWebhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedWebhook) {
      return res.status(404).send("Webhook not found");
    }
    res.json(updatedWebhook);
  } catch (error) {
    logger.error("Error occurred", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
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
    logger.error("Error occurred", {
      error: error.message,
      stack: error.stack,
    });
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
      webhookPayload["id"] = `evt_${webhook.id}`;
      await axios.post(webhook?.url, webhookPayload);
    }

    res
      .status(200)
      .json({ message: "Event generated and webhook triggered successfully" });
  } catch (error) {
    logger.error("Error generating event and triggering webhook:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatWebhook(webhook) {
  return [
    { label: "ID", value: webhook.id },
    { label: "Event", value: webhook.event },
    { label: "URL", value: webhook.url },
    {
      label: "Created at",
      value: new Date(webhook.createdAt).toLocaleString(),
    },
    {
      label: "Updated at",
      value: new Date(webhook.updatedAt).toLocaleString(),
    },
  ];
}

router.post("/webhook-endpoint", (req, res) => {
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

router.post("/webhook-endpoint", (req, res) => {
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

function sendWebhook(eventData) {
  axios
    .post("https://thirdparty.service/webhook-receiver", eventData)
    .then((response) =>
      console.log("Webhook sent successfully:", response.data),
    )
    .catch((error) => console.error("Failed to send webhook:", error));
}

// openssl req -nodes -new -x509 -keyout server-key.pem -out server-cert.pem

// Middleware to verify the webhook tooken, signature and timestamp of incoming webhook requests
const verifyWebhookMiddleware = (webhookToken, secret, timeDifference) => {
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

// Middleware to validate client ownership
// const validateClientAccess = async (req, res, next) => {
//   try {
//     const { clientId, resourceId } = req.body;
//     const apiKey = req.headers['x-api-key'];

//     // Get client from API key
//     const client = await Client.findByApiKey(apiKey);

//     if (!client || client.id !== clientId) {
//       return res.status(403).json({ error: 'Unauthorized access to client' });
//     }

//     // If resource specified, verify ownership
//     if (resourceId) {
//       const resource = await Resource.findOne({
//         id: resourceId,
//         clientId: client.id
//       });

//       if (!resource) {
//         return res.status(403).json({ error: 'Resource not owned by client' });
//       }
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ error: 'Auth error' });
//   }
// };

// Endpoint to receive webhook payloads
// router.post('/webhook', verifyWebhookTokenMiddleware(WEBHOOK_TOKEN), (req, res) => {
router.post(
  "/webhook",
  verifyWebhookMiddleware(WEBHOOK_TOKEN, SECRET, MAX_TIME_DIFFERENCE),
  (req, res) => {
    const { event, data } = req.body;
    console.log("Received webhook payload:", req.body);
    // Example: handling a specific event
    if (event === "user.created") {
      console.log(`New user created: ${data.id}`);
      // Add your logic here to handle the new user creation
    }
    res.status(200).send("Webhook received successfully");
  },
);

router.get("/webhooks_form", (req, res) => {
  res.sendFile(path.join(__dirname, "./webhook.html"));
});

router.get("/webhooks_logs", async (req, res) => {
  try {
    const logs = await WebhookLog.find();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
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

// Read (GET) a single webhook by ID
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

// Update (PUT) a webhook by ID
router.put("/webhooks/:id", async (req, res) => {
  try {
    const updatedWebhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
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

// Delete (DELETE) a webhook by ID
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

router.post("/register-webhook", async (req, res) => {
  const { url, events } = req.body;
  const newWebhook = new Webhook({ url, events });
  const savedWebhook = await newWebhook.save();
  console.log("Registered webhook with data:", req.body);
  res.status(201).json(savedWebhook);
});

router.post("/trigger-webhook", async (req, res) => {
  const { event, payload } = req.body;
  const webhooks = await Webhook.find();
  webhooks.forEach((webhook) => {
    if (webhook.events.includes(event)) {
      console.log(
        `Triggering webhook at ${webhook.url} with payload:`,
        payload,
      );
      axios.post(webhook.url, payload).catch((err) => {
        console.error(
          `Error triggering webhook at ${webhook.url}:`,
          err.message,
        );
      });
      sendWithRetry(webhook.url, payload, 3, 500);
    }
  });
  res.status(200).send("Webhooks triggered!");
});

// Event types:
// - client.account.updated (goes to all client's webhooks)
// - client.invoice.paid (goes to all client's webhooks)
// - store.product.created (goes only to webhooks for that specific store)

// router.post('/webhook-trigger/:eventType', async (req, res) => {
//   try {
//     const { eventType } = req.params;
//     const {
//       clientId,
//       storeId,        // Optional: specific store
//       userId,         // Optional: specific user
//       data
//     } = req.body;

//     // Authenticate the request (should come from your internal services)
//     const serviceToken = req.headers['x-service-token'];
//     if (!validateServiceToken(serviceToken)) {
//       return res.status(401).json({ error: 'Invalid service token' });
//     }

//     // Determine scope and find relevant webhooks
//     let webhooks = [];

//     if (storeId) {
//       // Event for a specific store
//       webhooks = await Webhook.find({
//         clientId,
//         'scope.type': 'store',
//         'scope.id': storeId,
//         events: eventType,
//         status: 'active'
//       });
//     } else if (userId) {
//       // Event for a specific user
//       webhooks = await Webhook.find({
//         clientId,
//         'scope.type': 'user',
//         'scope.id': userId,
//         events: eventType,
//         status: 'active'
//       });
//     } else {
//       // Client-wide event
//       webhooks = await Webhook.find({
//         clientId,
//         'scope.type': 'client',
//         events: eventType,
//         status: 'active'
//       });
//     }

//     // Create delivery job
//     const deliveryJob = {
//       id: uuidv4(),
//       eventType,
//       clientId,
//       scope: storeId ? { type: 'store', id: storeId } :
//         userId ? { type: 'user', id: userId } :
//           { type: 'client' },
//       payload: data,
//       webhooks: webhooks.map(w => ({
//         id: w.id,
//         url: w.url,
//         secret: w.secret,
//         format: w.format || 'json'
//       })),
//       createdAt: new Date()
//     };

//     // Queue for delivery
//     await webhookQueue.add(deliveryJob, {
//       attempts: 3,
//       backoff: {
//         type: 'exponential',
//         delay: 2000
//       }
//     });

//     res.status(202).json({
//       message: 'Webhook delivery queued',
//       jobId: deliveryJob.id,
//       webhookCount: webhooks.length,
//       scope: deliveryJob.scope
//     });

//   } catch (error) {
//     console.error('Error triggering webhooks:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Webhook queue processor
// webhookQueue.process(async (job) => {
//   const { webhooks, payload, eventType, clientId, scope } = job.data;

//   const results = await Promise.allSettled(
//     webhooks.map(webhook =>
//       axios.post(webhook.url, {
//         event: eventType,
//         client_id: clientId,
//         scope: scope,
//         data: payload,
//         timestamp: new Date().toISOString()
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Webhook-Signature': generateSignature(webhook.secret, payload),
//           'X-Webhook-ID': job.id,
//           'User-Agent': 'YourApp-Webhook/1.0'
//         },
//         timeout: 10000
//       }).then(response => ({
//         webhookId: webhook.id,
//         status: 'success',
//         statusCode: response.status
//       })).catch(error => ({
//         webhookId: webhook.id,
//         status: 'failed',
//         error: error.message,
//         statusCode: error.response?.status
//       }))
//     )
//   );

//   // Log delivery results
//   await WebhookDeliveryLog.create({
//     jobId: job.id,
//     eventType,
//     clientId,
//     scope,
//     results,
//     completedAt: new Date()
//   });

//   // Check for failures that need retry
//   const failures = results.filter(r => r.value?.status === 'failed');
//   if (failures.length > 0 && job.attemptsMade < 3) {
//     throw new Error(`${failures.length} webhooks failed, will retry`);
//   }
// });

router.post(
  "/generate-event",
  // validateClientAccess,
  async (req, res) => {
    try {
      const { event, data, clientId, resourceId, resourceType } = req.body;

      // // Just queue the event and return immediately
      // queue.push({ event, data, timestamp: Date.now() });

      // // Trigger background processing
      // processQueue();

      // Build query based on event scope
      const query = {
        events: event,
        // status: 'active'
        // isActive: true
      };

      // If event is client-wide (e.g., account settings changed)
      if (clientId && !resourceId) {
        query.clientId = clientId;
      }

      console.log(query);

      // If event is resource-specific (e.g., new comment on specific page)
      if (resourceId) {
        query.resourceId = resourceId;
        query.clientId = clientId; // Still scope to client for security
      }

      // fetch all webhooks that subscribed to this event
      const webhooks = await Webhook.find(query);

      // // Optional: Apply additional filters
      // const applicableWebhooks = webhooks.filter(webhook => {
      //   if (webhook.filters) {
      //     return applyFilters(webhook.filters, data);
      //   }
      //   return true;
      // });

      const unique_id = randomUUID();

      const webhookPayload = {
        // id: unique_id,
        event,
        data,
        clientId,
        timestamp: Date.now(),
      };

      await Promise.allSettled(
        webhooks.map((webhook) => {
          const signature = _generateSignature(
            // req.method,
            // req.url,
            // Date.now(),
            webhook.secret,
            JSON.stringify(req.body),
          );

          sendWebhook(webhook, webhookPayload);

          WebhookLog.create({
            Event: webhookPayload.event,
            WebhookId: webhook.id,
            Status: "success",
            Payload: webhookPayload,
          });
        }),
      );

      // // Store the event first
      // const eventRecord = await Event.create({
      //   type: event,
      //   payload: data,
      //   status: 'pending'
      // });

      // // Return immediately
      // res.status(202).json({
      //   message: 'Event recorded',
      //   eventId: eventRecord.id
      // });

      // processEvent(eventRecord.id);

      res.status(202).json({
        message: "Event accepted for processing",
        status: "queued",
        // message: `Processing event for ${applicableWebhooks.length} webhooks`,
        // scope: resourceId ? 'resource-specific' : 'client-wide'
      });
    } catch (error) {
      console.error("Error generating event and triggering webhook:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);

function sendWebhook(webhook, payload) {
  const { event, data, clientId, unique_id, signature } = payload;

  axios
    .post(webhook?.url, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-xxx-Webhook-Id": unique_id,
        "x-webhook-signature": signature,
        "X-Signature": signature,
        "X-Hub-Signature-256": signature,
        "X-Signature-Algorithm": "sha256",
        "X-Timestamp": Date.now(),
      },
      params: {
        access_token: "YOUR_PAGE_ACCESS_TOKEN",
      },
    })
    .then((res) => {})
    .catch((err) => {});
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendWithRetry = async (url, payload, retries = 1, baseDelayMs = 1000) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      attempt++;
      console.log(`Attempt ${attempt} to send webhook to ${url}...`);

      const response = await axios.post(url, payload);

      console.log(
        `Successfully triggered webhook at ${url}: ${response.status}`,
      );
      return true;
    } catch (err) {
      const status = err.response?.status;
      const msg = status ? `HTTP ${status}` : err.message;

      console.error(`Attempt ${attempt} failed for ${url}: ${msg}`);

      if (attempt > retries) {
        console.error(`No more retries left for ${url}. Giving up.`);
        return false;
      }

      const delay = baseDelayMs * attempt; // Linear backoff
      console.log(`Retrying webhook at ${url} in ${delay}ms...`);
      await sleep(delay);
    }
  }

  return false;
};

const queue = [];

async function processQueue() {
  while (queue.length > 0) {
    const job = queue.shift();

    try {
      const webhooks = await Webhook.find({ events: job.event });

      // Send webhooks in parallel with Promise.allSettled
      const results = await Promise
        .allSettled
        // webhooks.map(webhook => sendWebhook(webhook, job))
        ();

      // Log failures for retry
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          // console.error(`Failed to send to ${webhooks[index].url}:`, result.reason);
          // Add to dead letter queue for retry
          // deadLetterQueue.push({
          //   webhook: webhooks[index],
          //   event: job,
          //   attempts: 1
          // });
        }
      });
    } catch (error) {
      console.error("Queue processing error:", error);
    }
  }
}

// async function processEvent(eventId) {
//   const event = await Event.findById(eventId);
//   const webhooks = await Webhook.find({ events: event.type });

//   for (const webhook of webhooks) {
//     try {
//       await sendWithRetry(webhook, event);
//       await DeliveryLog.create({
//         eventId: event.id,
//         webhookId: webhook.id,
//         status: 'success'
//       });
//     } catch (error) {
//       await DeliveryLog.create({
//         eventId: event.id,
//         webhookId: webhook.id,
//         status: 'failed',
//         error: error.message
//       });
//       // Schedule retry
//       scheduleRetry(event, webhook);
//     }
//   }
// }

function _generateSignature(secret, payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function _verifySignature(secret, signature, payload) {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (hash === signature) {
    // Request is verified
    return true;
  } else {
    // Request could not be verified
    return false;
  }
}

function _verifyGeneratedSignature(
  method,
  url,
  timestamp,
  body,
  secret,
  signature,
) {
  if (!signature) return false;
  const expected = _generateSignature(secret, body);
  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf-8"),
    Buffer.from(signature, "utf-8"),
  );
}

// Function to verify the signature
const verifySignature2 = (secret, payload, signature) => {
  if (!secret || !payload || !signature) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(digest, "utf-8"),
    Buffer.from(signature, "utf-8"),
  );
};

// Middleware to verify the webhook token of incoming webhook requests
const verifyWebhookTokenMiddleware = (webhookToken) => {
  return (req, res, next) => {
    const token = req.headers["x-webhook-token"];

    // Check if webhook teken headers is missing or invalid
    if (!token || token !== webhookToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };
};

// In a production environment, you'll likely need to implement more robust error handling, validation, and asynchronous processing for webhooks.

// Securing the Webhook Endpoint
// Security is paramount when handling webhooks. Here are some essential measures:

// IP Whitelisting: Restrict incoming requests to specific IP addresses to prevent unauthorized access.
// API Keys or Tokens: A secret token or API key is required to be included in the request headers for authentication.
// HTTPS: Use HTTPS to encrypt data transmission.
// Content Verification: Verify the integrity of incoming webhook data using checksums or digital signatures.
// Rate Limiting: Implement rate limiting to protect against abuse and denial-of-service attacks.
// Validating and Processing Incoming Webhook Data
// Before processing webhook data, it's essential to validate it for correctness and security:

// Data Format Validation: Ensure the incoming data adheres to the expected format (JSON, XML, etc.).
// Data Integrity Verification: Check for missing or invalid fields.
// Data Type Validation: Verify that data types match the expected schema.
// Security Checks: Look for potential malicious content or attacks.
// Once validated, process the webhook data based on its content. This might involve storing the data, triggering other actions, or updating the application state.

// Best Practices for Webhook Implementation
// Reliable Delivery: Implement retry mechanisms and dead letter queues for failed deliveries.
// Error Handling: Provide informative error messages and log errors for debugging.
// Scalability: Design your webhook service to handle increasing traffic and data volumes.
// Security: Prioritize security measures like authentication, authorization, and data encryption.
// Documentation: Create clear documentation for developers using your webhook service.

// ✅ Ready to integrate with APIs like Stripe, GitHub, or Slack
// Next steps:
// Add signature verification
// Connect the webhook events to your app’s logic
// Deploy to a cloud service
// The article mentions three ways to secure webhooks:
// Verify the Source
// IP Whitelisting
// Secret Token
// Validate Payload Integrity

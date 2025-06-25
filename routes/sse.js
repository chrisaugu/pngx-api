const { Router, json } = require("express");
const Redis = require("ioredis");
const jwt = require("jsonwebtoken");
const logger = require("../libs/logger").winstonLogger;
const { SYMBOLS } = require("../constants");

const router = Router();
const redis = new Redis(6379); // for publishing
const subscriber = new Redis(6379); // for consuming

subscriber.on("error", async (err) => {
  logger.error("Redis error:", err);
  await subscriber.quit();
  process.exit();
});

redis.on("error", async (err) => {
  logger.error("Redis error:", err);
  await redis.quit();
  process.exit();
});
process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing Redis connections...");
  await redis.quit();
  process.exit();
});

// // Or when creating the client
// const redis = new Redis({
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// });

// use redis to store clients
const clients = new Set();
const facts = [];

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 *
 * topics i.e. stocks:BSP, stocks:CPL
 * ?topics=stocks:BSP
 * channel i.e. stocks:BSP,stocks:CPL
 * ?channel=stocks:BSP,stocks:CPL
 *
 * stocks:* - all stock updates
 * stocks:BSP - all BSP stock updates
 * stocks:priceChange - subscribe to all stocks price change
 * stocks:alert:BSP - price alerts for BSP
 * stocks:portfolio:user1	Portfolio summary updates for user1
 * system:heartbeat - system heartbeat for 10 secs
 * logs:error	System errors
 *
 *
 * tickers:*
 * ticker:BSP = {time: '2025-04-21', high: 0, low: 0, open: 0, close: 0}
 *
 * quotes:*
 * quotes:BSP = {}
 *
 *
 */
// topic-based channel
async function eventsHandler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // res.flushHeaders();

  logger.info("SSE connection established");

  const topics = req.query.topics?.split(",") || [];
  const channel = req.query.channel; // quotes,tickers,news
  // const channel2 = req.headers["X-Channel"];

  const token = req.headers["X-Access-Token"];
  const apiVersion = req.headers["X-API-Version"];

  // if (!token) return res.status(401).end("No token provided");
  // else {
  //   const payload = jwt.verify(token, "my-secret-key");
  //   // const userId = payload.id;
  // }

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res,
  };

  clients.add(newClient);

  logger.info(`New client connected: ${clientId}`);

  // many topics
  if (topics) {
    for (const topic of topics) {
      await subscriber.subscribe(topic);
    }

    subscriber.on("message", (topic, message) => {
      res.write(`id: ${clientId}\n`);
      res.write(`retry: 10000\n`); // retry after 10 seconds
      res.write(`event: ${topic}\n`);
      res.write(`data: ${message}\n\n`);
    });

    req.on("close", () => {
      logger.info(`Client ${clientId} disconnected`);
      topics.forEach((topic) => subscriber.unsubscribe(topic));
      res.end();
    });
  }

  // one channel
  if (channel) {
    subscriber.subscribe(channel);
    logger.info(`Subscribed to channel: ${channel}`);

    subscriber.on("message", (_, message) => {
      res.write(`event: ${channel}\n`);
      res.write(`data: ${message}\n\n`);
    });

    req.on("close", () => {
      logger.info(`Client ${clientId} disconnected from channel: ${channel}`);
      subscriber.unsubscribe(channel);
      res.end();
    });
  }

  // const sub = new Redis(6379);
  // sub.subscribe("quotes");

  // sub.on("message", (_, message) => {
  //   res.write(`event: quotes\n`);
  //   res.write(`data: ${message}\n\n`);
  // });

  // // When client closes connection, stop sending events
  // req.on("close", () => {
  //   console.log(`${clientId} Connection closed`);
  //   // clients.filter((client) => client.id !== clientId);
  //   clients.delete(clientId);

  //   sub.unsubscribe(channel);
  //   sub.quit();

  //   topics.forEach((topic) => subscriber.unsubscribe(topic));

  //   res.end();
  // });
}

const sendEvent = (clientId, data) => {
  res.write(`id: ${clientId}\n`);
  return res.write(`data: ${JSON.stringify(data)}\n\n`);
};

function sendEventsToAll(newFact) {
  logger.info("Sending new fact to all clients:", newFact);
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(newFact)}\n\n`)
  );
}

async function addFact(request, response, next) {
  const newFact = request.body;
  facts.push(newFact);
  return sendEventsToAll(newFact);
}

router.get("/", eventsHandler);
router.post("/fact", addFact);

router.get("/logs/stream", (req, res) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Handle client disconnect
  req.on("close", () => {
    // Clean up if needed
    logger.info("Client disconnected");
  });

  // Your process that generates logs
  const streamLogs = async () => {
    try {
      // Example: simulate a process with multiple steps
      const steps = [
        "Starting process...",
        "Loading data...",
        "Processing...",
        "Finishing up...",
      ];

      for (const message of steps) {
        // Send log as SSE
        res.write(
          `data: ${JSON.stringify({
            timestamp: new Date(),
            message: message,
          })}\n\n`
        );

        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: error.message,
          timestamp: new Date(),
        })}\n\n`
      );
    } finally {
      res.write(
        `data: ${JSON.stringify({
          type: "end",
          message: "Stream ended",
        })}\n\n`
      );
      res.end();
    }
  };

  streamLogs();
});

module.exports = router;

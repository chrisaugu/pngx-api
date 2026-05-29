const crypto = require("node:crypto");
const { Router, json } = require("express");
const jwt = require("jsonwebtoken");
const logger = require("../libs/logger").winstonLogger;
const { SYMBOLS } = require("../constants");
const { createRedisIoClient } = require("../libs/redis");

const router = Router();
const redis = createRedisIoClient(); // for publishing
const subscriber = createRedisIoClient(); // for consuming

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

// use redis to store clients
const clients = new Set();
const facts = [];
const topicCounts = new Map();

async function addTopic(topic) {
  const count = topicCounts.get(topic) || 0;

  if (count === 0) {
    await subscriber.subscribe(topic);
  }

  topicCounts.set(topic, count + 1);
}

async function removeTopic(topic) {
  const count = topicCounts.get(topic);

  if (!count) return;

  if (count === 1) {
    await subscriber.unsubscribe(topic);
    topicCounts.delete(topic);
  } else {
    topicCounts.set(topic, count - 1);
  }
}

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

subscriber.on("message", (topic, message) => {
  for (const client of clients) {
    if (!client.topics.has(topic)) continue;

    client.res.write(`event: ${topic}\n`);
    client.res.write(`data: ${message}\n\n`);
    // res.write(`id: ${clientId}\n`);
    // res.write(`retry: 10000\n`); // retry after 10 seconds
    // res.write(`event: ${topic}\n`);
    // res.write(`data: ${message}\n\n`);
  }
});
// subscriber.on("message", (_, message) => {
//   res.write(`event: ${channel}\n`);
//   res.write(`data: ${message}\n\n`);
// });

// topic-based channel
async function eventsHandler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  // res.flushHeaders();

  logger.info("SSE connection established");

  const topics = new Set(req.query.topics?.split(",") || []);
  const channel = req.query.channel; // quotes,tickers,news
  // const channel2 = req.headers["X-Channel"];

  const token = req.headers["X-Access-Token"];
  const apiVersion = req.headers["X-API-Version"];

  // if (!token) return res.status(401).end("No token provided");
  // else {
  //   const payload = jwt.verify(token, "my-secret-key");
  //   // const userId = payload.id;
  // }

  // const MAX_CACHE = 1000;

  // cache.push(event);

  // if (cache.length > MAX_CACHE) {
  //   cache.shift();
  // }

  const newClient = {
    id: crypto.randomUUID(),
    topics,
    res,
  };

  clients.add(newClient);

  logger.info(`New client connected: ${newClient.id}`);

  // many topics
  if (topics) {
    // subscribe once globally
    for (const topic of topics) {
      await addTopic(topic);
    }

    req.on("close", async () => {
      logger.info(`Client ${newClient.id} disconnected`);
      // topics.forEach((topic) => subscriber.unsubscribe(topic));

      for (const topic of topics) {
        await removeTopic(topic);
      }

      clients.delete(newClient);
      res.end();
    });
  }

  // one channel
  if (channel) {
    subscriber.subscribe(channel);
    logger.info(`Subscribed to channel: ${channel}`);

    req.on("close", () => {
      logger.info(
        `Client ${newClient.id} disconnected from channel: ${channel}`
      );
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
  //   logger.info(`${newClient.id} Connection closed`);
  //   // clients.filter((client) => client.id !== newClient.id);
  //   clients.delete(newClient.id);

  //   sub.unsubscribe(channel);
  //   sub.quit();

  //   topics.forEach((topic) => subscriber.unsubscribe(topic));

  //   res.end();
  // });
}

function broadcast(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;

  for (const client of clients) {
    client.write(data);
  }
}

const sendEvent = (clientId, data) => {
  res.write(`id: ${clientId}\n`);
  return res.write(`data: ${JSON.stringify(data)}\n\n`);
};

function sendEventsToAll(newFact) {
  logger.info("Sending new fact to all clients:", newFact);
  const data = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach((client) => client.res.write(data));
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

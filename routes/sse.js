const { Router } = require("express");
const Redis = require("ioredis");
const jwt = require("jsonwebtoken");

const router = Router();
const redis = new Redis(); // for publishing
const subscriber = new Redis(); // for consuming
const watchlists = require("./userWatchlists");
const { SYMBOLS } = require("../constants");

// use redis to store clients
const clients = new Set();
const facts = [];

// auth.js start
// const jwt = require("jsonwebtoken");

function issueToken(user) {
  return jwt.sign({ id: user.id }, "my-secret-key", { expiresIn: "1h" });
}
// auth.js end

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
async function eventsHandler(req, res, next) {
  // Set headers to keep the connection alive and tell the client we're sending event-stream data
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  const topics = req.query.topics?.split(",") || [];
  const channel = req.query.channel || "default"; // quotes,tickers,news
  // const channel2 = req.headers["X-Channel"];
  const token = req.headers["X-Access-Token"];
  const userId = req.query.user;

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

  // many topics
  if (topics) {
    const sub = new Redis();
    for (const topic of topics) {
      await sub.subscribe(topic);
    }

    sub.on("message", (topic, message) => {
      res.write(`event: ${topic}\n`);
      res.write(`data: ${message}\n\n`);
    });

    req.on("close", () => {
      topics.forEach((topic) => sub.unsubscribe(topic));
      res.end();
    });
  }

  // one channel
  if (channel) {
    const sub = new Redis();
    sub.subscribe(channel);

    sub.on("message", (_, message) => {
      res.write(`event: ${channel}\n`);
      res.write(`data: ${message}\n\n`);
    });

    req.on("close", () => {
      sub.unsubscribe(channel);
      res.end();
    });
  }

  // watchlist
  if (userId) {
    const tickers = watchlists[userId];
    // const watchlist = await getUserWatchlist(userId);

    if (!tickers || tickers.length === 0) {
      return res.status(400).send("No watchlist found.");
    }

    const sub = new Redis();

    tickers.forEach((ticker) => sub.subscribe(ticker));

    sub.on("message", (channel, message) => {
      res.write(`event: ${channel}\n`);
      res.write(`data: ${message}\n\n`);
    });

    req.on("close", () => {
      tickers.forEach((t) => sub.unsubscribe(t));
      // sub.quit();
      res.end();
    });
  }

  // const sub = new Redis();
  // sub.subscribe("quotes");

  // sub.on("message", (_, message) => {
  //   res.write(`event: quotes\n`);
  //   res.write(`data: ${message}\n\n`);
  // });

  // When client closes connection, stop sending events
  // req.on("close", () => {
  //   console.log(`${clientId} Connection closed`);
  //   // clients.filter((client) => client.id !== clientId);
  //   clients.delete(clientId);

  //   sub.unsubscribe(channel);
  //   sub.quit();

  //   topics.forEach((topic) => subscriber.unsubscribe(topic));

  //   res.end();
  // });

  const sendEvent = (data) => {
    return res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
}

function sendEventsToAll(newFact) {
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

module.exports = router;

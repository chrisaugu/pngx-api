const Redis = require("ioredis");
const { SYMBOLS } = require("../constants");

const subscriber = new Redis(6379);
const channel = "tickers";
const topics = SYMBOLS.map((code) => "tickers:" + code);

subscriber.on("error", async (err) => {
  console.error("Redis error:", err);
  await subscriber.quit();
  process.exit();
});
process.on("SIGINT", async () => {
  await subscriber.quit();
  process.exit();
});

if (topics) {
  const sub = new Redis(6379);
  for (const topic of topics) {
    sub.subscribe(topic);
  }

  sub.on("message", writer);

  //   req.on("close", () => {
  //     topics.forEach((topic) => sub.unsubscribe(topic));
  //     res.end();
  //   });
}

// one channel
// if (channel) {
//   const sub = new Redis(6379);
//   sub.subscribe(channel);

//   sub.on("message", (_, message) => {
//     console.log(message)
//   });

// //   req.on("close", () => {
// //     sub.unsubscribe(channel);
// //     res.end();
// //   });
// }

/**
 * writes message for each topics to stdout
 * @param {*} topic
 * @param {*} message
 */
function writer(topic, message) {
  // res.write(`event: ${topic}\n`);
  // res.write(`data: ${message}\n\n`);
  console.log(topic, message);
}

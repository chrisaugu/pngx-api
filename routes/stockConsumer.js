const { SYMBOLS, TOPICS, CHANNELS } = require("../constants");
const { createRedisIoClient } = require("../libs/redis");

const subscriber = createRedisIoClient();

subscriber.on("error", async (err) => {
  console.error("Redis error:", err);
  await subscriber.quit();
  process.exit();
});
process.on("SIGINT", async () => {
  await subscriber.quit();
  process.exit();
});

if (TOPICS) {
  const sub = createRedisIoClient();
  for (const topic of TOPICS) {
    sub.subscribe(topic);
  }

  sub.on("message", writer);

  //   req.on("close", () => {
  //     TOPICS.forEach((topic) => sub.unsubscribe(topic));
  //     res.end();
  //   });
}

// one channel
// if (channel) {
//   const sub = createRedisIoClient();
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

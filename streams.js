const redis = require("./libs/redis").createRedisIoClient();

// await this.client.set('user', name);
// const result = await this.client.get('user');
// return JSON.stringify(result);

redis.on("error", async (err) => {
  console.error("Redis error:", err);
  await redis.quit();
  process.exit();
});

const processMessage = (message) => {
  console.log("Id: %s. Data: %O", message[0], message[1]);
};

async function listenForMessage(lastId = "$") {
  // `results` is an array, each element of which corresponds to a key.
  // Because we only listen to one key (mystream) here, `results` only contains
  // a single element. See more: https://redis.io/commands/xread#return-value
  const results = await redis.xread("block", 0, "STREAMS", "mystream", lastId);
  const [key, messages] = results[0]; // `key` equals to "mystream"

  messages.forEach(processMessage);

  // Pass the last id of the results to the next round.
  await listenForMessage(messages[messages.length - 1][0]);
}

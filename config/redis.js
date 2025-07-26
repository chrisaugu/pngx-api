const Env = require("./env");

module.exports.redisConfig = {
  port: 6379,
  host: "localhost",
  url: process.env.REDIS_URL || "redis://127.0.0.2:6379",
};

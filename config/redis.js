const Env = require("./env");

module.exports.redisConfig = {
  username: process.env.REDIS_USER || "redis",
  password: process.env.REDIS_PASS || "secret",
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || "localhost",
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
};

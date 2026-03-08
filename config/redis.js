const Env = require("./env");

module.exports.redisConfig = {
  username: "default" || "redis",
  password: "62XYZ42fkK3BXuF2qMdccTH94UltWWkQ" || "secret",
  socket: {
    host:
      "redis-19155.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com" ||
      "localhost",
    port: 19155 || 6379,
  },
  port: 6379,
  host: "localhost",
  url: process.env.REDIS_URL || "redis://127.0.0.2:6379",
};

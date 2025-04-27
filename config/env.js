require("dotenv").config();

const Env = {
  redis: {
    broker: process.env.REDIS_URL,
    backend: "redis://127.0.0.1:6379",
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  API_SECRET: process.env.API_SECRET,
  MAX_TIME_DIFFERENCE: 60,
  ...process.env,
};

module.exports = Env;

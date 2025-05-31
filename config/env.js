require("dotenv").config();

const Env = {
  redis: {
    broker: process.env.REDIS_URL,
    backend: process.env.REDIS_BACKEND_URL,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  ...process.env,
};

module.exports = Env;

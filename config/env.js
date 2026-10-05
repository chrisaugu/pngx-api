const path = require("path");
const dotenv = require("dotenv");

// const env = process.env.NODE_ENV || "development";

// let envPath;
// if (env === "production") {
//   envPath = path.resolve(process.cwd(), `.env.${env}`);
// } else {
//   envPath = path.resolve(process.cwd(), `.env`);
// }

// const result = dotenv.config({ path: envPath });
dotenv.config();
// if (result.error) {
//   throw result.error;
// }

// const { parsed: envs } = result;

const Env = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
  redis: {
    broker: process.env.REDIS_URL,
    backend: process.env.REDIS_BACKEND_URL,
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    user: process.env.REDIS_USER || "redis",
    password: process.env.REDIS_PASSWORD || "secret",
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
    remote: process.env.MONGODB_URI_REMOTE,
    local: process.env.MONGODB_URI_LOCAL,
    name: process.env.MONGODB_NAME,
  },
  MAX_TIME_DIFFERENCE: process.env.MAX_TIME_DIFFERENCE,
  WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN,
  CACHE_DURATION: process.env.CACHE_DURATION,
};

module.exports = Env;

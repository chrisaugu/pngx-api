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
const result = dotenv.config();
if (result.error) {
  throw result.error;
}

const { parsed: envs } = result;

const Env = {
  redis: {
    broker: process.env.REDIS_URL,
    backend: process.env.REDIS_BACKEND_URL,
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  ...envs,
};

module.exports = Env;

import path from "path";
import dotenv from "dotenv";

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

const Env: Record<string, any> = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
  redis: {
    broker: process.env.REDIS_URL,
    backend: process.env.REDIS_BACKEND_URL,
    url: process.env.REDIS_URL || "redis://redis:secret@localhost:6379",
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    user: process.env.REDIS_USER || "redis",
    password: process.env.REDIS_PASSWORD || "secret",
  },
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/pngx-db",
    remote:
      process.env.MONGODB_URI_REMOTE || "mongodb://localhost:27017/pngx-db",
    local: process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/pngx-db",
    name: process.env.MONGODB_NAME || "pngx-db",
  },
  MAX_TIME_DIFFERENCE: process.env.MAX_TIME_DIFFERENCE || 60,
  WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN,
  CACHE_DURATION: process.env.CACHE_DURATION,
};

export default Env;

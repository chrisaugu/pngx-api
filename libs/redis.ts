import Redis from "ioredis";
import { createClient } from "redis";

const logger = require("./logger").winstonLogger;
import { redisConfig } from "../config/redis";

export const createRedisClient = async () => {
  const redisClient = createClient(redisConfig.url);

  // redisClient.on("connect", () => {
  //   logger.info("✅ Redis client connected successfully");
  // });

  redisClient.on("error", async (err) => {
    logger.error("❌ Redis connection error:", err);
    await redisClient.quit();
    process.exit();
  });

  // process.on("SIGINT", async () => {
  //   logger.info("SIGINT received, closing Redis connections...");
  //   await redisClient.quit();
  //   process.exit();
  // });

  // await redisClient.connect();

  // await redisClient.set("foo", "bar");
  // const result = await redisClient.get("foo");
  // console.log(result); // >>> bar


  return redisClient;
};

export const createRedisIoClient = () => {
  const ioRedisClient = new Redis(redisConfig.url);
  // client = new Redis(process.env.UPSTASH_REDIS_URL);
  // Or when creating the client
  // const redis = new Redis({
  //   retryStrategy: (times) => {
  //     const delay = Math.min(times * 50, 2000);
  //     return delay;
  //   }
  // });

  ioRedisClient.on("error", async (err) => {
    logger.error("RedisIo error:", err);
    await ioRedisClient.quit();
    process.exit();
  });

  // process.on("SIGINT", async () => {
  //   logger.info("SIGINT received, closing RedisIo connections...");
  //   await ioRedisClient.quit();
  //   process.exit();
  // });

  return ioRedisClient;
};

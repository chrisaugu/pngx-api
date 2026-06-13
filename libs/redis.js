const RedisIO = require("ioredis");
const { createClient } = require("redis");
const logger = require("./logger").winstonLogger;
const { redisConfig } = require("../config/redis");

let redisClient;

exports.getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: redisConfig.url,
    });

    redisClient.on("connect", () => {
      logger.info("✅ Redis client connected successfully");
    });

    redisClient.on("error", async (err) => {
      logger.error("❌ Redis connection error:", err);
      await redisClient.quit();
      process.exit();
    });

    redisClient.on("reconnecting", () => {
      logger.info("Redis reconnecting...");
    });

    redisClient.on("end", () => {
      logger.info("Redis connection closed");
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, closing Redis connections...");
      await redisClient.quit();
      process.exit();
    });

    await redisClient.connect();
  }

  // await redisClient.set("foo", "bar");
  // const result = await redisClient.get("foo");
  // logger.info(result); // >>> bar

  return redisClient;
  // } catch (err) {
  //   logger.error("Failed to create Redis client:", err);

  //   // Return a mock client that stores data in memory as fallback
  //   logger.info("Using in-memory fallback for Redis");

  //   const mockStorage = {};

  //   return {
  //     get: async (key) => mockStorage[key] || null,
  //     set: async (key, value, options) => {
  //       mockStorage[key] = value;
  //       // Handle expiration if EX option provided
  //       if (options && options.EX) {
  //         setTimeout(() => {
  //           delete mockStorage[key];
  //         }, options.EX * 1000);
  //       }
  //       return "OK";
  //     },
  //     del: async (key) => {
  //       if (mockStorage[key]) {
  //         delete mockStorage[key];
  //         return 1;
  //       }
  //       return 0;
  //     },
  //     keys: async (pattern) => {
  //       const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
  //       return Object.keys(mockStorage).filter((key) => regex.test(key));
  //     },
  //     // Add other Redis commands as needed for your application
  //     hSet: async () => "OK",
  //     hGetAll: async () => ({}),
  //     zAdd: async () => 1,
  //     zRange: async () => [],
  //     zRem: async () => 1,
  //     exists: async () => 0,
  //   };
  // }
};

let ioRedisClient;
exports.createRedisIoClient = () => {
  if (!ioRedisClient) {
    ioRedisClient = new RedisIO(redisConfig.url);
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
  }

  return ioRedisClient;
};

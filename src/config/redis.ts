import Env from "./env";

const redisConfig = {
  username: Env.redis.user || "redis",
  password: Env.redis.password || "secret",
  socket: {
    host: Env.redis.host || "localhost",
    port: Env.redis.port || 6379,
  },
  port: Env.redis.port || 6379,
  host: Env.redis.host || "localhost",
  url: Env.redis.url || "redis://127.0.0.1:6379",
};

export { redisConfig };

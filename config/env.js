const Env = {
    redis: {
        broker: process.env.REDIS_URL,
        backend: "redis://127.0.0.1:6379"
    },
    mongodb: {
        uri: process.env.MONGODB_URI
    },
    ...process.env
}

module.exports = Env;
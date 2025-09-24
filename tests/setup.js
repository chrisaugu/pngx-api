const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  global.__MONGO_URI__ = mongoUri;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

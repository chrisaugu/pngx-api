const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

describe("News E2E", () => {
  // beforeAll(async () => {
  //   await mongoose.connect(global.__MONGO_URI__, {});
  // });

  // afterAll(async () => {
  //   await mongoose.connection.close();
  // });

  describe("News Source Management Flow", () => {
    it("should complete full CRUD flow for news sources", async () => {
      // Create
      const createResponse = await request(app)
        .post("/api/v2/news/sources")
        .send({
          name: "E2E Test Source",
          url: "https://e2e-test.com",
        });

      expect(createResponse.status).toBe(201);

      // Read all
      const getAllResponse = await request(app).get("/api/v2/news/sources");

      expect(getAllResponse.status).toBe(200);
      expect(getAllResponse.body.data.length).toBeGreaterThan(0);

      const sourceId =
        createResponse.body._id || getAllResponse.body.data[0]._id;

      // Read specific
      const getOneResponse = await request(app).get(
        `/api/v2/news/sources/${sourceId}`
      );

      expect(getOneResponse.status).toBe(200);

      // Update
      const updateResponse = await request(app)
        .put(`/api/v2/news/sources/${sourceId}`)
        .send({
          name: "Updated E2E Source",
          url: "https://updated-e2e.com",
        });

      expect(updateResponse.status).toBe(200);

      // Delete
      const deleteResponse = await request(app).delete(
        `/api/v2/news/sources/${sourceId}`
      );

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe("News Fetching Flow", () => {
    it("should fetch news with pagination", async () => {
      const response = await request(app).get("/api/v2/news?page=1");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

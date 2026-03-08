const { expect } = require("chai");
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const newsRoutes = require("../../routes/v2");
const NewsSource = require("../../models/news-source.model");

describe("Express App", () => {
  const app = express();
  app.use("/news", routes);

  it("should respond with a greeting message", async () => {
    const response = await request(app).get("/greet/John");
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("message");
    expect(response.body.message).to.equal("Hello, John!");
  });
});

const app = express();
app.use(express.json());
app.use("/api/v2", newsRoutes);

// Mock logger
// jest.mock("../../utils/logger", () => ({
//   info: jest.fn(),
//   debug: jest.fn(),
//   error: jest.fn(),
// }));

jest.mock('chai');

// Mock fetch
global.fetch = jest.fn();

describe("News Routes", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await NewsSource.deleteMany({});
    jest.clearAllMocks();
  });

  describe("GET /news", () => {
    it("should fetch news from multiple sources", async () => {
      const mockNewsData = [
        { id: 1, title: "News 1", date: "2023-01-01" },
        { id: 2, title: "News 2", date: "2023-01-02" },
      ];

      fetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockNewsData),
      });

      const response = await request(app).get("/api/v2/news");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(6); // 3 sources * 2 items each
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("should handle fetch errors gracefully", async () => {
      fetch.mockRejectedValue(new Error("Network error"));

      const response = await request(app).get("/api/v2/news");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /news/sources", () => {
    it("should return all news sources", async () => {
      const sources = [
        { name: "Source 1", url: "https://source1.com" },
        { name: "Source 2", url: "https://source2.com" },
      ];

      await NewsSource.insertMany(sources);

      const response = await request(app).get("/api/v2/news/sources");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe("POST /news/sources", () => {
    it("should create a new news source", async () => {
      const newSource = {
        name: "New Source",
        url: "https://newsource.com",
      };

      const response = await request(app)
        .post("/api/v2/news/sources")
        .send(newSource);

      expect(response.status).toBe(201);

      const sources = await NewsSource.find({});
      expect(sources).toHaveLength(1);
      expect(sources[0].name).toBe(newSource.name);
    });

    it("should return error for missing name", async () => {
      const response = await request(app)
        .post("/api/v2/news/sources")
        .send({ url: "https://test.com" });

      expect(response.status).toBe(300);
      expect(response.body.message).toContain("Name");
    });

    it("should return error for missing url", async () => {
      const response = await request(app)
        .post("/api/v2/news/sources")
        .send({ name: "Test Source" });

      expect(response.status).toBe(300);
      expect(response.body.message).toContain("URL");
    });
  });

  describe("GET /news/sources/:id", () => {
    it("should return a specific news source", async () => {
      const source = await NewsSource.create({
        name: "Test Source",
        url: "https://test.com",
      });

      const response = await request(app).get(
        `/api/v2/news/sources/${source._id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Test Source");
    });

    it("should return 500 for invalid id", async () => {
      const response = await request(app).get(
        "/api/v2/news/sources/invalid-id"
      );

      expect(response.status).toBe(500);
    });
  });

  describe("PUT /news/sources/:id", () => {
    it("should update a news source", async () => {
      const source = await NewsSource.create({
        name: "Old Name",
        url: "https://old.com",
      });

      const response = await request(app)
        .put(`/api/v2/news/sources/${source._id}`)
        .send({ name: "New Name", url: "https://new.com" });

      expect(response.status).toBe(200);

      const updatedSource = await NewsSource.findById(source._id);
      expect(updatedSource.name).toBe("New Name");
      expect(updatedSource.url).toBe("https://new.com");
    });
  });

  describe("DELETE /news/sources/:id", () => {
    it("should delete a news source", async () => {
      const source = await NewsSource.create({
        name: "To Delete",
        url: "https://delete.com",
      });

      const response = await request(app).delete(
        `/api/v2/news/sources/${source._id}`
      );

      expect(response.status).toBe(200);

      const deletedSource = await NewsSource.findById(source._id);
      expect(deletedSource).toBeNull();
    });
  });
});

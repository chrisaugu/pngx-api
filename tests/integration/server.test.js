const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

/* Dropping the database and closing connection after each test. */
afterEach(async () => {
  // await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("GET /api/health", () => {
  it("should return healt check", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
  });
});

/* Testing the API endpoints. */
describe("GET /api/v1", () => {
  it("should return all public companies", async () => {
    const res = await request(app).get("/api/v1");

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("GET /api/v1/stocks", () => {
  it("should return a list of stocks", async () => {
    const response = await request(app).get("/api/v1/stocks");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
  });
});

describe("GET /api/v1/historicals/:code", () => {
  it("should return a stock", async () => {
    const response = await request(app).get("/api/v1/historicals/BSP");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
  });

  it("should return an error for invalid stock CODE", async () => {
    const response = await request(app).get("/api/v1/historicals/CODE");

    expect(response.status).toBe(204);
    // expect(response.body).toBeInstanceOf(Object);
  });
});

// describe("GET /api/products/:id", () => {
//   it("should return a product", async () => {
//     const res = await request(app).get(
//       "/api/products/6331abc9e9ececcc2d449e44"
//     );
//     expect(res.statusCode).toBe(200);
//     expect(res.body.name).toBe("Product 1");
//   });
// });

// describe("POST /api/products", () => {
//   it("should create a product", async () => {
//     const res = await request(app).post("/api/products").send({
//       name: "Product 2",
//       price: 1009,
//       description: "Description 2",
//     });
//     expect(res.statusCode).toBe(201);
//     expect(res.body.name).toBe("Product 2");
//   });
// });

// describe("PUT /api/products/:id", () => {
//   it("should update a product", async () => {
//     const res = await request(app)
//       .patch("/api/products/6331abc9e9ececcc2d449e44")
//       .send({
//         name: "Product 4",
//         price: 104,
//         description: "Description 4",
//       });
//     expect(res.statusCode).toBe(200);
//     expect(res.body.price).toBe(104);
//   });
// });

// describe("DELETE /api/products/:id", () => {
//   it("should delete a product", async () => {
//     const res = await request(app).delete(
//       "/api/products/6331abc9e9ececcc2d449e44"
//     );
//     expect(res.statusCode).toBe(200);
//   });
// });

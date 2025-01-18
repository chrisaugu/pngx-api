const { expect } = require("chai");
const request = require("supertest");
const express = require("express");
const routes = require("../../routes");

describe("Express App", () => {
  const app = express();
  app.use("/", routes);

  it("should respond with a greeting message", async () => {
    const response = await request(app).get("/greet/John");
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("message");
    expect(response.body.message).to.equal("Hello, John!");
  });
});

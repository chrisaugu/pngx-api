const request = require("supertest");
const { expect, jest, test } = require("@jest/globals");

const app = require("../../app");

test("that 1 is equal 1", () => {
  assert.strictEqual(1, 1);
});

test("that throws as 1 is not equal 2", () => {
  // throws an exception because 1 != 2
  assert.strictEqual(1, 2);
});

describe("GET /users", () => {
  it("should return a list of users", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(200);

    expect(response.body).toBeInstanceOf(Array); // check if response is an array
  });

  it("should return an error for invalid user ID", async () => {
    const response = await request(app).get("/users/invalidID");

    expect(response.status).toBe(400); // expect a bad request error
  });
});

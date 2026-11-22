// Sample Integration Test in Express.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Integration Tests for User Management", () => {
  it("should create a new user", (done) => {
    chai
      .request(app)
      .post("/api/users")
      .send({ username: "braveknight", password: "secret" })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("userId");
        done();
      });
  });

  it("should retrieve user information", (done) => {
    chai
      .request(app)
      .get("/api/users/braveknight")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.username).to.equal("braveknight");
        done();
      });
  });
});

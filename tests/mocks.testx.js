// Mocking & Stubbing Example in Express.js
const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Route with External Dependency", () => {
  it("should handle external dependency gracefully", (done) => {
    // Creating a stub for the external dependency
    const externalStub = sinon
      .stub(externalService, "fetchData")
      .resolves({ result: "mocked data" });

    chai
      .request(app)
      .get("/api/external-data")
      .end((err, res) => {
        // Assertion based on the mocked data
        expect(res).to.have.status(200);
        expect(res.body.data).to.equal("mocked data");

        // Restoring the stub after the test
        externalStub.restore();
        done();
      });
  });
});

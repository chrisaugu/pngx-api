const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
// const { loadFixtures, clearFixtures } = require("./fixtures.testx");

chai.use(chaiHttp);
const expect = chai.expect;

describe("API with Fixture Data", () => {
  // Loading fixtures before running the tests
  before(() => loadFixtures());

  // Clearing fixtures after all tests are executed
  after(() => clearFixtures());

  it("should return data from fixtures", (done) => {
    chai
      .request(app)
      .get("/api/fixture-data")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data).to.equal("predefined data from fixtures");
        done();
      });
  });
});

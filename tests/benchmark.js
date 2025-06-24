const Benchmark = require("benchmark");
const suite = new Benchmark.Suite();

// Add tests
suite
  .add("Test 1", function () {
    let sum = 0;
    for (let i = 0; i < 1e6; i++) {
      sum += Math.sqrt(i);
    }
  })
  .add("Test 2", function () {
    let sum = 0;
    for (let i = 0; i < 1e6; i++) {
      sum += Math.pow(i, 0.5);
    }
  })
  // Add listeners
  .on("cycle", function (event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // Run async
  .run({ async: true });

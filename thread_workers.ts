import { Worker, isMainThread, workerData, parentPort } from "node:worker_threads";
import { stock_fetcher, data_fetcher } from "./tasks";
import { initDatabase } from "./database";

// Creating an instance for MongoDB
initDatabase()
  .on("connected", function () {
    console.log("[Threads_Worker]: Connected: Successfully connect to mongo server on the worker");
  })
  .on("error", function () {
    console.log("[Threads_Worker]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?");
  });

// if (isMainThread) {
//   const data = 'some data';
//   const worker = new Worker(import.meta.filename, { workerData: data });
//   worker.on('message', msg => console.log('Reply from Thread:', msg));
// }
// else {
//   // do CPU intensive tasks
//   const source = workerData; // data sent from main thread
//   parentPort.postMessage(btoa(source.toUpperCase()));
// }

(async () => {
  let result = await data_fetcher();
  parentPort?.postMessage('completed');
})();

// var num = parseInt(prompt("enter num"));
//   var all = (1 << num) - 1;
//   count = 0;
//   for (var i = 0; i < num; i++) {
//     var cols = 2 ** i;
//     var ld = 2 ** (i + 1);
//     var rd = 0;
//     if (i > 0) {
//       rd = 2 ** (i - 1);
//     }
//     var myWorker = new Worker('queenWorker.js');
//     myWorker.addEventListener('message', function(e) {
//       count += e.data;
//       console.log('worker count: ', e.data);
//     }, false);
//     myWorker.postMessage([ld, cols, rd, all]);
//   }

// self.addEventListener('message', function(e) {
//   let count = 0;
//   var findSolutions = function(ld, cols, rd, all) {
//     let poss = ~(ld | cols | rd) & all;
//     if (cols === all) {
//       count++;
//     }
//     while (poss) {
//       let negPoss = poss * -1;
//       let bit = poss & negPoss;
//       //let bit = poss & -poss;
//       poss = poss - bit;
//       findSolutions((ld | bit) << 1, cols | bit, (rd | bit) >> 1, all);
//     }
//   };
//   findSolutions(e.data[0], e.data[1], e.data[2], e.data[3]);
//   self.postMessage(count);
// }, false);

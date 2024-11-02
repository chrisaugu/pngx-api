const { Worker, isMainThread, workerData, parentPort } = require('node:worker_threads');
const { stock_fetcher, data_fetcher } = require('./tasks');
const { initDatabase } = require('./database');
require('dotenv').config();

// Creating an instance for MongoDB

initDatabase()
.on("connected", async function() {
	console.log("[Worker_Threads]: Connected: Successfully connect to mongo server on the worker");
  
  let result = await data_fetcher();
  parentPort.postMessage(result);
})
.on('error', function() {
	console.log("[Worker_Threads]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?");
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

// (async () => {
//   let result = await data_fetcher();
//   parentPort.postMessage(result);
// })();

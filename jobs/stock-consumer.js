const { parentPort } = require("node:worker_threads");
// const pRetry, { AbortError } = require('p-retry');

const run = async () => {
  const response = await fetch("https://sindresorhus.com/unicorn");

  // Abort retrying if the resource doesn't exist
  if (response.status === 404) {
    throw new AbortError(response.statusText);
  }

  return response.blob();
};

// console.log(await pRetry(run, { retries: 5 }));

const actualJob = () => {
  // do something here
};

actualJob();

function cancel() {
  // do cleanup here
  // (if you're using @ladjs/graceful, the max time this can run by default is 5s)

  // send a message to the parent that we're ready to terminate
  // (you could do `process.exit(0)` or `process.exit(1)` instead if desired
  // but this is a bit of a cleaner approach for worker termination
  if (parentPort) parentPort.postMessage("cancelled");
  else process.exit(0);
}

// signal to parent that the job is done
if (parentPort) parentPort.postMessage("done");
// if (parentPort) {
//     parentPort.once('message', message => {
//         if (message === 'cancel') return cancel();
//     });
// }

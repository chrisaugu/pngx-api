const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

// master wrapper
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  console.log(`CPU Total ${numCPUs}`);

  // fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    // when worker exits
    console.warn(`Worker fragment (pid: ${worker.process.pid}) died`);
    cluster.fork();
  });
}
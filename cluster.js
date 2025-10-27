const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
} else {
  // Initialize server (e.g., with express)
}

const http = require("http");
const https = require("https");
const os = require("os");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = require("./app");
const Env = require("./config/env");
const websocket = require("./routes/ws");
const debug = require("debug")("NUKU-API");

// replaces all instance of app with server
let server;

// Start server
// if (Env.NODE_ENV === "dev") {
server = http.createServer(app);

// create server and listen on the port
server.listen(Env.PORT, /*"localhost",*/ onListen);
server.on("error", onError);
server.on("end", onStop);
// }
// else {
// stream data
websocket(server);
//   const options = {
//     key: fs.readFileSync(path.join(__dirname, "certs", "nuku-key.pem")),
//     cert: fs.readFileSync(path.join(__dirname, "certs", "nuku.pem")),
//   };

//   server = https.createServer(options, app);

//   // create server and listen on the port
//   server.listen(Env.PORT, /*"localhost",*/ onListen);
//   server.on("error", onError);
//   server.on("end", onStop);
// }

function onListen() {
  const details = this.address();
  let localAddress = null;
  let networkAddress = null;

  const interfaces = os.networkInterfaces();
  const getNetworkAddress = () => {
    for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]) {
        const { address, family, internal } = interface;
        if (family === "IPv4" && !internal) {
          return address;
        }
      }
    }
  };

  if (typeof details === "string") {
    localAddress = details;
  } else if (typeof details === "object" && details.port) {
    const address = details.address === "::" ? "localhost" : details.address;
    const ip = getNetworkAddress();
    // const ip = ip.address();

    localAddress = `http://${address}:${details.port}`;
    networkAddress = `http://${ip}:${details.port}`;
  }

  let log = "\n--------------------------------------------------\n";

  if (localAddress) {
    log += `Server running on port ${localAddress}\n`;
  }
  if (networkAddress) {
    log += `Server running on port ${networkAddress}`;
  }

  log += "\n--------------------------------------------------\n";

  // console.debug(log);

  // console.debug(boxen(`Server running on ${localAddress}`));
  console.debug(`Server running on port ${localAddress}`);
}

function onError(error) {
  debug("Error occurred: " + error);
}

function onStop() {
  debug("Stopping server");
  app.end();
  app.destroy();
}

process.on("message", (message) => {
  debug("Message: " + message);
});

process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error", err);
  process.exit(1); // exit application
});

process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    debug("HTTP server closed");
  });
});

process.on("SIGINT", () => {
  debug("SIGINT signal received: closing HTTP server");
  server.close(() => {
    debug("HTTP server closed");
  });
});

module.exports = server;

const http = require("http");
const https = require("https");
const os = require("os");
const fs = require("fs");
const ip = require("ip");
const path = require("path");
const debug = require("debug")("NUKU-API");
const app = require("./app");
const Env = require("./config/env");
const websocket = require("./routes/ws");
const socket = require("./routes/socket");
const logger = require("./libs/logger").winstonLogger;
const cluster = require("cluster");
const totalCPUs = os.cpus().length;

/**
 * Nuku HTTP Server
 */
class Server {
  /**
   *
   */
  #server;

  #app;

  #hostname;

  #port;

  /**
   *
   * @param {Express.Application} app
   */
  constructor(app) {
    logger.debug("Starting NUKU API server...");
    // if (Env.NODE_ENV === "dev") {
    this.#app = app;
    this.#server = http.createServer(this.#app);
    // } else {
    //   // stream data
    //   const options = {
    //     key: fs.readFileSync(path.join(__dirname, "certs", "nuku-key.pem")),
    //     cert: fs.readFileSync(path.join(__dirname, "certs", "nuku.pem")),
    //   };

    //   server = https.createServer(options, app);
    // }

    this.setupSignalListeners();

    this.#hostname = "0.0.0.0";
    this.#port = Env.PORT;
  }

  onListen = () => {
    const details = ip.address();
    let localAddress = null;
    let networkAddress = null;

    const interfaces = os.networkInterfaces();
    const getNetworkAddress = () => {
      for (const name of Object.keys(interfaces)) {
        for (const internetInterface of interfaces[name]) {
          const { address, family, internal } = internetInterface;
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
    logger.debug(`Server running on port ${localAddress}`);
  };

  onError = (error) => {
    debug("Error occurred: " + error);
  };

  onStop = () => {
    debug("Stopping server");
    this.#app.end();
    this.#app.destroy();
  };

  onClose = () => {
    debug("SIGINT signal received: closing HTTP server");
    if (this.#server) {
      this.#server.close(() => {
        debug("HTTP server closed");
        process.exit(0);
      });
    }
  };

  attachServerEvents = (serverEvents) => {
    serverEvents(this.#server);
  };
  attachWebSocket = (ws) => {
    // attach websocket to the server
    ws(this.#server);
  };

  start = () => {
    // listen on the port
    this.#server.listen(this.#port, this.#hostname, this.onListen);
    this.#server.on("error", this.onError);
    this.#server.on("end", this.onStop);
  };

  setupSignalListeners = () => {
    process.on("message", (message) => {
      debug("Message: " + message);
    });

    process.on("uncaughtException", (err) => {
      logger.error("There was an uncaught error", err);
      process.exit(1); // exit application
    });

    process.on("unhandledRejection", (ex) => {
      logger.error(`Unhandled Rejection: ${ex.message}`, ex);
      process.exit(1);
    });

    process.on("SIGTERM", this.onClose);

    process.on("SIGINT", this.onClose);
  };
}

// if (cluster.isMaster) {
//   for (let i = 0; i < totalCPUs; i++) {
//     cluster.fork();
//   }
// } else {
// Initialize server (e.g., with express)
const server = new Server(app);
server.attachWebSocket(socket);
server.attachWebSocket(websocket);
// server.attachServerEvents();
server.start();
// }

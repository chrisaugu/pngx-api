import express from "express";
import "dotenv/config";
import fs from "fs";
import http from "http";
import https from "https";
import ora from "ora";
import os from "os";
import path from "path";
import cluster from "cluster";
import app from "./app";
import Env from "./config/env";
import ip from "ip";
import { winstonLogger as logger } from "./libs/logger";
import { createRedisIoClient as redis } from "./libs/redis";
import debug from "debug";
import { createGraphQLServer } from "./graphql-server";
import { createMCPServer } from "./mcp-server";

debug("NUKU-API");

const spinner = ora("Connecting to the database...").start();
// const websocket = require("./routes/ws");
// const socket = require("./routes/socket");

logger.debug("Starting NUKU API server...");
// if (Env.NODE_ENV === "dev") {
//   server = http.createServer(app);
// } else {
//   // stream data
//   const options = {
//     key: fs.readFileSync(path.join(import.meta.dirname, "certs", "nuku-key.pem")),
//     cert: fs.readFileSync(path.join(import.meta.dirname, "certs", "nuku.pem")),
//   };

//   server = https.createServer(options, app);
// }

/**
 * Nuku HTTP Server
 */
class Server {
  /**
   *
   */
  private server;

  /**
   *
   */
  private hostname;

  /**
   *
   */
  private port;

  private app;
  private apps;

  /**
   *
   * @param {Express.Application} app
   */
  constructor(app: Express.Application) {
    logger.debug("Starting NUKU API server...");
    // if (Env.NODE_ENV === "dev") {
    this.app = app;
    this.apps = new Map();

    this.server = http.createServer(this.app);
    // } else {
    //   // stream data
    //   const options = {
    //     key: fs.readFileSync(path.join(import.meta.dirname, "certs", "nuku-key.pem")),
    //     cert: fs.readFileSync(path.join(import.meta.dirname, "certs", "nuku.pem")),
    //   };

    //   server = https.createServer(options, app);
    // }

    this.hostname = Env.HOST;
    this.port = Env.PORT;

    // this.listenForEvents();
    this.setupSignalListeners();
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
    logger.debug(`Server running at ${localAddress}`);
    logger.debug(`REST API v1 ready at http://localhost:${this.port}/api/v1`);
    logger.debug(`REST API v2 ready at http://localhost:${this.port}/api/v2`);
    logger.debug(`API docs ready at http://localhost:${this.port}/api/docs`);
    logger.debug(
      `GraphQL endpoint ready at http://localhost:${this.port}/graphql`,
    );
    logger.debug(
      `Server-Sent Events (SSE) endpoint ready at http://localhost:${this.port}/events`,
    );
    logger.debug(`WebSocket server ready at ws://localhost:${this.port}/ws`);
    logger.debug(`Webhook ready at http://localhost:${this.port}/webhook`);
    logger.debug(`MCP Server ready at http://localhost:${this.port}/mcp`);
  };

  onError = (error) => {
    debug("Error occurred: " + error);
  };

  onStop = () => {
    debug("Stopping server");
    this.app.end();
    this.app.destroy();
  };

  onClose = () => {
    debug("SIGINT signal received: closing HTTP server");
    if (this.server) {
      this.server.close(() => {
        debug("HTTP server closed");
        process.exit(0);
      });
    }
  };

  /**
   *
   * @param {express.Application} app
   */
  attachApp(app: express.Application) {
    if (!this.apps.has(app.name, app)) {
      this.apps.set(app.name, app);
    }
  }
  attachServerEvents = (serverEvents) => {
    // attach sse to the http server
    serverEvents(this.server);
  };
  attachWebSocket = (ws) => {
    // attach websocket to the http server
    ws(this.server);
  };
  attachGraphql = (gql) => {
    // attach graphql server to the http server
    console.log("attachGraphql", gql);
    this.app.use(gql(this.server));
  };
  // attachWebSocket = (mcp) => {
  //   // attach websocket to the http server
  //   ws(this.server);
  //   createMCPServer()
  // };

  start = () => {
    // listen on the port
    this.server.listen(this.port, this.hostname, this.onListen);
    this.server.on("error", this.onError);
    this.server.on("end", this.onStop);
  };

  listenForEvents() {
    this.server.on("connection", (stream) => {
      console.log("someone connected!");
    });

    // Listen to the request event
    this.server.on("request", async (req, res) => {
      if (req.url === "/" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Welcome to the Home Page!");
      } else if (req.url === "/health" && req.method === "GET") {
        // optional: add further things to check (e.g. connecting to dababase)
        const healthcheck = {
          uptime: process.uptime(),
          message: "OK",
          timestamp: Date.now(),
          environment: Env.NODE_ENV,
          status: "healthy",
        };

        try {
          await redis.ping();
          res.writeHead(200, { "Content-Type": "application/json" });

          res.end(
            JSON.stringify({
              ...healthcheck,
              redis: "healthy",
            }),
          );
        } catch (e) {
          healthcheck.message = e;
          logger.error("Error creating user", {
            error: e.message,
            stack: e.stack,
            body: req.body,
          });
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify(healthcheck));
        }
      } else {
        // Fallback for routes that do not exist
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
      }
    });
  }

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

const numCPUs = os.cpus().length;
// if (cluster.isMaster) {
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }
// cluster.on('exit', (worker, code, signal) => {
//   console.log(`Worker ${worker.process.pid} died.`);
// });
// } else {
// Initialize server (e.g., with express)
const server = new Server(app);
server.attachWebSocket(websocket);
// server.attachServerEvents();
// server.attachGraphql(createGraphQLServer(server));
// server.attachApp([
//   graphql
// ]);

// Handle startup errors gracefully
createGraphQLServer(app, server.server).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

createMCPServer(app).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

server.start();
// Worker processes share the server
// require('./server');
// }

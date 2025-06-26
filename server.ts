import http from "http";
import https from "https";
import os from "os";
import fs from "fs";
import path from "path";
import express from "express";
import setRateLimit from 'express-rate-limit';
import request from 'request';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cron from 'node-cron';
import cors from "cors";
import marked from 'marked';
import dateFns from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import createError from 'http-errors';
import ip from 'ip';
import boxen from 'boxen';
import 'dotenv/config';
import ora from 'ora';
import helmet from 'helmet';
import app from "./app";
import Env from "./config/env";
import websocket from "./routes/ws";
import socket from "./routes/socket";
const debug = require("debug")("NUKU-API");
const logger = require("./libs/logger").winstonLogger;

const spinner = ora('Connecting to the database...').start()

// replaces all instance of app with server
let server: http.Server | https.Server;

logger.debug("Starting NUKU API server...");
if (Env.NODE_ENV === "dev") {
  server = http.createServer(app);
} else {
  // stream data
  const options = {
    key: fs.readFileSync(path.join(__dirname, "certs", "nuku-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "certs", "nuku.pem")),
  };

  server = https.createServer(options, app);
}

// attach websocket to the server
websocket(server);
// socket(server);

// listen on the port
server.listen(Env.PORT, /*"localhost",*/ onListen);
server.on("error", onError);
server.on("end", onStop);

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
  logger.debug(`Server running on port ${localAddress}`);
}

function onError(error) {
  debug("Error occurred: " + error);
}

function onStop() {
  debug("Stopping server");
  app.end();
  app.destroy();
}

function onClose() {
  debug("SIGINT signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      debug("HTTP server closed");
      process.exit(0);
    });
  }
}

process.on("message", (message) => {
  debug("Message: " + message);
});

process.on("uncaughtException", (err) => {
  logger.error("There was an uncaught error", err);
  process.exit(1); // exit application
});

process.on('unhandledRejection', (ex) => {
  logger.error(`Unhandled Rejection: ${ex.message}`, ex);
  process.exit(1);
});

process.on("SIGTERM", onClose);

process.on("SIGINT", onClose);

module.exports = server;

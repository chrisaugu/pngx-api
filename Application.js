const express = require("express");
const { EventEmitter } = require("node:events");

const appEvents = ["starting", "started", "stopping", "stopped"];

class NativeApp {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
  }

  listen(port) {
    return http
      .createServer((req, res) => {
        let index = 0;
        const next = () => {
          if (index < this.middlewares.length) {
            const middleware = this.middlewares[index++];
            middleware(req, res, next);
          }
        };
        next();
      })
      .listen(port);
  }
}

class ServerApp {
  name;
  #app;
  #event;

  constructor() {
    this.#app = express();

    this.#event = new EventEmitter();
    this.#event.on("foo", () => console.log("a"));
    this.#event.prependListener("foo", () => console.log("b"));
    this.#event.emit("foo");
  }

  getApp() {
    return this.#app;
  }
}

module.exports = ServerApp;

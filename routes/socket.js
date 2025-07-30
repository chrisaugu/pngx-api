const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
// const { open } = require("sqlite");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createRedisClient } = require("../libs/redis");

// const db = await open({
//   filename: "chat.db",
//   driver: sqlite3.Database,
// });

// // create our 'messages' table (you can ignore the 'client_offset' column for now)
// await db.exec(`
//   CREATE TABLE IF NOT EXISTS messages (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       client_offset TEXT UNIQUE,
//       content TEXT
//   );
// `);
const pubClient = createRedisClient();
const subClient = pubClient.duplicate();

/**
 * Set up a Socket.IO server on an existing HTTP or HTTPS server.
 * This function initializes a Socket.IO server that listens for WebSocket connections
 * @param {http.Server | https.Server} httpServer 
 * @returns {WebSocket.Server}
 */
module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    path: "/socket.io/websocket",
    // cors: {
    //   origin: "*",
    //   methods: ["GET", "POST"],
    // },
    connectionStateRecovery: {},
  });
  // io.attach(httpServer);

  // io.adapter(createAdapter(pubClient, subClient));

  // Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  //   io.listen(3000);
  // });

  // io.serverSideEmit("ping", 123);

  // io.on("ping", (arg) => {
  //   // `arg` is inferred as number
  // });

  io.on("connection", async (socket) => {
    console.log("a user connected");
    // socket.emit("hello", 1, "2", { 3: "4", 5: Uint8Array.from([6]) });

    // socket.onAny((eventName, ...args) => {
    //   console.log(eventName); // 'hello'
    //   console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
    // });
    // socket.onAnyOutgoing((eventName, ...args) => {
    //   console.log(eventName); // 'hello'
    //   console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
    // });

    // socket.join("some room");

    // // broadcast to all connected clients in the room
    // io.to("some room").emit("hello", "world");

    // // broadcast to all connected clients except those in the room
    // io.except("some room").emit("hello", "world");

    // // leave the room
    // socket.leave("some room");

    // socket.broadcast.emit("hi");

    socket.on("chat", async (msg) => {
      let result = {lastID: 1};
      // try {
      //   // store the message in the database
      //   result = await db.run("INSERT INTO messages (content) VALUES (?)", msg);
      // } catch (e) {
      //   // TODO handle the failure
      //   return;
      // }
      // include the offset with the message
      io.emit("chat", msg, result.lastID);
    });

    if (!socket.recovered) {
      // if the connection state recovery was not successful
      // try {
      //   await db.each(
      //     "SELECT id, content FROM messages WHERE id > ?",
      //     [socket.handshake.auth.serverOffset || 0],
      //     (_err, row) => {
      //       socket.emit("chat message", row.content, row.id);
      //     }
      //   );
      // } catch (e) {
      //   // something went wrong
      // }
    }

    socket.on("connect", () => {
      console.log("✅ Connected to TradingView WebSocket (Socket.IO)");
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      console.log("❌ Disconnected");
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    // Example: Send a message (if required)
    socket.emit("subscribe", { symbol: "BTCUSD" });

    // Example: Listen for a specific event
    socket.on("data", (data) => {
      console.log("Received data:", data);
    });
  });
};

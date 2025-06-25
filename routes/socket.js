const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
// const { open } = require("sqlite");

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

module.exports = (server) => {
  const io = new Server(server, {
    connectionStateRecovery: {},
  });

  io.serverSideEmit("ping", 123);

  io.on("ping", (arg) => {
    // `arg` is inferred as number
  });

  io.on("connection", async (socket) => {
    console.log("a user connected");
    socket.emit("hello", 1, "2", { 3: "4", 5: Uint8Array.from([6]) });

    socket.onAny((eventName, ...args) => {
      console.log(eventName); // 'hello'
      console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
    });
    socket.onAnyOutgoing((eventName, ...args) => {
      console.log(eventName); // 'hello'
      console.log(args); // [ 1, '2', { 3: '4', 5: ArrayBuffer (1) [ 6 ] } ]
    });

    socket.join("some room");

    // broadcast to all connected clients in the room
    io.to("some room").emit("hello", "world");

    // broadcast to all connected clients except those in the room
    io.except("some room").emit("hello", "world");

    // leave the room
    socket.leave("some room");

    socket.broadcast.emit("hi");

    socket.on("chat", async (msg) => {
      let result;
      try {
        // store the message in the database
        result = await db.run("INSERT INTO messages (content) VALUES (?)", msg);
      } catch (e) {
        // TODO handle the failure
        return;
      }
      // include the offset with the message
      io.emit("chat", msg, result.lastID);
    });

    if (!socket.recovered) {
      // if the connection state recovery was not successful
      try {
        await db.each(
          "SELECT id, content FROM messages WHERE id > ?",
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            socket.emit("chat message", row.content, row.id);
          }
        );
      } catch (e) {
        // something went wrong
      }
    }

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

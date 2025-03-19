const http = require("http");
const https = require("https");
const os = require("os");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = require("./app");
const websocket = require("./routes/ws");

// replaces all instance of app with server
let server;

// Start server
// if (process.env.NODE_ENV === "dev") {
server = http.createServer(app);

// stream data
websocket(server);

// create server and listen on the port
server.listen(
  process.env.PORT,
  /*"localhost",*/ () => {
    const details = server.address();
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
);
server.on("error", function (error) {
  console.error(error);
});
server.on("end", function () {
  app.end();
  app.destroy();
});

// } else {
//   const options = {
//     key: fs.readFileSync(path.join(__dirname, "certs", "nuku-key.pem")),
//     cert: fs.readFileSync(path.join(__dirname, "certs", "nuku.pem")),
//   };

//   server = https.createServer(options, app);

//   // create server and listen on the port
//   server.listen(
//     process.env.PORT,
//     /*"localhost",*/ () => {
//       const details = server.address();
//       let localAddress = null;
//       let networkAddress = null;

//       const interfaces = os.networkInterfaces();
//       const getNetworkAddress = () => {
//         for (const name of Object.keys(interfaces)) {
//           for (const interface of interfaces[name]) {
//             const { address, family, internal } = interface;
//             if (family === "IPv4" && !internal) {
//               return address;
//             }
//           }
//         }
//       };

//       if (typeof details === "string") {
//         localAddress = details;
//       } else if (typeof details === "object" && details.port) {
//         const address =
//           details.address === "::" ? "localhost" : details.address;
//         const ip = getNetworkAddress();
//         // const ip = ip.address();

//         localAddress = `http://${address}:${details.port}`;
//         networkAddress = `http://${ip}:${details.port}`;
//       }

//       let log = "\n--------------------------------------------------\n";

//       if (localAddress) {
//         log += `Server running on port ${localAddress}\n`;
//       }
//       if (networkAddress) {
//         log += `Server running on port ${networkAddress}`;
//       }

//       log += "\n--------------------------------------------------\n";

//       // console.debug(log);

//       // console.debug(boxen(`Server running on ${localAddress}`));
//       console.debug(`Server running on port ${localAddress}`);
//     }
//   );
//   server.on("error", function (error) {
//     console.error(error);
//   });
//   server.on("end", function () {
//     app.end();
//     app.destroy();
//   });
// }

process.on("message", (message) => {
  console.log(message);
});

process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    debug("HTTP server closed");
  });
});

module.exports = server;

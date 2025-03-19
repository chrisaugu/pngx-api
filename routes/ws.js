const { WebSocketServer, WebSocket } = require("ws");
const { parse } = require("url");
const { randomUUID } = require("crypto");
const queryString = require("querystring");

module.exports = (expressServer) => {
  const wsServer = new WebSocket.Server({
    noServer: true,
    path: "/ws/v1",
    // server,
    // port: 8080,
  });

  const connections = {};

  const authenticate = (request) => {
    const { token } = parse(request.url, true).query;
    // TODO: Actually authenticate token
    if (token === "abc") {
      return true;
    }
  };

  expressServer.on("upgrade", (request, socket, head) => {
    // const authed = authenticate(request);

    // if (!authed) {
    //   // \r\n\r\n: These are control characters used in HTTP to
    //   // denote the end of the HTTP headers section.
    //   socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    //   socket.destroy();
    //   return;
    // }

    wsServer.handleUpgrade(request, socket, head, (connection) => {
      // Manually emit the 'connection' event on a WebSocket
      // server (we subscribe to this event below).
      wsServer.emit("connection", connection, request);
    });
  });

  const handleMessage = (bytes, uuid) => {
    const message = JSON.parse(bytes.toString());
    const connection = connections[uuid];

    if (message.type === "authenticate") {
      connection.authenticated = authenticate(message.token);
      return;
    }

    //   if (connection.authenticated) {
    //     // Process the message
    //   } else {
    //     connection.terminate();
    //   }
  };

  const handleClose = (uuid) => delete connections[uuid];

  wsServer.on("connection", (connection, request) => {
    console.log("A new client connected");
    const [_path, params] = request?.url?.split("?");
    const connectionParams = queryString.parse(params);

    const uuid = randomUUID();
    connections[uuid] = connection;

    // NOTE: connectParams are not used here but good to understand how to get
    // to them if you need to pass data with the connection to identify it (e.g., a userId).
    // console.log(connectionParams);

    connection.on("message", (bytes) => {
      const parsedMessage = JSON.parse(bytes);
      console.log("Received message: %s", parsedMessage);
      // %s: Convert the bytes (buffer) into a string using
      // utf-8 encoding.
      // Event listener for incoming messages
    //   console.log("Received message: %s", bytes.toString());

      // Broadcast the message to all connected clients
      wsServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(parsedMessage);
        }
      });

      handleMessage(bytes, uuid);
    });

    // Event listener for client disconnection
    connection.on("close", () => {
      console.log("A client disconnected.");
      handleClose(uuid);
    });
  });

  return wsServer;
};


// {
//     "subscribe": "/sites/c1947558-268d-4d31-xxxx-xxxxxxxxxxxxxx/stats/devices"
// }
// {
//     "unsubscribe": "/sites/c1947558-268d-4d31-xxxx-xxxxxxxxxxxxxx/stats/devices"
// }
// {
//     "event": "channel_subscribed",
//     "channel": "/sites/c1947558-268d-4d31-xxxx-xxxxxxxxxxxx/stats/devices"
// }

// {
//     "event": "data",
//     "channel": "/sites/c1947558-268d-4d31- xxxx - xxxxxxxxxxxx /stats/devices",
//     "data": "{\"mac\": \"5c5b35f15ed8\", \"last_seen\": 1686592607, \"uptime\": 6259614, \"version\": \"0.9.22801\", \"_partition\": 48, \"_offset_apbasic\": 4639768722, \"ip_stat\": {\"dns\": [\"10.10.12.11\", \"10.10.12.12\"], \"ips\": {\"vlan12\": \"10.10.12.25/25,fe80:0:0:0:5e5b:35ff:fef1:5ed8/64\"}, \"gateway\": \"10.10.12.1\", \"ip6\": \"fe80:0:0:0:5e5b:35ff:fef1:5ed8\", \"netmask6\": \"/64\", \"ip\": \"10.10.12.25\", \"netmask\": \"255.255.255.128\", \"dhcp_server\": \"10.10.12.1\"}, \"ip\": \"10.10.12.25\", \"ble_stat\": {\"tx_pkts\": 9073, \"tx_bytes\": 105431, \"rx_pkts\": 393432193, \"rx_bytes\": 2772782221, \"tx_resets\": 0}, \"_time\": 1686592607.62131}"
// }
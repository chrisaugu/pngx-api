const http = require("http");
const https = require("https");
const { WebSocketServer, WebSocket } = require("ws");
const url = require("url");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const queryString = require("querystring");
const { isUint8Array } = require("util/types");

/**
 * Set up a WebSocket server on an existing HTTP or HTTPS server.
 * This function initializes a WebSocket server that listens for WebSocket connections
 * @param {http.Server | https.Server} httpServer
 * @returns {WebSocket.Server}
 */
module.exports = (httpServer) => {
  const wsServer = new WebSocketServer({
    noServer: true,
    path: "/ws/v1",
    server: httpServer,
    // port: 8080,
    // rejectUnauthorized: true, // Verify SSL (set `false` for self-signed certs)
    // headers: {               // Optional headers (if needed)
    //   "User-Agent": "Node.js-WS"
    // }
  });
  const connections = new Map();
  // let clients = new List<IWebSocketConnection>();

  httpServer.on("upgrade", (request, socket, head) => {
    // const { pathname } = new URL(request.URL, "wss://base.url");
    // if (pathname === "/foo") {
    //   ws1.handleUpgrade(request, socket, head, function done(ws) {
    //     ws1.emit('connection', ws, request);
    //   })
    // }
    // else {
    //   socket.destroy();
    // }
    // const authed = authenticate(request);

    // if (!authed) {
    //   // \r\n\r\n: These are control characters used in HTTP to
    //   // denote the end of the HTTP headers section.
    //   socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    //   socket.destroy();
    //   return;
    // }

    socket.on("error", onSocketError);

    wsServer.handleUpgrade(request, socket, head, (connection, request) => {
      // Manually emit the 'connection' event on a WebSocket
      // server (we subscribe to this event below).
      wsServer.emit("connection", connection, request, "client");
    });
  });

  wsServer.on("connection", (connection /*stream*/, request, client) => {
    console.log("A new client connected");
    const [_path, params] = request?.url?.split("?");
    const connectionParams = queryString.parse(params);
    const ip = request.socket.remoteAddress;
    // const ip = request.headers["X-Forwarded-For"].split(",")[0].trim();
    const token = req.headers["sec-websocket-protocol"];
    const user = authenticateToken(token);

    // if (!user) {
    //   ws.close(); // Close connection if authentication fails
    //   return;
    // }
    console.log(ip);

    const uuid = randomUUID();
    const color = Math.floor(Math.random() * 360);
    const metadata = {
      uuid,
      color,
      date: "2020-04-06",
      symbol: "SST",
      bid: 0,
      offer: 0,
      last: 0,
      close: 35.46,
      high: 0,
      low: 0,
      open: 0,
      change: 0,
      volume: 0,
      num_trades: 0,
    };

    connections.set(connection, metadata);
    connections[uuid] = connection;

    connection.isAlive = true;

    connection.ping("ping", () => {
      console.log("PING");
    });
    connection.on("pong", heartbeat, () => {
      connection.isAlive = true;
      console.log("PONG");
    });

    // Event listener for incoming messages
    connection.on("message", (bytes) => handleMessage(bytes, uuid));
    // Event listener for client disconnection
    connection.on("close", () => handleClose(uuid));
  });

  wsServer.on("error", (error) => {
    console.error("Error: " + error.message);
  });

  const interval = setInterval(function ping() {
    wsServer.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 3000);

  const authenticate = (token /*request*/) => {
    // const origin = request.headers["origin"];
    // const token = request.headers["authorization"].split(" ")[1];
    // const { token } = url.parse(request.url, true).query;
    // TODO: Actually authenticate token
    if (token === "abc") {
      return true;
    }
  };

  function authenticateToken(token) {
    return jwt.verify(token, "your-secret-key", (err, user) => {
      if (err) return null;
      return user;
    });
  }

  const handleMessage = (bytes, uuid) => {
    // Convert the bytes (buffer) into a string using utf-8 encoding.
    const obj = bytes.toString();
    const parsedMessage = JSON.parse(obj);
    const connection = connections[uuid];
    const metadata = connections.get(uuid);
    let data;
    if (isUint8Array(bytes)) {
      data = new ArrayBuffer(bytes);
    }
    console.log("Received message: %s", parsedMessage);

    if (parsedMessage.type === "authenticate") {
      connection.authenticated = authenticate(parsedMessage.token);
      return;
    }

    if (connection.authenticated) {
      // Broadcast the message to all connected clients
      wsServer.clients.forEach((client) => {
        if (client.isAlive === false) return client.terminate();
        // broadcasting message to all connected clients, excluding itself
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.isAlive = false;
          // client.ping();
          client.send(parsedMessage);
        }
      });

      [...wsServer.clients.keys()].forEach((client) => {
        client.send(outbound);
      });
    } else {
      connection.terminate();
    }
  };

  const handleClose = (uuid) => {
    console.log("A client disconnected. Reconnecting...");
    delete connections[uuid];
    wsServer.clients.delete(uuid);

    // setTimeout(this, 1000);
    clearInterval(interval);
  };

  const onSocketError = (err) => {
    console.error(err);
  };

  const heartbeat = () => {
    this.isAlive = true;
  };

  return wsServer;
};

/*
## Realtime
Fetch stock quotes in realtime
`/ws/v1/stocks`

### Add to watchlist
{
  "action": "watch",
  "symbol": "BSP"
}

### subscribe to 
{
  "subscribe": "/sites/c1947558-268d-4d31-xxxx-xxxxxxxxxxxxxx/stats/devices"
}
### subscribe to 
{
  "unsubscribe": "/sites/c1947558-268d-4d31-xxxx-xxxxxxxxxxxxxx/stats/devices"
}
{
  "event": "channel_subscribed",
  "channel": "/sites/c1947558-268d-4d31-xxxx-xxxxxxxxxxxx/stats/devices"
}

{
  "event": "data",
  "channel": "/sites/c1947558-268d-4d31- xxxx - xxxxxxxxxxxx /stats/devices",
  "data": "{\"mac\": \"5c5b35f15ed8\", \"last_seen\": 1686592607, \"uptime\": 6259614, \"version\": \"0.9.22801\", \"_partition\": 48, \"_offset_apbasic\": 4639768722, \"ip_stat\": {\"dns\": [\"10.10.12.11\", \"10.10.12.12\"], \"ips\": {\"vlan12\": \"10.10.12.25/25,fe80:0:0:0:5e5b:35ff:fef1:5ed8/64\"}, \"gateway\": \"10.10.12.1\", \"ip6\": \"fe80:0:0:0:5e5b:35ff:fef1:5ed8\", \"netmask6\": \"/64\", \"ip\": \"10.10.12.25\", \"netmask\": \"255.255.255.128\", \"dhcp_server\": \"10.10.12.1\"}, \"ip\": \"10.10.12.25\", \"ble_stat\": {\"tx_pkts\": 9073, \"tx_bytes\": 105431, \"rx_pkts\": 393432193, \"rx_bytes\": 2772782221, \"tx_resets\": 0}, \"_time\": 1686592607.62131}"
}

-- Message format
{
  type: 'event' | 'connected' | 'error',
}

-- Authentication message format
{
  status: 'ok' | 'error',
  event: EVENT_NAME,
  type: 'authentication',
  data: {}
}

message = event.data - JSON data
message.type 
message.data
message.data.user
message.data.channels



/api/v1/transactions/place-order
place order
{
  action: '',
  symbol: 'BSP',
  type: 'market' | 'limit',
  side: 'buy' | 'sell',
  limitPrice: 
}

/api/v1/assets/top?offset=5&after=0
{
  code: 2xx | 3xx | 4xx | 5xx,
  status: "success",
  data: {},
  meta: {
    total: 100,
    offset: 0,
    limit: 5
  }
}

{"status":403,"message":"Server error"}

/ws/stocks/quotes
{"action": "subscribe", "symbols": "AMZN, TSLA"}

Response data for US Quote:
s: ticker code
ap: ask price
bp: bid price
as: ask size
bs: bid size
t: timestamp in milliseconds
*/

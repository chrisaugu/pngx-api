const { env } = require("../utils");

exports.ORIGINAL_URL = "http://localhost:3000";
exports.ALLOWED_IP_LIST = [
  "192.168.0.56",
  "192.168.0.21",
  "localhost",
  "127.0.0.1",
];
exports.TIMEZONE = env("TZ", "Pacific/Port_Moresby");

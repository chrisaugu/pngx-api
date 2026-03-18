const { env } = require("../utils");

exports.ALLOWED_ORIGINS = [
  'http://localhost:5001',
  'https://nuku.zeabur.app',
  'https://nuku.app',
  'https://api.nuku.app',
  'https://api.nuku.app',
  'https://admin.nuku.app',
  'https://staging.nuku.app',
]

exports.ALLOWED_IP_LIST = [
  "192.168.0.56",
  "192.168.0.21",
  "localhost",
  "127.0.0.1",
];
exports.TIMEZONE = env("TZ", "Pacific/Port_Moresby");

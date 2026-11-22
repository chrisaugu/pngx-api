import { env } from "../utils";

export const ORIGINAL_URL = "http://localhost:3000";
export const ALLOWED_IP_LIST = [
  "192.168.0.56",
  "192.168.0.21",
  "localhost",
  "127.0.0.1",
];
export const TIMEZONE = env("TZ", "Pacific/Port_Moresby");

const COMPANIES = Object.freeze({
  BSP: "BSP Financial Group Limited",
  CCP: "Credit Corporation (PNG) Ltd",
  CGA: "PNG Air Limited",
  COY: "Coppermoly Limited",
  CPL: "CPL Group Limited",
  KAM: "Kina Asset Management Limited",
  KSL: "Kina Securities Limited",
  NCM: "Newcrest Mining Limited",
  NEM: "Newmont Mining Limited",
  NGP: "NGIP Agmark Limited",
  NIU: "Niuminco Group Limited",
  SST: "Steamships Trading Company Limited",
  STO: "Santos Limited",
  OSH: "Oil Search Limited",
  IOC: "InterOil Limited",
  IDC: "Indochine Mining Limited",
  KPL: "Kina Petroleum Limited",
  HIG: "Highlands Pacific Limited",
  KPE: "Kina Petroleum Corporation",
  BSPHA: "Bank South Pacific Notes",
});

const OLD_SYMBOLS = ["COY", "NCM", "KPE", "HIG", "KPL", "IDC", "IOC", "OSH", "BSPHA"];

const SYMBOLS = Object.keys(COMPANIES).filter((c) => !OLD_SYMBOLS.includes(c));

const PNGX_URL = "https://www.pngx.com.pg";
const PNGX_DATA_URL = `${PNGX_URL}/data/`;

const LOCAL_TIMEZONE = "Pacific/Port_Moresby";
const LOCAL_TIMEZONE_FORMAT = "yyyy-MM-dd"; // HH:mm:ss zzz'; // 2014-10-25 12:46:20 GMT+2 (Papua New Guinea)

const WORKER_SCHEDULE_TIME = "30 8 * * *";

const BASE_URL = new URL("https://nuku1-btlxx2lu.b4a.run/");

module.exports = {
  SYMBOLS,
  OLD_SYMBOLS,
  COMPANIES,
  PNGX_DATA_URL,
  PNGX_URL,
  LOCAL_TIMEZONE,
  LOCAL_TIMEZONE_FORMAT,
  BASE_URL,
  WORKER_SCHEDULE_TIME,
};

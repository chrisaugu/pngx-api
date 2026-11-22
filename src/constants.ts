type ALL_SYMBOLS =
  | "ADY"
  | "BSP"
  | "CCP"
  | "CGA"
  | "COY"
  | "CPL"
  | "KAM"
  | "KSL"
  | "NCM"
  | "NEM"
  | "NGP"
  | "NIU"
  | "SST"
  | "STO"
  | "OSH"
  | "IOC"
  | "KPL"
  | "PLC"
  | "HIG"
  | "BSPHA"
  | "CUE"
  | "LHG"
  | "MOS"
  | "OML"
  | "KSL361"
  | "IDC"
  | "KPE"
  | "CNN";

const COMPANIES: Record<ALL_SYMBOLS, string> = {
  ADY: "Adyton Resource Corporation",
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
  // IOC: "Inter Oil Corporation",
  IDC: "Indochine Mining Limited",
  KPL: "Kina Petroleum Limited",
  PLC: "Pacific Lime and Cement Limited",
  HIG: "Highlands Pacific Limited",
  // HIG: "Highlands Pacific Ltd",
  KPE: "Kina Petroleum Corporation",
  BSPHA: "Bank South Pacific Notes",
  CNN: "Cardia Technologies Ltd",
  CUE: "Cue Energy Resources NL",
  LHG: "Lihir Gold Ltd",
  MOS: "Mosaic Oil NL",
  OML: "Orogen Minerals Ltd",
  KSL361: "Kina Securities Limited",
};
export type Companies = keyof typeof COMPANIES;

const OLD_SYMBOLS = [
  "COY",
  "NCM",
  "KPE",
  "HIG",
  "KPL",
  "IDC",
  "IOC",
  "OSH",
  "BSPHA",
  "OML",
  "MOS",
  "LHG",
  "CUE",
  "CNN",
] as const;
export type OldCompanies = (typeof OLD_SYMBOLS)[number];

const ALL_COMPANIES = Object.keys(COMPANIES);
const SYMBOLS = Object.keys(COMPANIES).filter(
  (c) => !OLD_SYMBOLS.includes(c as any),
);
const CHANNELS = ["tickers"];
const TOPICS = SYMBOLS.map((code) => "tickers:" + code);

const PNGX_URL = "https://www.pngx.com.pg";
const PNGX_DATA_URL = `${PNGX_URL}/data`;

const PNGX_INTERNET_ARCHIVE_URL =
  "https://web.archive.org/web/20260821103144/http://www.pngx.com.pg";
// "https://web.archive.org/web/20180425083441/http://www.pngx.com.pg";
const PNGX_DATA_INTERNET_ARCHIVE_URL = `${PNGX_INTERNET_ARCHIVE_URL}/data`;

const LOCAL_TIMEZONE = "Pacific/Port_Moresby";
const LOCAL_TIMEZONE_FORMAT = "yyyy-MM-dd"; // HH:mm:ss zzz'; // 2014-10-25 12:46:20 GMT+2 (Papua New Guinea)

const QUOTE_FETCH_WORKER_SCHEDULE_TIME = "30 8 * * *";

const BASE_URL = "https://nuku.zeabur.app";

const THREAD_COUNT = 1;

export {
  SYMBOLS,
  OLD_SYMBOLS,
  ALL_COMPANIES,
  COMPANIES,
  PNGX_DATA_URL,
  PNGX_URL,
  PNGX_INTERNET_ARCHIVE_URL,
  PNGX_DATA_INTERNET_ARCHIVE_URL,
  LOCAL_TIMEZONE,
  LOCAL_TIMEZONE_FORMAT,
  BASE_URL,
  QUOTE_FETCH_WORKER_SCHEDULE_TIME,
  CHANNELS,
  TOPICS,
};

const SYMBOLS = ['BSP','CCP','CGA','CPL','KAM','KSL','NEM','NGP','NIU','SST','STO'];
const OLD_SYMBOLS = ['COY','NCM','OSH'];
const COMPANIES = {
    "BSP": "BSP Financial Group Limited",
    "CCP": "Credit Corporation (PNG) Ltd",
    "CGA": "PNG Air Limited",
    "COY": "Coppermoly Limited",
    "CPL": "CPL Group Limited",
    "KAM": "Kina Asset Management Limited",
    "KSL": "Kina Securities Limited",
    "NCM": "Newcrest Mining Limited",
    "NEM": "Newmont Mining Limited",
    "NGP": "NGIP Agmark Limited",
    "NIU": "Niuminco Group Limited",
    "SST": "Steamships Trading Company Limited",
    "STO": "Santos Limited"
}

const Quotes = Object.freeze(SYMBOLS);

const PNGX_URL = "https://www.pngx.com.pg";
const PNGX_DATA_URL = `${PNGX_URL}/data/`;

const LOCAL_TIMEZONE = 'Pacific/Port_Moresby';
const LOCAL_TIMEZONE_FORMAT = 'yyyy-MM-dd'; // HH:mm:ss zzz'; // 2014-10-25 12:46:20 GMT+2 (Papua New Guinea)

module.exports = {
    SYMBOLS,
    OLD_SYMBOLS,
    COMPANIES,
    PNGX_DATA_URL,
    PNGX_URL,
    LOCAL_TIMEZONE,
    LOCAL_TIMEZONE_FORMAT
}
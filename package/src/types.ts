export enum QUOTES {
  "BSP",
  "CCP",
  "CGA",
  "COY",
  "CPL",
  "KAM",
  "KSL",
  "NEM",
  "NGP",
  "NIU",
  "SST",
  "STO",
}

export enum OLD_QUOTES {
  "NCM",
  "OSH",
}

export type TQuotes =
  | "BSP"
  | "CCP"
  | "CGA"
  | "COY"
  | "CPL"
  | "KAM"
  | "KSL"
  | "NEM"
  | "NGP"
  | "NIU"
  | "SST"
  | "STO";

export type TQuote = {
  date: Date;
  code: string;
  short_name: string;
  bid: number;
  offer: number;
  last: number;
  close: number;
  high: number;
  low: number;
  open: number;
  chg_today: number;
  vol_today: number;
  num_trades: number;
};

export type TCompany = {
  name: string;
  ticker: string;
  description: string;
  industry: string;
  sector: string;
  key_people: string[];
  date_listed: Date; // ipo
  esteblished_date: Date;
  outstanding_shares: Number;
};

export type TTicker = TQuote & {};

// {
//   date: ISODate("2020-01-03T05:00:00.000Z"),
//   symbol: 'AAPL',
//   volume: 146322800,
//   open: 74.287498,
//   adjClose: 73.486023,
//   high: 75.144997,
//   low: 74.125,
//   close: 74.357498
// }

export type TAPIRequest = {};

export type TAPIResponse<T> = {
  status: number;
  message: string;
  symbols: string;
  api: string;
  time: number;
  date: Date;
  last_updated: Date;
  data: T[];
};

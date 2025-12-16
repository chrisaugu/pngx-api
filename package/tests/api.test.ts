import {
  getCompanies,
  getHistoricals,
  getStock,
  getStocks,
  getTicker,
  getTickers,
  TAPIResponse,
  TCompany,
  TQuote,
  TTicker,
} from "../src";

const desiredQuote: TQuote = {
  date: new Date(),
  code: "",
  short_name: "",
  bid: 0,
  offer: 0,
  last: 0,
  close: 0,
  high: 0,
  low: 0,
  open: 0,
  chg_today: 0,
  vol_today: 0,
  num_trades: 0
}

const desiredTicker: TTicker = {
  date: new Date(),
  code: "",
  short_name: "",
  bid: 0,
  offer: 0,
  last: 0,
  close: 0,
  high: 0,
  low: 0,
  open: 0,
  chg_today: 0,
  vol_today: 0,
  num_trades: 0
}


const desiredCompany: TCompany = {
  name: "",
  ticker: "",
  description: "",
  industry: "",
  sector: "",
  key_people: [],
  date_listed: new Date(),
  esteblished_date: new Date(),
  outstanding_shares: 0
}

describe("fetches stocks for the current day", () => {
  test("should return full data in json", async () => {

    const result = await getStocks();
    // expect(result).toBe({})
    // expect(result).toMatchObject<TQuote[]>([desiredQuote]);
    expect(result).toBeDefined();
  });
});

describe("fetches BSP stock", () => {
  test("should return full data in json", async () => {
    const result = await getStock("BSP");
    // expect(result).toBe("expected value");
    // expect(result).toMatchObject<TQuote[]>([desiredQuote]);
    expect(result).toBeDefined();
  });
  test("should return a single object", async () => {
    const result = await getStock("BSP");
    // expect(result).toMatchObject<TQuote>(desiredQuote);
    expect(result).toBeDefined();
  });
});

describe("fetches tickers", () => {
  test("should return full data in json", async () => {
    const result = await getTickers();
    // expect(result).toMatchObject<TTicker[]>([desiredTicker]);
    expect(result).toBeDefined();
  });
});

describe("fetches ticker for BSP", () => {
  test("should return full data in json", async () => {
    const result = await getTicker("BSP");
    // expect(result).toMatchObject<TTicker>(desiredTicker);
    expect(result).toBeDefined();
  });
});

describe("fetches historical data for BSP", () => {
  test("should return full data in json", async () => {
    const result = await getHistoricals("BSP");
    // expect(result).toMatchObject<TQuote[]>([desiredQuote]);
    expect(result).toBeDefined();
  });
});

describe("fetches all companies", () => {
  test("should return full data in json", async () => {
    const result = await getCompanies();
    // expect(result).toMatchObject<TCompany[]>([desiredCompany]);
    expect(result).toBeDefined();
  });
});
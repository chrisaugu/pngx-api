import {
  getHistoricals,
  getStock,
  getStocks,
  getTicker,
  getTickers,
  TAPIResponse,
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

describe("fetches stocks for the current day", () => {
  test("should return full data in json", async () => {

    const result = await getStocks();
    // expect(result).toBe({})
    expect(result).toMatchObject<TQuote[]>([desiredQuote]);
  });
});

// fetcher("https://api.apilayer.com/bank_data/banks_by_country?country_code=PG", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));

// getStocks()
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

describe("fetches BSP stock", () => {
  test("should return full data in json", async () => {
    const result = await getStock("BSP");
    // expect(result).toBe("expected value");
    expect(result).toMatchObject<TQuote[]>([desiredQuote]);
  });
  test("should return a single object", async () => {
    const result = await getStock("BSP");
    expect(result).toMatchObject<TQuote>(desiredQuote);
  });
});

describe("fetches tickers", () => {
  test("should return full data in json", async () => {
    const result = await getTickers();
    expect(result).toMatchObject<TTicker[]>([desiredTicker]);
  });
});

describe("fetches ticker for BSP", () => {
  test("should return full data in json", async () => {
    const result = await getTicker("BSP");
    expect(result).toMatchObject<TTicker>(desiredTicker);
  });
});

describe("fetches historical data for BSP", () => {
  test("should return full data in json", async () => {
    const result = await getHistoricals("BSP");
    expect(result).toMatchObject<TQuote[]>([desiredQuote]);
  });
});
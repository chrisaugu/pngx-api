const fakestockmarketgenerator = require("fake-stock-market-generator");
const ism = require("@zero65tech/indian-stock-market");
const { Vnstock, stock, commodity } = require("vnstock-js");

let numberOfDays = 30;
// let stockData = fakestockmarketgenerator.generateStockData(numberOfDays);
// console.log(stockData);

const info = ism.fo("NIFTY21OCTFUT");
console.log(info);

// Checks if the market is currently open.
const open = ism.isOpen();
console.log(open);

// Checks if the given date is a market holiday. If no date is provided, it checks for today.
// const holiday = ism.isHoliday();
// const holiday = ism.isHoliday('2021-10-02');
const holiday = ism.isHoliday(new Date("2021-10-02"));
console.log(holiday);

async function main() {
  // Ticker history data
  const history = await stock.quote({ ticker: "VCI", start: "2025-01-01" });

  // Ticker price board
  const priceBoard = await stock.priceBoard({ticker: 'VCI'});

  // Top gainers in day
  const topGainers = await stock.topGainers();

  // Top losers in day
  const topLosers = await stock.topLosers();

  const indexPrices = await stock.index('VNINDEX', '2024-01-01');

  const companyInfos = await stock.company('VCI');

  const tickerPrices = await stock.quote({ticker:'VCI', start:'2024-01-01'});
  const companyFinancialInfos = await stock.financials('VCI', 'quarter');

  const { stock: astock } = new Vnstock();

  const result = await astock.trading.priceBoard(["VCB"]);
  
  console.log(result);

  // Gold Price from SJC
//   const goldPrices = await commodity.gold.priceSJC();

  // Access everything directly
  const prices = stock.quote.history({
    symbols: ["VCI"],
    start: "2025-01-01",
    timeFrame: "1D",
  });

  return {
    history,
    priceBoard,
    topGainers,
    topLosers,
    // goldPrices,
    // prices,
  }
}

main().then((prices) => {
  console.log(prices);
}).catch((error) => {
  console.error("Error fetching stock prices:", error);
});
const fs = require("fs");
const path = require("path");
const hooman = require("hooman").default;
const { parse_csv_to_json, normalize_data } = require("./utils");
const { SYMBOLS } = require("./constants");

(async () => {
  console.log("TARGET_URL");
  SYMBOLS.forEach(async (quote) => {
    const TARGET_URL = `https://www.pngx.com.pg/data/${quote}.csv`;
    const OUTPUT_FILE = path.resolve(__dirname, `data/${quote}.csv`);
    console.log(TARGET_URL);

    try {
      console.log(`Fetching ${TARGET_URL} ...`);

      const response = await hooman.get(TARGET_URL);

      if (response.statusCode !== 200) {
        throw new Error(`Unexpected status: ${response.statusCode}`);
      }

      // response.body contains the CSV data
      fs.writeFileSync(OUTPUT_FILE, response.body);

      const csv = await parse_csv_to_json(response.body);
      const quotes = (csv || []).map((q) => normalize_data(q));
      console.log(`Saved ${response.body.length} bytes to ${OUTPUT_FILE}`);
      console.log(`Saved ${JSON.stringify(quotes)} bytes`);
    } catch (error) {
      console.error("ERROR:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.statusCode);
      }
      process.exit(1);
    }
  });
})();

// const puppeteer = require('puppeteer');

// async function runScraper() {
//     // 1. Launch a headless browser instance
//     const browser = await puppeteer.launch({ headless: true });

//     // 2. Open a new browser tab
//     const page = await browser.newPage();

//     // 3. Navigate to your target URL and wait until the DOM is loaded
//     await page.goto('http://quotes.toscrape.com/', { waitUntil: 'domcontentloaded' });

//     // 4. Extract data from the page using page.evaluate()
//     const extractedData = await page.evaluate(() => {
//         // This code executes inside the browser's context!
//         const quoteElements = document.querySelectorAll('.quote');
//         const data = [];

//         quoteElements.forEach((element) => {
//             const text = element.querySelector('.text').innerText;
//             const author = element.querySelector('.author').innerText;
//             data.push({ text, author });
//         });

//         return data;
//     });

//     // 5. Output the results
//     console.log(JSON.stringify(extractedData, null, 2));

//     // 6. Always clean up and close the browser
//     await browser.close();
// }

// runScraper().catch(err => console.error("Scraping failed:", err));
// const browser = await puppeteer.launch({ headless: false, slowMo: 100 });

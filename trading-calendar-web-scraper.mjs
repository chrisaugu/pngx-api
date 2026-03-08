import puppeteer from "puppeteer";

const USER_AGENT =
  "User-Agent: Nuku-API/1.0 (+https://nuku.zeabur.com; email@example.com)";

const getQuotes = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    // args: [' - proxy-server=http://your-proxy-server:port'],
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.google.com",
  });

  await page.mouse.move(100, 200);
  await page.mouse.move(150, 250, { steps: 10 });
  await page.keyboard.type("Hello World", { delay: 100 });

  // await page.solveRecaptchas();

  await page.setUserAgent("MyTool/1.0 (+https://example.com; dev@example.com)");

  await page.goto("https://www.pngx.com.pg/about-pngx/trading-calendar/", {
    // waitUntil: "domcontentloaded",
    waitUntil: "networkidle2",
  });

  console.log(
    "Browser opened. Please solve the CAPTCHA manually in the opened window."
  );
  console.log(
    "When you have successfully logged in, press ENTER in this terminal to continue."
  );

  // Wait for user confirmation in terminal before proceeding
  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.on("data", () => {
      process.stdin.pause();
      resolve();
    });
  });
  // const quotes = await page.evaluate(() => {
  //     const quoteList = document.querySelector("table");

  //     // return Array.from(quoteList).map((quote) => {
  //     //     const text = quote.querySelector(".text").innerText;
  //     //     const author = quote.querySelector(".author").innerText;

  //     //     return { text, author };
  //     // });
  //     return quoteList
  // });

  // console.log(quotes);

  // await browser.close();
};

getQuotes();

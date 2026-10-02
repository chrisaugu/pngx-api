const fs = require("fs");
const path = require("path");
const hooman = require("hooman").default;

const TARGET_URL = "https://www.pngx.com.pg/data/BSP.csv";
const OUTPUT_FILE = path.resolve(__dirname, "BSP.csv");

(async () => {
  try {
    console.log(`Fetching ${TARGET_URL} ...`);

    const response = await hooman.get(TARGET_URL);

    if (response.statusCode !== 200) {
      throw new Error(`Unexpected status: ${response.statusCode}`);
    }

    // response.body contains the CSV data
    fs.writeFileSync(OUTPUT_FILE, response.body);
    console.log(`Saved ${response.body.length} bytes to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.statusCode);
    }
    process.exit(1);
  }
})();

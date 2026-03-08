const { mongoose } = require("mongoose");
const _ = require("lodash");
const fs = require("node:fs");
const { initDatabase } = require("./database");
const { Company } = require("./models");

// import fs from "fs";
// import path from "path";
// import { pipeline } from "node:stream/promises";

// const fileUrl = "https://www.gutenberg.org/files/2701/2701-0.txt";
// const outputFilePath = path.join(process.cwd(), "moby.md");

// async function downloadFile(url, outputPath) {
//   const response = await fetch(url);

//   if (!response.ok || !response.body) {
//     throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
//   }

//   const fileStream = fs.createWriteStream(outputPath);
//   console.log(`Downloading file from ${url} to ${outputPath}`);

//   await pipeline(response.body, fileStream);
//   console.log("File downloaded successfully");
// }

// async function readFile(filePath) {
//   const readStream = fs.createReadStream(filePath, { encoding: "utf8" });

//   try {
//     for await (const chunk of readStream) {
//       console.log("--- File chunk start ---");
//       console.log(chunk);
//       console.log("--- File chunk end ---");
//     }
//     console.log("Finished reading the file.");
//   } catch (error) {
//     console.error(`Error reading file: ${error.message}`);
//   }
// }

// try {
//   await downloadFile(fileUrl, outputFilePath);
//   await readFile(outputFilePath);
// } catch (error) {
//   console.error(`Error: ${error.message}`);
// }
// async function readJSONFile(filename) {
//     try {
//       const data = await fs.readFile(filename, "utf8");
//       return JSON.parse(data);
//     } catch (error) {
//       console.error(`Error reading ${filename}: ${error}`);
//       return [];
//     }
//   }
// async function main() {
//   try {
//     const names = await readJSONFile("names.json");
//     const addresses = await readJSONFile("address.json");

//     const bioData = names.map((name) => {
//       const matchingAddress = addresses.find(
//         (address) => address.id === name.id
//       );
//       return { ...name, ...matchingAddress };
//     });

//     await fs.writeFile("bio.json", JSON.stringify(bioData, null, 2));
//     console.log("bio.json created successfully!");
//   } catch (error) {
//     console.error("Error combining data:", error);
//   }
// }
initDatabase()
  .on("connected", async function () {
    console.log(
      "[Main_Thread]: Connected: Successfully connect to mongo server"
    );

    fs.readdirSync("./images/logos/").forEach(async (logo) => {
      console.log(logo);
      const company = await Company.findOne({
        ticker: logo.split(".")[0].toUpperCase(),
      });
      if (company) {
        const logoBuffer = fs.readFileSync(`./images/logos/${logo}`);
        if (logoBuffer) {
          if (company["logo"]) {
            company["logo"] = {
              data: logoBuffer,
              contentType: "image/png",
            };
          }
          var base64Flag = "data:image/jpeg;base64,";
          var imageStr = arrayBufferToBase64(company.logo.data);

          //   console.log(base64Flag + imageStr);
          company.save();
        }
      }
    });
  })
  .on("error", function () {
    console.log(
      "[Main_Thread]: Error: Could not connect to MongoDB. Did you forget to run 'mongod'?"
    );
  });

function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

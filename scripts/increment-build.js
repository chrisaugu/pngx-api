import { readFile, writeFile } from "fs";
import path from "path";
const versionFile = path.resolve("version.txt");

readFile(versionFile, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading version file:", err);
    return;
  }

  let version = parseInt(data); // Assuming version is a number
  version++;

  writeFile(versionFile, version.toString(), "utf8", (err) => {
    if (err) {
      console.error("Error writing version file:", err);
      return;
    }
    console.log("Build number incremented to:", version);
  });
});

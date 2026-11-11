import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// import { version as packageVersion } from '../package.json' assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const packageVersion = packageJson.version;

function main() {
  console.info("Incremental build script");
  console.info("========================");
  console.info(process.argv);
  let incrementType = "patch";

  if (process.argv.length < 3) {
    console.log(
      "Usage: node index.ts <path_to_server_script> [major|minor|patch|build]",
    );
    return;
  }
  if (!packageVersion) {
    console.error("Could not find package version in package.json");
    process.exit(1);
  }
  console.log(`Current package version: ${packageVersion}`);

  let major = parseInt(packageVersion.split(".")[0]);
  let minor = parseInt(packageVersion.split(".")[1]);
  let patch = parseInt(packageVersion.split(".")[2]);
  let build = parseInt(packageVersion.split("-")[1]) || 0;

  if (major) {
    major += 1;
    minor = 0;
    patch = 0;
    build = 0;
  }
  if (minor) {
    minor += 1;
    patch = 0;
    build = 0;
  }
  if (patch) {
    patch += 1;
    build = 0;
  }
  if (build) build += 1;

  const newVersion = packageVersion
    .toString()
    .split(".")
    .concat([major, minor, patch])
    .join(".");
  if (build) {
    console.log(`Incrementing build number to: ${build}`);
    newVersion.concat(["-", build]).join("");
  }

  packageJson.version = newVersion;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n",
  );

  console.info(`Updated package version to: ${newVersion}`);
}

main();

import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const ignores = [
  ".clinic",
  ".github/**",
  ".postman/**",
  ".vercel/**",
  ".well-known/**",
  "coverage/**",
  "demo/**",
  "docs/**",
  "images/**",
  "logs/**",
  "node_modules/**",
  "package/**",
  "sdk/**",
  "tests/**",
];

export default defineConfig([
  eslintConfigPrettier,
  // { ignores: ["**/*.js", "**/*.cjs", "**/*.mjs"] },
  {
    files: ["**/*.js"],
    rules: {
      // semi: "error",
      "prefer-const": "error",
      // "no-console": "error",
      // indent: "error"
    },
    ignores,
    root: true,
    parser: "flow-eslint",
    plugins: ["jest", "ft-flow"],
    extends: ["prettier", "eslint:recommended", "plugin:ft-flow/recommended"],
  },
]);
module.exports = {
  root: true,
  parser: "flow-eslint",
  plugins: ["ft-flow"],
  extends: ["eslint:recommended", "plugin:ft-flow/recommended"],
};

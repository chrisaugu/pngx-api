import { defineConfig } from "eslint/config";

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
  "tests/**"
];

export default defineConfig([
  // { ignores: ["**/*.js", "**/*.cjs", "**/*.mjs"] },
  {
    files: ["**/*.js"],
    rules: {
      semi: "error",
      "prefer-const": "error",
      // "no-console": "error",
    },
    ignores,
  },
]);
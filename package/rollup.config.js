import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      // file: "dist/index.js",
      format: 'esm'
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'NukuAPI'
    },
    {
      file: 'dist/index.amd.js',
      format: 'amd',
      name: 'NukuAPI'
    }
  ],
  external: ["axios", "os", "url"],
  plugins: [
    typescript(),
    // dts()
  ],
});
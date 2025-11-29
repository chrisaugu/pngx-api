import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import terser from '@rollup/plugin-terser';

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'NukuAPI',
      plugins: [
        terser()
      ]
    }
  ],
  plugins: [
    typescript()
  ],
});
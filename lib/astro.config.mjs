import { defineConfig } from "astro/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import glsl from "vite-plugin-glsl";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  srcDir: "./playground/src",
  publicDir: "./playground/public",
  vite: {
    resolve: {
      alias: {
        usegl: resolve(__dirname, "./src/index.ts"),
      },
    },
    plugins: [glsl({ minify: true })],
  },
  devToolbar: {
    enabled: false,
  },
});

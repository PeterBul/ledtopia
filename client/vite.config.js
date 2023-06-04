import { defineConfig } from "vite";
import { createVuePlugin as vue } from "vite-plugin-vue2";

import { dirname } from "path";
import { fileURLToPath } from "url";

const _dirname = dirname(fileURLToPath(import.meta.url));

import path from "path";

export default defineConfig({
  //https://vitejs.dev/config
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(_dirname, "./src"),
    },
  },
});

import { crx } from "@crxjs/vite-plugin";
import { resolve } from "path";
// import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

import manifest from "./src/manifest";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const popupDir = resolve(pagesDir, "popup");
const assetsDir = resolve(root, "assets");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");
const overlayDir = resolve(pagesDir, "overlay");

const isDev = process.env.__DEV__ === "true";

export default defineConfig(({ command }) => {
  return {
    plugins: [
      // devtools({
      //   /* features options - all disabled by default */
      //   autoname: true, // e.g. enable autoname
      // }),
      solidPlugin(),
      crx({ manifest }),
    ],
    resolve: {
      alias: {
        "@src": root,
        "@assets": assetsDir,
        "@pages": pagesDir,
        "~": popupDir,
        "webextension-polyfill":
          command === "serve"
            ? resolve(popupDir, "util/mock-browser")
            : "webextension-polyfill",
      },
    },
    publicDir,
    build: {
      outDir,
      sourcemap: isDev,
      target: "esnext",
      rollupOptions: {
        input: {
          overlay: resolve(overlayDir, "index.html"),
        },
        // output: {
        //   entryFileNames: "src/pages/[name]/index.js",
        //   chunkFileNames: isDev
        //     ? "assets/js/[name].js"
        //     : "assets/js/[name].[hash].js",
        //   assetFileNames: (assetInfo) => {
        //     const { dir, name: _name } = path.parse(assetInfo.name);
        //     // const assetFolder = getLastElement(dir.split("/"));
        //     // const name = assetFolder + firstUpperCase(_name);
        //     return `assets/[ext]/${name}.chunk.[ext]`;
        //   },
        // },
      },
    },
  };
});

import { defineManifest } from "@crxjs/vite-plugin";

import packageJson from "../package.json";

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = "0"] = packageJson.version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

const manifest = defineManifest(async () => ({
  manifest_version: 3,
  name: packageJson.displayName ?? packageJson.name,
  version: `${major}.${minor}.${patch}.${label}`,
  description: packageJson.description,
  // options_page: "src/pages/options/index.html",
  background: { service_worker: "src/pages/background/index.ts" },
  action: {
    default_icon: "icons/32x32.png",
  },
  // chrome_url_overrides: {
  //   newtab: "src/pages/popup/index.html",
  // },
  icons: {
    "32": "icons/32x32.png",
    "128": "icons/128x128.png",
  },
  commands: {
    "toggle-palette": {
      description: "Toggle the BrowserOS command palette overlay",
      suggested_key: {
        windows: "Ctrl+B",
        mac: "Command+B",
        chromeos: "Ctrl+B",
        linux: "Ctrl+B",
      },
    },
  },
  permissions: [
    "alarms",
    "tabs",
    "sessions",
    "bookmarks",
    "management",
    "history",
    "favicon",
    "storage",
    "browserOS",
  ],
  web_accessible_resources: [
    {
      resources: [
        "_favicon/*",
        "assets/*",
        "assets/js/*.js",
        "assets/css/*.css",
        "assets/img/*",
        "src/pages/overlay/index.html",
        "browseros-loader.js",
      ],
      matches: ["<all_urls>"],
      extension_ids: ["*"],
    },
  ],
}));

export default manifest;

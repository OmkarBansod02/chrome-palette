import loaderSource from "../../../public/browseros-loader.js?raw";
import "./commands";
import "./queries";
import { runRegisteredCommand } from "./commands/registry";
import { runRegisteredQuery } from "./queries/registry";

const COMMAND_NAME = "toggle-palette";
const CONFIG_KEY = "__BROWSEROS_PALETTE_CONFIG__";
const MESSAGE_RUN_COMMAND = "palette:run";
const MESSAGE_QUERY = "palette:query";

type InjectionConfig = {
  frameSrc: string;
  extensionOrigin: string;
};

const isBrowserOSAvailable = () => {
  return Boolean(
    chrome.browserOS && typeof chrome.browserOS.executeJavaScript === "function"
  );
};

const getActiveTabId = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab?.id;
};

const buildInjectionCode = (config: InjectionConfig) => {
  const serializedConfig = JSON.stringify(config);
  return `
    (function() {
      window["${CONFIG_KEY}"] = ${serializedConfig};
      if (window.__browserosPalette && typeof window.__browserosPalette.toggle === 'function') {
        window.__browserosPalette.toggle();
        return;
      }
      ${loaderSource}
    })();
  `;
};

const executeInTab = async (tabId: number, code: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!isBrowserOSAvailable()) {
      reject(new Error("BrowserOS API is not available."));
      return;
    }
    chrome.browserOS.executeJavaScript(tabId, code, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
};

const togglePaletteInTab = async (tabId: number) => {
  const frameSrc = chrome.runtime.getURL("src/pages/overlay/index.html");
  const extensionOrigin = `chrome-extension://${chrome.runtime.id}`;
  const code = buildInjectionCode({ frameSrc, extensionOrigin });
  await executeInTab(tabId, code);
};

const handleToggleRequest = async (explicitTabId?: number) => {
  if (!isBrowserOSAvailable()) {
    console.error("BrowserOS API is not available. Cannot toggle palette.");
    return;
  }
  const tabId = explicitTabId ?? (await getActiveTabId());
  if (typeof tabId !== "number") {
    console.warn("Could not determine active tab to inject palette into.");
    return;
  }
  try {
    await togglePaletteInTab(tabId);
  } catch (error) {
    console.error("Failed to inject BrowserOS palette overlay.", error);
  }
};

chrome.commands.onCommand.addListener((command) => {
  if (command === COMMAND_NAME) {
    void handleToggleRequest();
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id != null) {
    void handleToggleRequest(tab.id);
  } else {
    void handleToggleRequest();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MESSAGE_RUN_COMMAND) {
    const { id, payload } = message ?? {};
    if (typeof id !== "string") {
      sendResponse({
        ok: false,
        error: "Invalid palette command message. Missing id.",
      });
      return;
    }
    runRegisteredCommand(id, payload)
      .then(() => {
        sendResponse({ ok: true });
      })
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    return true;
  }
  if (message?.type === MESSAGE_QUERY) {
    const { id, payload } = message ?? {};
    if (typeof id !== "string") {
      sendResponse({
        ok: false,
        error: "Invalid palette query message. Missing id.",
      });
      return;
    }
    runRegisteredQuery(id, payload)
      .then((result) => {
        sendResponse({ ok: true, result });
      })
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    return true;
  }
});

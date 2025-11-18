import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { getProviderById } from "@src/shared/providers";

import { registerCommand } from "./registry";

type OpenUrlPayload = {
  url?: string;
  active?: boolean;
};

type FocusTabPayload = {
  tabId?: number;
  windowId?: number;
};

type BookmarkFolderPayload = {
  parentId?: string;
};

type WindowSplitPayload = {
  bounds?: {
    availLeft: number;
    availTop: number;
    availHeight: number;
    availWidth: number;
  };
};

type ProviderExecutionPayload = {
  providerId?: string;
  query?: string;
};

type AgentExecutionPayload = {
  agent?: {
    id: string;
    name: string;
    goal: string;
    steps?: string[];
  };
  query?: string;
};

const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (!tab) {
    throw new Error("Unable to locate the active tab.");
  }
  return tab;
};

const ensureTabId = (tab: chrome.tabs.Tab): number => {
  if (tab.id == null) {
    throw new Error("Active tab does not have an id.");
  }
  return tab.id;
};

const ensureWindowId = (tab: chrome.tabs.Tab): number => {
  if (tab.windowId == null) {
    throw new Error("Active tab does not belong to a window.");
  }
  return tab.windowId;
};

const tabIds = (tabs: chrome.tabs.Tab[]) =>
  tabs
    .map((tab) => tab.id)
    .filter((id): id is number => typeof id === "number");

const ensureSplitBounds = (payload?: WindowSplitPayload) => {
  if (!payload?.bounds) {
    throw new Error("Split screen commands require screen bounds.");
  }
  return payload.bounds;
};

registerCommand(
  PaletteCommandId.OPEN_URL,
  async ({ url, active }: OpenUrlPayload = {}) => {
    if (typeof url !== "string" || url.length === 0) {
      throw new Error("Cannot open url. A valid url must be provided.");
    }
    await chrome.tabs.create({
      url,
      active: active ?? true,
    });
  }
);

registerCommand(
  PaletteCommandId.TABS_NEW,
  async () => {
    await chrome.tabs.create({});
  }
);

registerCommand(
  PaletteCommandId.WINDOWS_NEW,
  async () => {
    await chrome.windows.create({});
  }
);

registerCommand(
  PaletteCommandId.WINDOWS_NEW_INCOGNITO,
  async () => {
    await chrome.windows.create({ incognito: true });
  }
);

registerCommand(
  PaletteCommandId.TABS_FOCUS,
  async ({ tabId, windowId }: FocusTabPayload = {}) => {
    if (typeof tabId !== "number") {
      throw new Error("Cannot focus tab. Missing tabId.");
    }
    await chrome.tabs.update(tabId, {
      active: true,
      highlighted: true,
    });
    if (typeof windowId === "number") {
      await chrome.windows.update(windowId, {
        focused: true,
      });
    }
  }
);

registerCommand(
  PaletteCommandId.TABS_CLOSE_ACTIVE,
  async () => {
    const tab = await getActiveTab();
    await chrome.tabs.remove(ensureTabId(tab));
  }
);

registerCommand(
  PaletteCommandId.TABS_RELOAD_ACTIVE,
  async () => {
    const tab = await getActiveTab();
    await chrome.tabs.reload(ensureTabId(tab));
  }
);

registerCommand(
  PaletteCommandId.TABS_RELOAD_ALL,
  async () => {
    const tab = await getActiveTab();
    const windowId = ensureWindowId(tab);
    const tabs = await chrome.tabs.query({ windowId });
    for (const target of tabs) {
      if (target.id != null) {
        await chrome.tabs.reload(target.id);
      }
    }
  }
);

registerCommand(
  PaletteCommandId.TABS_RELOAD_BYPASS_CACHE,
  async () => {
    const tab = await getActiveTab();
    await chrome.tabs.reload(ensureTabId(tab), { bypassCache: true });
  }
);

registerCommand(
  PaletteCommandId.TABS_TOGGLE_PIN,
  async () => {
    const tab = await getActiveTab();
    await chrome.tabs.update(ensureTabId(tab), {
      pinned: !tab.pinned,
    });
  }
);

registerCommand(
  PaletteCommandId.TABS_DUPLICATE_ACTIVE,
  async () => {
    const tab = await getActiveTab();
    await chrome.tabs.duplicate(ensureTabId(tab));
  }
);

registerCommand(
  PaletteCommandId.TABS_CLOSE_OTHERS,
  async () => {
    const tab = await getActiveTab();
    const windowId = ensureWindowId(tab);
    const others = await chrome.tabs.query({ windowId, active: false });
    const ids = tabIds(others);
    if (ids.length > 0) {
      await chrome.tabs.remove(ids);
    }
  }
);

registerCommand(
  PaletteCommandId.TABS_CLOSE_RIGHT,
  async () => {
    const tab = await getActiveTab();
    const windowId = ensureWindowId(tab);
    const tabs = await chrome.tabs.query({ windowId });
    const ids = tabIds(
      tabs.filter((candidate) => candidate.index > tab.index)
    );
    if (ids.length > 0) {
      await chrome.tabs.remove(ids);
    }
  }
);

registerCommand(
  PaletteCommandId.TABS_CLOSE_LEFT,
  async () => {
    const tab = await getActiveTab();
    const windowId = ensureWindowId(tab);
    const tabs = await chrome.tabs.query({ windowId });
    const ids = tabIds(
      tabs.filter((candidate) => candidate.index < tab.index)
    );
    if (ids.length > 0) {
      await chrome.tabs.remove(ids);
    }
  }
);

registerCommand(
  PaletteCommandId.TABS_TOGGLE_MUTE,
  async () => {
    const tab = await getActiveTab();
    const muted = tab.mutedInfo?.muted ?? false;
    await chrome.tabs.update(ensureTabId(tab), { muted: !muted });
  }
);

registerCommand(
  PaletteCommandId.TABS_MOVE_START,
  async () => {
    const tab = await getActiveTab();
    await chrome.tabs.move(ensureTabId(tab), { index: 0 });
  }
);

registerCommand(
  PaletteCommandId.TABS_MOVE_END,
  async () => {
    const tab = await getActiveTab();
    await chrome.tabs.move(ensureTabId(tab), { index: -1 });
  }
);

registerCommand(
  PaletteCommandId.TABS_MOVE_LEFT,
  async () => {
    const tab = await getActiveTab();
    const newIndex = Math.max(tab.index - 1, 0);
    await chrome.tabs.move(ensureTabId(tab), { index: newIndex });
  }
);

registerCommand(
  PaletteCommandId.TABS_MOVE_RIGHT,
  async () => {
    const tab = await getActiveTab();
    const windowId = ensureWindowId(tab);
    const tabs = await chrome.tabs.query({ windowId });
    const maxIndex = tabs.length - 1;
    const newIndex = Math.min(tab.index + 1, maxIndex);
    await chrome.tabs.move(ensureTabId(tab), { index: newIndex });
  }
);

registerCommand(
  PaletteCommandId.SESSIONS_RESTORE_LAST,
  async () => {
    await chrome.sessions.restore();
  }
);

registerCommand(
  PaletteCommandId.TABS_DETACH_TO_WINDOW,
  async () => {
    const tab = await getActiveTab();
    await chrome.windows.create({ tabId: ensureTabId(tab) });
  }
);

registerCommand(
  PaletteCommandId.WINDOWS_SPLIT_VERTICAL,
  async (payload?: WindowSplitPayload) => {
    const bounds = ensureSplitBounds(payload);
    const tab = await getActiveTab();
    const tabId = ensureTabId(tab);
    const currentWindow = await chrome.windows.getCurrent();
    if (currentWindow.id == null) {
      throw new Error("Unable to determine current window.");
    }
    const halfHeight = Math.floor(bounds.availHeight / 2);
    await chrome.windows.update(currentWindow.id, {
      left: bounds.availLeft,
      top: bounds.availTop,
      width: bounds.availWidth,
      height: halfHeight,
      state: "normal",
    });
    await chrome.windows.create({
      tabId,
      left: bounds.availLeft,
      top: bounds.availTop + halfHeight,
      width: bounds.availWidth,
      height: halfHeight,
      focused: true,
    });
  }
);

registerCommand(
  PaletteCommandId.WINDOWS_SPLIT_HORIZONTAL,
  async (payload?: WindowSplitPayload) => {
    const bounds = ensureSplitBounds(payload);
    const tab = await getActiveTab();
    const tabId = ensureTabId(tab);
    const currentWindow = await chrome.windows.getCurrent();
    if (currentWindow.id == null) {
      throw new Error("Unable to determine current window.");
    }
    const halfWidth = Math.floor(bounds.availWidth / 2);
    await chrome.windows.update(currentWindow.id, {
      left: bounds.availLeft,
      top: bounds.availTop,
      width: halfWidth,
      height: bounds.availHeight,
      state: "normal",
    });
    await chrome.windows.create({
      tabId,
      left: bounds.availLeft + halfWidth,
      top: bounds.availTop,
      width: halfWidth,
      height: bounds.availHeight,
      focused: true,
    });
  }
);

registerCommand(
  PaletteCommandId.TABS_REATTACH_PREVIOUS_WINDOW,
  async () => {
    const tab = await getActiveTab();
    const currentWindow = await chrome.windows.getCurrent({
      windowTypes: ["normal"],
    });
    if (currentWindow.id == null) {
      throw new Error("Unable to determine current window.");
    }
    const allWindows = await chrome.windows.getAll({ windowTypes: ["normal"] });
    const target = allWindows.find((win) => win.id !== currentWindow.id);
    if (!target?.id) {
      throw new Error("No other window available to move the tab to.");
    }
    await chrome.windows.update(target.id, { focused: true });
    await chrome.tabs.move(ensureTabId(tab), {
      windowId: target.id,
      index: -1,
    });
    await chrome.tabs.update(ensureTabId(tab), { active: true, highlighted: true });
  }
);

registerCommand(
  PaletteCommandId.WINDOWS_TOGGLE_FULLSCREEN,
  async () => {
    const window = await chrome.windows.getCurrent();
    if (window.id == null) {
      throw new Error("Unable to determine current window.");
    }
    const nextState = window.state === "fullscreen" ? "normal" : "fullscreen";
    await chrome.windows.update(window.id, {
      state: nextState,
    });
  }
);

registerCommand(
  PaletteCommandId.BOOKMARKS_SAVE_TO_FOLDER,
  async ({ parentId }: BookmarkFolderPayload = {}) => {
    if (typeof parentId !== "string" || parentId.length === 0) {
      throw new Error("Cannot bookmark tab without a folder id.");
    }
    const activeTab = await getActiveTab();
    if (!activeTab.url) {
      throw new Error("Cannot bookmark current tab. URL is unavailable.");
    }
    await chrome.bookmarks.create({
      index: 0,
      url: activeTab.url,
      title: activeTab.title ?? activeTab.url,
      parentId,
    });
  }
);

registerCommand(
  PaletteCommandId.PROVIDERS_EXECUTE,
  async ({ providerId, query }: ProviderExecutionPayload = {}) => {
    if (!providerId) {
      throw new Error("Provider ID is required.");
    }
    const provider = getProviderById(providerId);
    if (!provider) {
      throw new Error(`Provider "${providerId}" is not registered.`);
    }
    const trimmedQuery = query?.trim() ?? "";
    if (provider.actionType === "url") {
      if (!provider.urlPattern) {
        throw new Error(`Provider "${providerId}" is missing a url pattern.`);
      }
      const hasPlaceholder = provider.urlPattern.includes("%s");
      const targetUrl = hasPlaceholder
        ? provider.urlPattern.replace(
            "%s",
            encodeURIComponent(trimmedQuery || "")
          )
        : provider.urlPattern;
      const openInNewTab =
        provider.openIn === "newTab" ||
        (provider.openIn === undefined && provider.category === "llm");
      if (openInNewTab) {
        await chrome.tabs.create({ url: targetUrl });
      } else {
        const tab = await getActiveTab();
        await chrome.tabs.update(ensureTabId(tab), { url: targetUrl });
      }
      return;
    }

    if (provider.actionType === "sidepanel") {
      const tab = await getActiveTab();
      try {
        // Find BrowserOS extension
        const extensions = await chrome.management.getAll();
        const browserOS = extensions.find(ext =>
          ext.enabled &&
          (ext.name.toLowerCase().includes('browseros') &&
           !ext.name.toLowerCase().includes('agent') &&
           !ext.name.toLowerCase().includes('palette'))
        );

        if (!browserOS) {
          throw new Error("BrowserOS extension not found. Please ensure BrowserOS is installed and enabled.");
        }

        console.log("[Palette BG] Found BrowserOS extension:", browserOS.id);
        console.log("[Palette BG] Sending NEWTAB_EXECUTE_QUERY message to BrowserOS");

        await chrome.runtime.sendMessage(browserOS.id, {
          type: "NEWTAB_EXECUTE_QUERY",
          tabId: ensureTabId(tab),
          query: trimmedQuery,
          metadata: {
            source: "palette",
            executionMode: "dynamic",
          },
        });
        console.log("[Palette BG] NEWTAB_EXECUTE_QUERY sent successfully to BrowserOS");
      } catch (error) {
        console.error("[Palette BG] Error sending NEWTAB_EXECUTE_QUERY:", error);
        if (error instanceof Error && error.message.includes("Could not establish connection")) {
          throw new Error("BrowserOS extension is not responding. Please ensure BrowserOS is running properly.");
        }
        throw error;
      }
      return;
    }

    throw new Error(`Unsupported provider action: ${provider.actionType}`);
  }
);

registerCommand(
  PaletteCommandId.AGENTS_EXECUTE,
  async ({ agent, query }: AgentExecutionPayload = {}) => {
    if (!agent) {
      throw new Error("Agent metadata is required.");
    }
    const tab = await getActiveTab();
    try {
      // Find BrowserOS extension
      const extensions = await chrome.management.getAll();
      const browserOS = extensions.find(ext =>
        ext.enabled &&
        (ext.name.toLowerCase().includes('browseros') &&
         !ext.name.toLowerCase().includes('agent') &&
         !ext.name.toLowerCase().includes('palette'))
      );

      if (!browserOS) {
        throw new Error("BrowserOS extension not found. Please ensure BrowserOS is installed and enabled.");
      }

      console.log("[Palette BG] Found BrowserOS extension:", browserOS.id);
      console.log("[Palette BG] Sending agent NEWTAB_EXECUTE_QUERY message to BrowserOS");

      await chrome.runtime.sendMessage(browserOS.id, {
        type: "NEWTAB_EXECUTE_QUERY",
        tabId: ensureTabId(tab),
        query: query?.trim() || agent.goal,
        metadata: {
          source: "palette",
          executionMode: "predefined",
          predefinedPlan: {
            agentId: agent.id,
            steps: agent.steps ?? [],
            goal: agent.goal,
            name: agent.name,
          },
        },
      });
      console.log("[Palette BG] Agent NEWTAB_EXECUTE_QUERY sent successfully to BrowserOS");
    } catch (error) {
      console.error("[Palette BG] Error sending agent NEWTAB_EXECUTE_QUERY:", error);
      if (error instanceof Error && error.message.includes("Could not establish connection")) {
        throw new Error("BrowserOS extension is not responding. Please ensure BrowserOS is running properly.");
      }
      throw error;
    }
  }
);

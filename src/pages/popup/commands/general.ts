// adapted from https://github.com/ssundarraj/commander/blob/master/src/js/actions.js
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { resetHistory } from "~/util/last-used";
import { inputSignal, parsedInput } from "~/util/signals";

type CommandActionPayload = unknown | (() => unknown);

export type CommandAction = {
  id: PaletteCommandId;
  payload?: CommandActionPayload;
};

export type Command = {
  title: string;
  subtitle?: string;
  shortcut?: string;
  lastVisitTime?: number;
  keyword?: string;
  icon?: string;
  action?: CommandAction;
  command?: () => unknown;
  url?: string;
};

const [, setInputValue] = inputSignal;

const backgroundAction = (
  id: PaletteCommandId,
  payload?: CommandAction["payload"]
): CommandAction => ({
  id,
  payload,
});

const openUrlAction = (url: string) =>
  backgroundAction(PaletteCommandId.OPEN_URL, { url });

const openUrlCommand = (
  command: Omit<Command, "action" | "command"> & { url: string }
): Command => ({
  ...command,
  action: openUrlAction(command.url),
});

type ScreenBoundsPayload = {
  availLeft: number;
  availTop: number;
  availHeight: number;
  availWidth: number;
};

const getScreenBounds = (): ScreenBoundsPayload => {
  const scr = window.screen as Screen & {
    availLeft?: number;
    availTop?: number;
  };
  return {
    availLeft: scr.availLeft ?? 0,
    availTop: scr.availTop ?? 0,
    availHeight: scr.availHeight,
    availWidth: scr.availWidth,
  };
};
const base: Command[] = [
  {
    title: "New Tab",
    subtitle: "Open a new tab",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath d='M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z'/%3E%3Cpath d='M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z'/%3E%3C/svg%3E",
    shortcut: "?O~ t",
    action: backgroundAction(PaletteCommandId.TABS_NEW),
  },
  {
    title: "New Window",
    subtitle: "Open a new browser window",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z'/%3E%3C/svg%3E",
    shortcut: "?O~ n",
    action: backgroundAction(PaletteCommandId.WINDOWS_NEW),
  },
  {
    title: "Provider Settings",
    subtitle: "Manage search providers and settings",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath fill-rule='evenodd' d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z' clip-rule='evenodd'/%3E%3C/svg%3E",
    command: async () => {
      console.log("Provider settings clicked - TODO: implement settings UI");
    },
  },
  openUrlCommand({
    title: "Open History Page",
    shortcut: "?O~ y",
    url: "chrome://history",
  }),
  openUrlCommand({
    title: "Open Downloads",
    shortcut: "?O~?? d",
    url: "chrome://downloads",
  }),
  openUrlCommand({
    title: "Open Extensions",
    url: "chrome://extensions",
  }),
  openUrlCommand({
    title: "Open Bookmark Manager",
    shortcut: "?O~?O? b",
    url: "chrome://bookmarks",
  }),
  openUrlCommand({
    title: "Open Settings",
    shortcut: "?O~ ,",
    url: "chrome://settings",
  }),
  {
    title: "Close Current Tab",
    shortcut: "?O~ w",
    action: backgroundAction(PaletteCommandId.TABS_CLOSE_ACTIVE),
  },
  // {
  //   title: "Terminate Current Tab",
  //   command: async function () {
  //     const windowId = chrome.windows.WINDOW_ID_CURRENT;
  //     console.log(chrome);
  //     const [currentTab] = await chrome.tabs.query({
  //       active: true,
  //       windowId,
  //     });
  //     debugger;
  //     const processId = await chrome.processes.getProcessIdForTab(
  //       currentTab.id!
  //     );

  //     await chrome.processes.terminate(processId);
  //   },
  // },
  {
    title: "Reload Tab",
    shortcut: "?O~ r",
    action: backgroundAction(PaletteCommandId.TABS_RELOAD_ACTIVE),
  },
  {
    title: "Reload All Tabs",
    action: backgroundAction(PaletteCommandId.TABS_RELOAD_ALL),
  },
  {
    title: "Clear Cache and Reload Tab",
    shortcut: "?O~?? r",
    action: backgroundAction(PaletteCommandId.TABS_RELOAD_BYPASS_CACHE),
  },
  {
    title: "Toggle Pin",
    action: backgroundAction(PaletteCommandId.TABS_TOGGLE_PIN),
  },
  {
    title: "Duplicate Tab",
    action: backgroundAction(PaletteCommandId.TABS_DUPLICATE_ACTIVE),
  },
  {
    title: "New Incognito Window",
    shortcut: "?O~?? n",
    action: backgroundAction(PaletteCommandId.WINDOWS_NEW_INCOGNITO),
  },
  {
    title: "Close Other Tabs",
    action: backgroundAction(PaletteCommandId.TABS_CLOSE_OTHERS),
  },
  {
    title: "Close Tabs To Right",
    action: backgroundAction(PaletteCommandId.TABS_CLOSE_RIGHT),
  },
  {
    title: "Close Tabs To Left",
    action: backgroundAction(PaletteCommandId.TABS_CLOSE_LEFT),
  },
  {
    title: "Mute/Unmute Tab",
    action: backgroundAction(PaletteCommandId.TABS_TOGGLE_MUTE),
  },
  {
    title: "Move Tab Left",
    action: backgroundAction(PaletteCommandId.TABS_MOVE_LEFT),
  },
  {
    title: "Move Tab Right",
    action: backgroundAction(PaletteCommandId.TABS_MOVE_RIGHT),
  },
  {
    title: "Reopen/Unclose Tab",
    shortcut: "?O~?? t",
    action: backgroundAction(PaletteCommandId.SESSIONS_RESTORE_LAST),
  },
  // {
  //   title: "Print page",
  //   shortcut: "?O~ p",
  //   command: async function () {
  //     const currentTab = await getActiveTab();
  //     chrome.tabs.update(currentTab.id!, { url: "chrome://print" });
  //   },
  // },
  {
    title: "Reset command history",
    subtitle: "Resets the order of commands in this extension",
    command: async function () {
      setTimeout(() => {
        // otherwise this command will be stored
        resetHistory();
        window.location.reload();
      }, 0);
    },
  },
];


export const quickActionCommands = (): Command[] => [
  {
    title: "New Tab",
    subtitle: "Open a new tab",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath d='M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z'/%3E%3Cpath d='M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z'/%3E%3C/svg%3E",
    action: backgroundAction(PaletteCommandId.TABS_NEW),
  },
  {
    title: "New Window",
    subtitle: "Open a new browser window",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z'/%3E%3C/svg%3E",
    action: backgroundAction(PaletteCommandId.WINDOWS_NEW),
  },
  {
    title: "Provider Settings",
    subtitle: "Manage search providers and settings",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath fill-rule='evenodd' d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z' clip-rule='evenodd'/%3E%3C/svg%3E",
    url: "chrome-extension://djhdjhlnljbjgejbndockeedocneiaei/browseros-settings.html",
  },
];

export default function generalSuggestions(): Command[] {
  const { isCommand } = parsedInput();
  if (isCommand) return [];
  return base;
}

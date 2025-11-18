/**
 * Tab commands - Core tab management
 * Provides commands for switching, closing, and managing tabs
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { PaletteQueryId } from "@src/shared/paletteQueryIds";
import { CommandBuilder } from "../../utils/command-builder";
import { createLazyResource, matchCommand, setInput, setSearchMode } from "../../util/signals";
import { requestQuery } from "../../util/query";
import niceUrl from "../../util/nice-url";
import { faviconURL } from "../../Entry";

const TAB_KEYWORD = "t";

/**
 * Get all open tabs dynamically
 */
const allTabsResource = createLazyResource<Command[]>([], async () => {
  const tabs = await requestQuery<chrome.tabs.Tab[]>(PaletteQueryId.TABS_ALL);

  return tabs.map(({ title, url, id, windowId }) => ({
    title: title || "Untitled",
    subtitle: niceUrl(url || ""),
    icon: faviconURL(url || ""),
    category: "core" as const,
    action: {
      id: PaletteCommandId.TABS_FOCUS,
      payload: { tabId: id, windowId },
    },
  }));
});

/**
 * Static tab commands
 */
const staticTabCommands: Command[] = [
  // Search tabs command - shows all open tabs immediately
  CommandBuilder.createFrontendCommand({
    title: "Search Tabs",
    subtitle: "Switch between open tabs",
    command: () => {
      // Clear input first to avoid triggering search mode exit
      setInput("");
      // Then activate tab search mode
      setSearchMode("tabs");
    },
    keyword: TAB_KEYWORD + ">",
    icon: faviconURL("about:blank"),
    category: "core",
  }),

  // Close current tab
  CommandBuilder.createCommand({
    title: "Close Tab",
    subtitle: "Close the current tab",
    commandId: PaletteCommandId.TABS_CLOSE_ACTIVE,
    category: "core",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23ef4444'%3E%3Cpath fill-rule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E",
  }),

  // Reopen closed tab
  CommandBuilder.createCommand({
    title: "Reopen Closed Tab",
    subtitle: "Restore the last closed tab",
    commandId: PaletteCommandId.SESSIONS_RESTORE_LAST,
    category: "core",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath fill-rule='evenodd' d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z' clip-rule='evenodd'/%3E%3C/svg%3E",
  }),

  // Duplicate tab
  CommandBuilder.createCommand({
    title: "Duplicate Tab",
    subtitle: "Create a duplicate of the current tab",
    commandId: PaletteCommandId.TABS_DUPLICATE_ACTIVE,
    category: "core",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath d='M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z'/%3E%3Cpath d='M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z'/%3E%3C/svg%3E",
  }),
];

/**
 * Get tab commands based on search context
 */
export default function tabCommands(): Command[] {
  const { isMatch, isCommand } = matchCommand(TAB_KEYWORD);

  // If keyword matches, show all open tabs
  if (isMatch) return allTabsResource();

  // If typing the keyword, show nothing (autocomplete)
  if (isCommand) return [];

  // Default: show static tab commands
  return staticTabCommands;
}

/**
 * Quick action tab commands (for featured section)
 */
export function quickTabCommands(): Command[] {
  return [
    CommandBuilder.createCommand({
      title: "New Tab",
      subtitle: "Open a new tab",
      commandId: PaletteCommandId.TABS_NEW,
      category: "quick",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath d='M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z'/%3E%3Cpath d='M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z'/%3E%3C/svg%3E",
      shortcut: "?O~ t",
    }),
  ];
}

/**
 * Get all tabs for search mode
 */
export function getAllTabs(): Command[] {
  return allTabsResource();
}

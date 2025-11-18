/**
 * History commands - Browse recent history
 * Provides searchable access to browsing history
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { PaletteQueryId } from "@src/shared/paletteQueryIds";
import { CommandBuilder } from "../../utils/command-builder";
import { createLazyResource, matchCommand, setInput, setSearchMode } from "../../util/signals";
import { requestQuery } from "../../util/query";
import { faviconURL } from "../../Entry";

const HISTORY_KEYWORD = "h";

/**
 * Type guard to filter out null/undefined values
 */
function isDefined<T>(value: T | null | undefined): value is T {
  return Boolean(value);
}

/**
 * Get recent history dynamically
 */
const allHistoryResource = createLazyResource<Command[]>([], async () => {
  const historyItems = await requestQuery<chrome.history.HistoryItem[]>(
    PaletteQueryId.HISTORY_RECENT,
    { maxResults: 5000 }
  );

  return historyItems
    .map(({ url, title, lastVisitTime }) => {
      if (!url) return null;

      return {
        title: title || "Untitled",
        lastVisitTime,
        icon: faviconURL(url),
        category: "navigation" as const,
        url,
        action: {
          id: PaletteCommandId.OPEN_URL,
          payload: { url },
        },
      };
    })
    .filter(isDefined);
});

/**
 * Static history commands
 */
const staticHistoryCommands: Command[] = [
  CommandBuilder.createFrontendCommand({
    title: "Search History",
    subtitle: "Browse recent browsing history",
    command: () => {
      setInput("");
      setSearchMode("history");
    },
    keyword: HISTORY_KEYWORD + ">",
    icon: faviconURL("chrome://history/"),
    category: "navigation",
  }),
];

/**
 * Get history commands based on search context
 */
export default function historyCommands(): Command[] {
  const { isMatch, isCommand } = matchCommand(HISTORY_KEYWORD);

  // If keyword matches, show all history
  if (isMatch) return allHistoryResource();

  // If typing the keyword, show nothing (autocomplete)
  if (isCommand) return [];

  // Default: show static history commands
  return staticHistoryCommands;
}

/**
 * Get all history for search mode
 */
export function getAllHistory(): Command[] {
  return allHistoryResource();
}

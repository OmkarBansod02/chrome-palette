/**
 * Bookmark commands - Navigate to saved bookmarks
 * Provides searchable access to all bookmarks
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { PaletteQueryId } from "@src/shared/paletteQueryIds";
import { CommandBuilder } from "../../utils/command-builder";
import { createLazyResource, matchCommand, setInput, setSearchMode } from "../../util/signals";
import { requestQuery } from "../../util/query";
import { faviconURL } from "../../Entry";

const BOOKMARK_KEYWORD = "b";

/**
 * Recursively traverse bookmark tree and convert to commands
 */
const traverseBookmarks = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes
    .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
    .flatMap(({ children, url, title, dateAdded }) => {
      const path = breadcrumb ? `${breadcrumb}/${title}` : title;

      if (children) {
        return traverseBookmarks(children, path);
      }

      return {
        title: `${title} > ${breadcrumb}`,
        icon: faviconURL(url || ""),
        lastVisitTime: dateAdded,
        category: "navigation" as const,
        url: url || "",
        action: {
          id: PaletteCommandId.OPEN_URL,
          payload: { url },
        },
      };
    });
};

/**
 * Get all bookmarks dynamically
 */
const allBookmarksResource = createLazyResource<Command[]>([], async () => {
  const root = await requestQuery<chrome.bookmarks.BookmarkTreeNode[]>(
    PaletteQueryId.BOOKMARKS_TREE
  );
  return traverseBookmarks(root);
});

/**
 * Static bookmark commands
 */
const staticBookmarkCommands: Command[] = [
  CommandBuilder.createFrontendCommand({
    title: "Search Bookmarks",
    subtitle: "Find and open bookmarks",
    command: () => {
      setInput("");
      setSearchMode("bookmarks");
    },
    keyword: BOOKMARK_KEYWORD + ">",
    icon: faviconURL("chrome://bookmarks/"),
    category: "navigation",
  }),
];

/**
 * Get bookmark commands based on search context
 */
export default function bookmarkCommands(): Command[] {
  const { isMatch, isCommand } = matchCommand(BOOKMARK_KEYWORD);

  // If keyword matches, show all bookmarks
  if (isMatch) return allBookmarksResource();

  // If typing the keyword, show nothing (autocomplete)
  if (isCommand) return [];

  // Default: show static bookmark commands
  return staticBookmarkCommands;
}

/**
 * Get all bookmarks for search mode
 */
export function getAllBookmarks(): Command[] {
  return allBookmarksResource();
}

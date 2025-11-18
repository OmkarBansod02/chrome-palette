/**
 * Bookmark This Tab - Save current tab to bookmarks
 * Provides folder selection for saving bookmarks
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { PaletteQueryId } from "@src/shared/paletteQueryIds";
import { CommandBuilder } from "../../utils/command-builder";
import { createLazyResource, matchCommand, setInput } from "../../util/signals";
import { requestQuery } from "../../util/query";
import { faviconURL } from "../../Entry";

const BOOKMARK_THIS_KEYWORD = "bt";

/**
 * Recursively traverse bookmark folders to create save commands
 */
const traverseBookmarkFolders = (
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  breadcrumb = ""
): Command[] => {
  return nodes.flatMap(({ id, children, url, title, dateAdded }) => {
    const path = breadcrumb ? `${breadcrumb} / ${title}` : title;
    const list: Command[] = [];

    // If it's a folder (no URL), add it as a save destination
    if (!url && path !== "") {
      list.push({
        title: path,
        subtitle: "Save bookmark to this folder",
        icon: faviconURL("chrome://favicon/"),
        lastVisitTime: dateAdded,
        category: "navigation",
        action: {
          id: PaletteCommandId.BOOKMARKS_SAVE_TO_FOLDER,
          payload: { parentId: id },
        },
      });
    }

    // Recursively process child folders
    if (children) {
      list.push(...traverseBookmarkFolders(children, path));
    }

    return list;
  });
};

/**
 * Get all bookmark folders dynamically
 */
const allBookmarkFoldersResource = createLazyResource<Command[]>([], async () => {
  const root = await requestQuery<chrome.bookmarks.BookmarkTreeNode[]>(
    PaletteQueryId.BOOKMARKS_TREE
  );
  return traverseBookmarkFolders(root);
});

/**
 * Static bookmark-this commands
 */
const staticBookmarkThisCommands: Command[] = [
  CommandBuilder.createFrontendCommand({
    title: "Bookmark This Tab",
    subtitle: "Save current tab to bookmarks",
    command: () => setInput(BOOKMARK_THIS_KEYWORD + ">"),
    keyword: BOOKMARK_THIS_KEYWORD + ">",
    category: "navigation",
    icon: faviconURL("chrome://favicon/"),
  }),
];

/**
 * Get bookmark-this commands based on search context
 */
export default function bookmarkThisCommands(): Command[] {
  const { isMatch, isCommand } = matchCommand(BOOKMARK_THIS_KEYWORD);

  // If keyword matches, show all folders to save into
  if (isMatch) return allBookmarkFoldersResource();

  // If typing the keyword, show nothing (autocomplete)
  if (isCommand) return [];

  // Default: show static bookmark-this command
  return staticBookmarkThisCommands;
}

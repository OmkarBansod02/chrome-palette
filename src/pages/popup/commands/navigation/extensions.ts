/**
 * Extensions commands - Manage Chrome extensions
 * Provides searchable access to all installed extensions
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { PaletteQueryId } from "@src/shared/paletteQueryIds";
import { CommandBuilder } from "../../utils/command-builder";
import { createLazyResource, matchCommand, setInput, setSearchMode } from "../../util/signals";
import { requestQuery } from "../../util/query";
import { faviconURL } from "../../Entry";

const EXTENSIONS_KEYWORD = "e";

/**
 * Get all installed extensions dynamically
 */
const allExtensionsResource = createLazyResource<Command[]>([], async () => {
  const extensions = await requestQuery<chrome.management.ExtensionInfo[]>(
    PaletteQueryId.EXTENSIONS_ALL
  );

  return extensions.map(({ name, icons, id, enabled, version, description }) => {
    // Get the largest icon URL
    const iconUrl = icons
      ?.map((icon) => icon?.url)
      .filter(Boolean)
      .at(-1) ?? "chrome://extensions/";

    return {
      title: `${name} (${version})`,
      subtitle: description || "Chrome extension",
      icon: iconUrl,
      category: "navigation" as const,
      url: `chrome://extensions/?id=${id}`,
      action: {
        id: PaletteCommandId.OPEN_URL,
        payload: { url: `chrome://extensions/?id=${id}` },
      },
      enabled,
    };
  });
});

/**
 * Static extensions commands
 */
const staticExtensionsCommands: Command[] = [
  CommandBuilder.createFrontendCommand({
    title: "Search Extensions",
    subtitle: "Find and manage installed extensions",
    command: () => {
      setInput("");
      setSearchMode("extensions");
    },
    keyword: EXTENSIONS_KEYWORD + ">",
    icon: faviconURL("chrome://extensions/"),
    category: "navigation",
  }),
];

/**
 * Get extensions commands based on search context
 */
export default function extensionsCommands(): Command[] {
  const { isMatch, isCommand } = matchCommand(EXTENSIONS_KEYWORD);

  // If keyword matches, show all extensions
  if (isMatch) return allExtensionsResource();

  // If typing the keyword, show nothing (autocomplete)
  if (isCommand) return [];

  // Default: show static extensions command
  return staticExtensionsCommands;
}

/**
 * Get all extensions for search mode
 */
export function getAllExtensions(): Command[] {
  return allExtensionsResource();
}

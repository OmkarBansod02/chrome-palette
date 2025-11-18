/**
 * Window commands - Window management
 * Commands for creating and managing browser windows
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { CommandBuilder } from "../../utils/command-builder";

/**
 * Window management commands
 */
export default function windowCommands(): Command[] {
  return [
    // New incognito window
    CommandBuilder.createCommand({
      title: "New Incognito Window",
      subtitle: "Open a new private browsing window",
      commandId: PaletteCommandId.WINDOWS_NEW_INCOGNITO,
      category: "core",
      shortcut: "?O~?? n",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236366f1'%3E%3Cpath fill-rule='evenodd' d='M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z' clip-rule='evenodd'/%3E%3Cpath d='M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z'/%3E%3C/svg%3E",
    }),

    // Close other tabs
    CommandBuilder.createCommand({
      title: "Close Other Tabs",
      subtitle: "Close all tabs except the current one",
      commandId: PaletteCommandId.TABS_CLOSE_OTHERS,
      category: "core",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23ef4444'%3E%3Cpath fill-rule='evenodd' d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z' clip-rule='evenodd'/%3E%3C/svg%3E",
    }),
  ];
}

/**
 * Quick action window commands (for featured section)
 */
export function quickWindowCommands(): Command[] {
  return [
    CommandBuilder.createCommand({
      title: "New Window",
      subtitle: "Open a new browser window",
      commandId: PaletteCommandId.WINDOWS_NEW,
      category: "quick",
      shortcut: "?O~ n",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2360a5fa'%3E%3Cpath d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z'/%3E%3C/svg%3E",
    }),
  ];
}

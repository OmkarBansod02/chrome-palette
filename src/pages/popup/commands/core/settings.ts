/**
 * Settings commands - Browser and extension settings
 * Quick access to Chrome settings and BrowserOS configuration
 */

import { Command } from "@src/shared/types/command";
import { CommandBuilder } from "../../utils/command-builder";

/**
 * Settings and configuration commands
 */
export default function settingsCommands(): Command[] {
  return [
    // Chrome Settings
    CommandBuilder.createUrlCommand({
      title: "Chrome Settings",
      subtitle: "Open Chrome browser settings",
      url: "chrome://settings",
      category: "core",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z' clip-rule='evenodd'/%3E%3C/svg%3E",
    }),

    // Extensions
    CommandBuilder.createUrlCommand({
      title: "Extensions",
      subtitle: "Manage Chrome extensions",
      url: "chrome://extensions",
      category: "core",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath d='M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z'/%3E%3C/svg%3E",
    }),

    // Downloads
    CommandBuilder.createUrlCommand({
      title: "Downloads",
      subtitle: "View downloaded files",
      url: "chrome://downloads",
      category: "core",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E",
    }),

    // History
    CommandBuilder.createUrlCommand({
      title: "Browser History",
      subtitle: "View browsing history",
      url: "chrome://history",
      category: "core",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clip-rule='evenodd'/%3E%3C/svg%3E",
    }),

    // BrowserOS Settings
    CommandBuilder.createUrlCommand({
      title: "BrowserOS Settings",
      subtitle: "Configure LLM providers and settings",
      url: "chrome-extension://djhdjhlnljbjgejbndockeedocneiaei/browseros-settings.html",
      category: "core",
      icon: chrome.runtime.getURL("assets/providers/browseros.svg"),
    }),
  ];
}

/**
 * Quick action settings commands (for featured section)
 */
export function quickSettingsCommands(): Command[] {
  return [
    CommandBuilder.createUrlCommand({
      title: "BrowserOS Settings",
      subtitle: "Configure LLM providers and settings",
      url: "chrome-extension://djhdjhlnljbjgejbndockeedocneiaei/browseros-settings.html",
      category: "quick",
      icon: chrome.runtime.getURL("assets/providers/browseros.svg"),
    }),
  ];
}

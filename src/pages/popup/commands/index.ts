/**
 * Centralized Command Registry
 * Single entry point for all command categories
 *
 * This file provides organized access to all commands in the system.
 * To add a new command:
 * 1. Create it in the appropriate category folder (core/navigation/providers)
 * 2. Import it here
 * 3. Add it to the appropriate section below
 */

import { Command } from "@src/shared/types/command";

// Core commands (tabs, windows, settings)
import tabCommands, { quickTabCommands } from "./core/tabs";
import windowCommands, { quickWindowCommands } from "./core/windows";
import settingsCommands, { quickSettingsCommands } from "./core/settings";

// Navigation commands (bookmarks, history, extensions)
import bookmarkCommands from "./navigation/bookmarks";
import historyCommands from "./navigation/history";
import bookmarkThisCommands from "./navigation/bookmark-this";
import extensionsCommands from "./navigation/extensions";

// Provider commands (LLM providers, agents)
import providerFeaturedCommands, {
  providerSearchCommands,
} from "./providers";
import featuredAgentCommands, {
  agentSearchCommands,
} from "./providers/agents";

/**
 * Quick action commands (featured at top)
 */
export function getQuickActionCommands(): Command[] {
  return [
    ...quickTabCommands(),
    ...quickWindowCommands(),
    ...quickSettingsCommands(),
  ];
}

/**
 * Core browser commands
 */
export function getCoreCommands(): Command[] {
  return [...tabCommands(), ...windowCommands(), ...settingsCommands()];
}

/**
 * Navigation commands
 */
export function getNavigationCommands(): Command[] {
  return [
    ...bookmarkCommands(),
    ...historyCommands(),
    ...bookmarkThisCommands(),
    ...extensionsCommands(),
  ];
}

/**
 * Provider commands (LLM and search)
 */
export function getProviderCommands(): Command[] {
  return [
    ...providerFeaturedCommands(),
    ...featuredAgentCommands(),
    ...providerSearchCommands(),
    ...agentSearchCommands(),
  ];
}

/**
 * Get ALL commands for the palette
 * This is the main function used by App.tsx
 */
export function getAllCommands(): Command[] {
  return [
    ...getQuickActionCommands(),
    ...getCoreCommands(),
    ...getNavigationCommands(),
    ...getProviderCommands(),
  ];
}

/**
 * Command categories organized for easy access
 */
export const COMMAND_REGISTRY = {
  quick: getQuickActionCommands,
  core: getCoreCommands,
  navigation: getNavigationCommands,
  providers: getProviderCommands,
  all: getAllCommands,
} as const;

/**
 * Re-export types for convenience
 */
export type { Command } from "@src/shared/types/command";
export { CommandBuilder } from "../utils/command-builder";

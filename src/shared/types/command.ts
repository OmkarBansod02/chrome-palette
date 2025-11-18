/**
 * Command types for Chrome Palette
 * Central type definitions for all commands in the system
 */

import { PaletteCommandId } from "../paletteCommandIds";

/**
 * Command categories for better organization
 */
export type CommandCategory =
  | "core"        // Core browser actions (tabs, windows)
  | "navigation"  // Navigation (bookmarks, history, extensions)
  | "provider"    // LLM providers and search engines
  | "agent"       // BrowserOS agents
  | "quick";      // Quick action commands

/**
 * Payload for command actions
 */
type CommandActionPayload = unknown | (() => unknown);

/**
 * Command action that can be executed
 */
export type CommandAction = {
  id: PaletteCommandId;
  payload?: CommandActionPayload;
};

/**
 * Main command interface
 */
export type Command = {
  /** Display title of the command */
  title: string;

  /** Optional subtitle/description */
  subtitle?: string;

  /** Keyboard shortcut (if any) */
  shortcut?: string;

  /** Last time this command was used */
  lastVisitTime?: number;

  /** Search keyword */
  keyword?: string;

  /** Icon as SVG data URL or path */
  icon?: string;

  /** Background action to execute */
  action?: CommandAction;

  /** Frontend command function */
  command?: () => unknown;

  /** URL to open (alternative to action) */
  url?: string;

  /** Category for organization */
  category?: CommandCategory;

  /** Priority for sorting (higher = more important) */
  priority?: number;

  /** Tags for better search */
  tags?: string[];
};

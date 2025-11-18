/**
 * Command Builder Utility
 * Makes it easy to create commands with consistent patterns
 */

import { Command, CommandAction } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { ProviderDefinition } from "@src/shared/types/provider";

/**
 * Create a background action
 */
export const backgroundAction = (
  id: PaletteCommandId,
  payload?: CommandAction["payload"]
): CommandAction => ({
  id,
  payload,
});

/**
 * Create an action to open a URL
 */
export const openUrlAction = (url: string): CommandAction =>
  backgroundAction(PaletteCommandId.OPEN_URL, { url });

/**
 * CommandBuilder - Fluent API for building commands
 */
export class CommandBuilder {
  /**
   * Create a basic command that executes a background action
   */
  static createCommand(config: {
    title: string;
    subtitle?: string;
    icon?: string;
    commandId: PaletteCommandId;
    payload?: CommandAction["payload"];
    category?: Command["category"];
    shortcut?: string;
  }): Command {
    return {
      title: config.title,
      subtitle: config.subtitle,
      icon: config.icon,
      shortcut: config.shortcut,
      category: config.category,
      action: backgroundAction(config.commandId, config.payload),
    };
  }

  /**
   * Create a URL-based command
   */
  static createUrlCommand(config: {
    title: string;
    subtitle?: string;
    icon?: string;
    url: string;
    category?: Command["category"];
  }): Command {
    return {
      title: config.title,
      subtitle: config.subtitle,
      icon: config.icon,
      category: config.category,
      url: config.url,
      action: openUrlAction(config.url),
    };
  }

  /**
   * Create a command from a provider definition
   */
  static createProviderCommand(
    provider: ProviderDefinition,
    query?: string
  ): Command {
    const url = query && provider.urlPattern
      ? provider.urlPattern.replace("%s", encodeURIComponent(query))
      : provider.urlPattern || "#";

    return {
      title: provider.name,
      subtitle: provider.description,
      icon: provider.iconPath ? `assets/${provider.iconPath}` : undefined,
      category: "provider",
      url,
      action: openUrlAction(url),
    };
  }

  /**
   * Create a frontend command (executes in popup)
   */
  static createFrontendCommand(config: {
    title: string;
    subtitle?: string;
    icon?: string;
    command: () => unknown;
    category?: Command["category"];
  }): Command {
    return {
      title: config.title,
      subtitle: config.subtitle,
      icon: config.icon,
      category: config.category,
      command: config.command,
    };
  }
}

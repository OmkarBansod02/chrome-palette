/**
 * Provider commands - LLM and search providers
 * Commands for ChatGPT, Claude, Google, Gemini, etc.
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import {
  PROVIDERS,
  ProviderDefinition,
  getFeaturedProviders,
} from "@src/shared/providers";
import { faviconURL } from "../../Entry";
import { parsedInput } from "../../util/signals";

/**
 * Resolve the icon for a provider
 */
const resolveProviderIcon = (provider: ProviderDefinition): string | undefined => {
  if (provider.iconPath) {
    return chrome.runtime.getURL(provider.iconPath);
  }
  if (provider.iconUrl) {
    return provider.iconUrl;
  }
  if (provider.urlPattern) {
    const base = provider.urlPattern.replace("%s", "");
    return faviconURL(base);
  }
  return undefined;
};

/**
 * Build a command from a provider definition
 */
const buildProviderCommand = (provider: ProviderDefinition): Command => {
  return {
    title: provider.name,
    subtitle: provider.description,
    icon: resolveProviderIcon(provider),
    keyword: provider.category,
    category: "provider",
    action: {
      id: PaletteCommandId.PROVIDERS_EXECUTE,
      payload: () => ({
        providerId: provider.id,
        query: parsedInput().query.trim(),
      }),
    },
  };
};

const FEATURED_PROVIDER_IDS_SET = new Set(["chatgpt", "claude", "google"]);

/**
 * Get all provider search commands (excluding featured ones to avoid duplicates)
 */
export function providerSearchCommands(): Command[] {
  return PROVIDERS
    .filter((provider) => !FEATURED_PROVIDER_IDS_SET.has(provider.id))
    .map(buildProviderCommand);
}

/**
 * Get featured provider commands (ChatGPT, Claude, Google)
 */
export default function providerFeaturedCommands(): Command[] {
  return getFeaturedProviders().map(buildProviderCommand);
}

/**
 * Provider types for LLM and search providers
 * Used for ChatGPT, Claude, Gemini, etc.
 */

/**
 * Provider category
 */
export type ProviderCategory = "llm" | "search";

/**
 * How the provider should be opened
 */
export type ProviderActionType = "url" | "sidepanel";

/**
 * Provider definition
 */
export type ProviderDefinition = {
  /** Unique identifier for the provider */
  id: string;

  /** Display name */
  name: string;

  /** Description of what the provider does */
  description: string;

  /** Category (LLM or search) */
  category: ProviderCategory;

  /** How to open the provider */
  actionType: ProviderActionType;

  /** URL pattern with %s for search query */
  urlPattern?: string;

  /** Where to open the URL */
  openIn?: "newTab" | "current";

  /** Path to icon in assets folder */
  iconPath?: string;

  /** External icon URL */
  iconUrl?: string;
};

/**
 * Provider definitions and registry
 * Centralized list of all LLM and search providers
 */

export type {
  ProviderCategory,
  ProviderActionType,
  ProviderDefinition,
} from "./types/provider";

const FEATURED_PROVIDER_IDS = [
  "chatgpt",
  "claude",
  "google",
] as const;

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Open ChatGPT in a new tab",
    category: "llm",
    actionType: "url",
    urlPattern: "https://chatgpt.com/?q=%s",
    openIn: "newTab",
    iconPath: "assets/providers/openai.svg",
  },
  {
    id: "claude",
    name: "Claude",
    description: "Launch Claude and start chatting",
    category: "llm",
    actionType: "url",
    urlPattern: "https://claude.ai/new",
    openIn: "newTab",
    iconPath: "assets/providers/claude.svg",
  },
  {
    id: "google",
    name: "Google",
    description: "Search Google in a new tab",
    category: "search",
    actionType: "url",
    urlPattern: "https://www.google.com/search?q=%s",
    openIn: "newTab",
    iconPath: "assets/providers/google.svg",
  },
  {
    id: "duckduckgo-ai",
    name: "DuckDuckGo AI",
    description: "Open DuckDuckGo AI chat",
    category: "llm",
    actionType: "url",
    urlPattern: "https://duck.ai",
    openIn: "newTab",
    iconUrl: "https://duckduckgo.com/favicon.ico",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "Research with Perplexity AI",
    category: "llm",
    actionType: "url",
    urlPattern: "https://www.perplexity.ai/search/?q=%s",
    openIn: "newTab",
    iconPath: "assets/providers/perplexity.svg",
  },
  {
    id: "deepseek",
    name: "Deepseek",
    description: "Open Deepseek chat",
    category: "llm",
    actionType: "url",
    urlPattern: "https://chat.deepseek.com/",
    openIn: "newTab",
    iconPath: "assets/providers/deepseek-96.svg",
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Launch Google Gemini",
    category: "llm",
    actionType: "url",
    urlPattern: "https://gemini.google.com/app",
    openIn: "newTab",
    iconUrl: "https://www.google.com/s2/favicons?domain=gemini.google.com",
  },
];

export const getProviderById = (id: string): ProviderDefinition | undefined =>
  PROVIDERS.find((provider) => provider.id === id);

export const getFeaturedProviders = (): ProviderDefinition[] =>
  FEATURED_PROVIDER_IDS.map((id) => getProviderById(id)).filter(
    (provider): provider is ProviderDefinition => Boolean(provider)
  );

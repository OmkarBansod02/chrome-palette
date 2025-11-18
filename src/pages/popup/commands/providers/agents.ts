/**
 * Agent commands - BrowserOS agents
 * Provides access to saved BrowserOS agents
 */

import { Command } from "@src/shared/types/command";
import { PaletteCommandId } from "@src/shared/paletteCommandIds";
import { createSignal } from "solid-js";
import { parsedInput } from "../../util/signals";

const MAX_FEATURED_AGENTS = 4;
const STORAGE_KEY = "agents";

/**
 * Stored agent structure
 */
type StoredAgent = {
  id: string;
  name: string;
  description?: string;
  goal: string;
  steps?: string[];
  isPinned?: boolean;
  lastUsed?: number | null;
  updatedAt?: number;
};

/**
 * Reactive signal for agents
 */
const [agents, setAgents] = createSignal<StoredAgent[]>([]);

/**
 * Type guard and normalizer for agents
 */
const normalizeAgents = (maybeAgents: unknown): StoredAgent[] => {
  if (!Array.isArray(maybeAgents)) return [];

  return maybeAgents.filter(
    (agent): agent is StoredAgent =>
      typeof agent === "object" &&
      agent !== null &&
      typeof (agent as StoredAgent).id === "string" &&
      typeof (agent as StoredAgent).name === "string" &&
      typeof (agent as StoredAgent).goal === "string"
  );
};

/**
 * Fetch agents from chrome storage
 */
const fetchAgentsFromStorage = () => {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    setAgents(normalizeAgents(result?.[STORAGE_KEY]));
  });
};

// Initialize agents from storage
fetchAgentsFromStorage();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && STORAGE_KEY in changes) {
    fetchAgentsFromStorage();
  }
});

/**
 * Compare agents for sorting (pinned first, then by last used)
 */
const compareAgents = (a: StoredAgent, b: StoredAgent): number => {
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;

  const aTime = a.lastUsed ?? a.updatedAt ?? 0;
  const bTime = b.lastUsed ?? b.updatedAt ?? 0;
  return bTime - aTime;
};

/**
 * Convert agent to command
 */
const convertAgentToCommand = (agent: StoredAgent): Command => ({
  title: agent.name,
  subtitle: agent.description || agent.goal,
  icon: chrome.runtime.getURL("assets/providers/browseros.svg"),
  keyword: "agent",
  category: "agent",
  action: {
    id: PaletteCommandId.AGENTS_EXECUTE,
    payload: () => ({
      agent: {
        id: agent.id,
        name: agent.name,
        goal: agent.goal,
        steps: agent.steps ?? [],
      },
      query: parsedInput().query.trim(),
    }),
  },
});

/**
 * Get all agent search commands
 */
export function agentSearchCommands(): Command[] {
  return [...agents()].sort(compareAgents).map(convertAgentToCommand);
}

/**
 * Get featured agent commands (top 4, pinned first)
 */
export default function featuredAgentCommands(): Command[] {
  const list = [...agents()].sort(compareAgents).slice(0, MAX_FEATURED_AGENTS);
  return list.map(convertAgentToCommand);
}

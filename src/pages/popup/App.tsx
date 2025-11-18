import "./App.scss";

import fuzzysort from "fuzzysort";
import InfiniteScroll from "solid-infinite-scroll";
import {
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onMount,
} from "solid-js";
import { tinykeys } from "tinykeys";

import Entry from "./Entry";
import Shortcut from "./Shortcut";

// Theme detection - set dark theme by default
const getOsTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light";
const [osTheme, setOsTheme] = createSignal(getOsTheme());

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function () {
    setOsTheme(getOsTheme());
  });

// Apply theme to body
createEffect(() => {
  document.body.setAttribute("theme", osTheme());
});
// New centralized command registry
import { getAllCommands, Command } from "./commands";
import { CommandAction } from "@src/shared/types/command";
import { sortByUsed, storeLastUsed } from "./util/last-used";
import { createStoredSignal, inputSignal, parsedInput, searchMode, setSearchMode } from "./util/signals";
import { getAllTabs } from "./commands/core/tabs";
import { getAllBookmarks } from "./commands/navigation/bookmarks";
import { getAllHistory } from "./commands/navigation/history";
import { getAllExtensions } from "./commands/navigation/extensions";

type CommandListener = (command: Command) => void;

let commandExecutedListener: CommandListener | undefined;

export const setCommandExecutedListener = (listener?: CommandListener) => {
  commandExecutedListener = listener;
};

const MAIN_COMMAND_NAME = "toggle-palette";

const [shortcut, setShortcut] = createStoredSignal(MAIN_COMMAND_NAME, "?");

chrome.commands.getAll().then((commands) => {
  const mainCommand = commands.find(({ name }) => name === MAIN_COMMAND_NAME);
  if (mainCommand?.shortcut) setShortcut(mainCommand.shortcut);
  else setShortcut("?");
});

const [inputValue, setInputValue] = inputSignal;

/**
 * Get featured commands (shown when no search query)
 * Quick actions + featured providers + agents
 */
const featuredCommands = createMemo(() => {
  const all = getAllCommands();
  // Filter to show quick actions and featured items
  return all.filter(
    (cmd) =>
      cmd.category === "quick" ||
      cmd.category === "provider" ||
      cmd.category === "agent"
  );
});

/**
 * Get all searchable commands with deduplication and sorting
 */
const searchableCommands = createMemo(() => {
  const commands = getAllCommands();

  // Deduplicate by title
  const seen = new Set<string>();
  const deduped = commands.filter((command) => {
    if (seen.has(command.title)) return false;
    seen.add(command.title);
    return true;
  });

  // Sort by usage frequency
  sortByUsed(deduped);
  return deduped;
});

const commandsLimit = 75;

const [scrollIndex, setScrollIndex] = createSignal(commandsLimit);

const MESSAGE_RUN_COMMAND = "palette:run";

const runBackgroundCommand = async (action: CommandAction) => {
  return new Promise<void>((resolve, reject) => {
    const payload =
      typeof action.payload === "function"
        ? (action.payload as () => unknown)()
        : action.payload;

    chrome.runtime.sendMessage(
      {
        type: MESSAGE_RUN_COMMAND,
        id: action.id,
        payload,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.ok) {
          resolve();
        } else {
          const error = response?.error ?? "Palette command failed to execute.";
          reject(new Error(error));
        }
      }
    );
  });
};

const hasQuery = createMemo(() => Boolean(parsedInput().query.trim()));

const matches = createMemo(() => {
  if (!hasQuery()) {
    return [] as Fuzzysort.KeysResult<Command>[];
  }
  return fuzzysort.go(parsedInput().query, searchableCommands(), {
    threshold: -10000,
    limit: scrollIndex(),
    all: true,
    keys: ["title", "subtitle", "url"],
  });
});

/**
 * Filtered commands - determines which commands to display based on:
 * 1. Active search mode (tabs, bookmarks, history, extensions)
 * 2. Keyword commands (t>, b>, h>, e>)
 * 3. User search query
 * 4. Default featured commands
 */
const filteredCommands = createMemo(() => {
  const mode = searchMode();
  const parsed = parsedInput();
  const query = inputValue().trim();

  // Priority 1: Keyword commands (e.g., "t>", "b>")
  if (parsed.isCommand && !parsed.query.trim()) {
    return searchableCommands();
  }

  // Priority 2: Active search mode
  if (mode) {
    // If user starts typing, exit mode and search all commands
    if (query) {
      setSearchMode(null);
      // Fall through to search
    } else {
      // Show mode-specific items
      switch (mode) {
        case "tabs":
          return getAllTabs();
        case "bookmarks":
          return getAllBookmarks();
        case "history":
          return getAllHistory();
        case "extensions":
          return getAllExtensions();
        default:
          return featuredCommands();
      }
    }
  }

  // Priority 3: Search query
  if (hasQuery()) {
    return matches().map((match) => match.obj);
  }

  // Priority 4: Default featured commands
  return featuredCommands();
});

const [selectedI_internal, setSelectedI] = createSignal(0);

const selectedI = createMemo(() => {
  const n = filteredCommands().length;
  return ((selectedI_internal() % n) + n) % n;
});

createEffect(() => {
  inputValue();
  setSelectedI(0);
});

export const runCommand = async (command: Command) => {
  try {
    storeLastUsed(command);

    if (command.action) {
      await runBackgroundCommand(command.action);
      // Clear search mode when executing non-frontend commands
      setSearchMode(null);
    } else if ("url" in command && command.url) {
      await chrome.tabs.create({ url: command.url });
      // Clear search mode when opening URLs
      setSearchMode(null);
    } else if (command.command) {
      await command.command();
      // Don't clear search mode - frontend commands may set it
    }

    commandExecutedListener?.(command);
  } catch (error) {
    console.error("[Palette] Error executing command:", error);
    throw error;
  }
};

tinykeys(window, {
  ArrowUp: (e) => {
    e.preventDefault();
    setSelectedI((i) => i - 1);
  },
  ArrowDown: (e) => {
    e.preventDefault();
    setSelectedI((i) => i + 1);
  },
  Enter: (e) => {
    e.preventDefault();
    const selected = filteredCommands()[selectedI()];
    runCommand(selected);
  },
});

const PinWarning = () => {
  const [userSettings] = createResource(() => chrome.action.getUserSettings());
  const isNotPinned = createMemo(
    () => userSettings() && userSettings()?.isOnToolbar === false
  );
  return (
    <Show when={isNotPinned()}>
      <div style={{ color: "red", padding: "10px" }}>
        Pin the extension to the toolbar for faster load
      </div>
    </Show>
  );
};
type AppProps = {
  onRequestClose?: () => void;
  closeOnBlur?: boolean;
  showPinWarning?: boolean;
};

const App = (props: AppProps = {}) => {
  let inputRef: HTMLInputElement | undefined;

  const shouldCloseOnBlur = props.closeOnBlur ?? true;
  const requestClose =
    props.onRequestClose ??
    (() => {
      window.close();
    });

  onMount(() => {
    // Focus the input immediately when palette opens
    setTimeout(() => {
      inputRef?.focus();
    }, 0);
  });

  createEffect(() => {
    inputValue();
    setScrollIndex(commandsLimit);
  });
  return (
    <>
      <div
        class="App"
        onBlur={(e) => {
          if (shouldCloseOnBlur) {
            requestClose();
          }
        }}
      >
        <div class="input_wrap">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <input
            ref={inputRef}
            class="input"
            autofocus
            placeholder="Search..."
            value={inputValue()}
            onInput={(e) => {
              setInputValue(e.target.value);
              setSelectedI(0);
            }}
          />
        </div>
        <ul class="list">
          <InfiniteScroll
            loadingMessage={<></>}
            each={filteredCommands()}
            hasMore={true}
            next={() => setScrollIndex(scrollIndex() * 2)}
          >
            {(command, i) => {
              const isSelected = createMemo(() => i() === selectedI());
              const keyResults = hasQuery() ? matches()[i()] : undefined;
              return (
                <Entry
                  isSelected={isSelected()}
                  keyResults={keyResults}
                  command={command}
                />
              );
            }}
          </InfiniteScroll>
        </ul>
      </div>
      {props.showPinWarning !== false && <PinWarning />}
    </>
  );
};

export default App;

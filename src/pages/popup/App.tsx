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
import { createStoredSignal, inputSignal, parsedInput } from "./util/signals";

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
    console.log("[Palette] Sending background command:", {
      type: MESSAGE_RUN_COMMAND,
      id: action.id,
      payload,
    });
    chrome.runtime.sendMessage(
      {
        type: MESSAGE_RUN_COMMAND,
        id: action.id,
        payload,
      },
      (response) => {
        console.log("[Palette] Background command response:", response);
        if (chrome.runtime.lastError) {
          console.error("[Palette] Background command error:", chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.ok) {
          resolve();
        } else {
          const error = response?.error ?? "Palette command failed to execute.";
          console.error("[Palette] Command execution failed:", error);
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

const filteredCommands = createMemo(() => {
  if (!hasQuery()) {
    return featuredCommands();
  }
  return matches().map((match) => match.obj);
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
  console.log("[Palette] Running command:", command.title, command);
  try {
    storeLastUsed(command);
    if (command.action) {
      console.log("[Palette] Executing action:", command.action);
      await runBackgroundCommand(command.action);
    } else if ("url" in command && command.url) {
      console.log("[Palette] Opening URL:", command.url);
      await chrome.tabs.create({ url: command.url });
    } else if (command.command) {
      console.log("[Palette] Executing command function");
      await command.command();
    } else {
      console.warn("[Palette] No action, url, or command found for:", command);
    }
    commandExecutedListener?.(command);
    console.log("[Palette] Command executed successfully");
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

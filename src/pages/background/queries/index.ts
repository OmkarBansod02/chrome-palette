import { PaletteQueryId } from "@src/shared/paletteQueryIds";

import { registerQuery } from "./registry";

type HistoryQueryPayload = {
  maxResults?: number;
};

registerQuery(PaletteQueryId.TABS_ALL, () => chrome.tabs.query({}));

registerQuery(PaletteQueryId.TABS_AUDIBLE, () =>
  chrome.tabs.query({ audible: true })
);

registerQuery(PaletteQueryId.BOOKMARKS_TREE, () => chrome.bookmarks.getTree());

registerQuery(PaletteQueryId.EXTENSIONS_ALL, () => chrome.management.getAll());

registerQuery(
  PaletteQueryId.HISTORY_RECENT,
  async ({ maxResults = 5000 }: HistoryQueryPayload = {}) => {
    return await chrome.history.search({
      text: "",
      startTime: 0,
      maxResults,
    });
  }
);

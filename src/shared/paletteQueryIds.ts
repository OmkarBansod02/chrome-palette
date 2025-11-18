export const PaletteQueryId = {
  TABS_ALL: "tabs:all",
  TABS_AUDIBLE: "tabs:audible",
  BOOKMARKS_TREE: "bookmarks:tree",
  EXTENSIONS_ALL: "extensions:all",
  HISTORY_RECENT: "history:recent",
} as const;

export type PaletteQueryId =
  (typeof PaletteQueryId)[keyof typeof PaletteQueryId];

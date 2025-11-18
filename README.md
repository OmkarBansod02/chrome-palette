

<h1>BrowserOS Command Palette<br/>Fast, Universal, AI-Powered</h1>

![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)

> Keyboard-first command palette for Chrome with BrowserOS integration. Works everywhere, including chrome:// pages.

</div>

## ✨ Features

- 🚀 **Universal Access** - Works on every page, including chrome:// URLs via BrowserOS overlay
- ⚡ **Lightning Fast** - 41.72 kB bundle, optimized for performance
- 🎯 **Smart Search** - Fuzzy search with commands sorted by usage
- 🤖 **AI Integration** - Direct access to ChatGPT, Claude, Perplexity, Deepseek, Gemini
- 🎨 **Crystal Dark Theme** - Beautiful, accessible dark mode UI
- ⌨️ **Keyboard First** - Navigate everything with keyboard shortcuts
- 📦 **Zero Dependencies** - No server, no ads, no telemetry

## 🚀 Installation

### For BrowserOS Users

The command palette is integrated with BrowserOS. Use **Ctrl+B** (Windows/Linux) or **Cmd+B** (Mac) to open it from any page.

### Manual Installation

1. Clone this repository
```bash
git clone <your-repo-url>
cd chrome-palette
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

4. Load in Chrome
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 📖 Usage

### Opening the Palette

- **Keyboard Shortcut**: `Ctrl+B` (Windows/Linux) or `Cmd+B` (Mac)
- **Toolbar Icon**: Click the BrowserOS Palette icon in your Chrome toolbar
- **Works Everywhere**: Including chrome:// pages, settings, and extensions

### Navigating Commands

- **Type to search** - Fuzzy search filters commands instantly
- **Arrow keys** - Navigate up/down through results
- **Enter** - Execute selected command
- **Escape** - Close the palette

### Search Sub-commands

Type special prefixes to search within categories:

- `t>` - Search and switch between open tabs
- Type any text - Search bookmarks, history, and extensions

## 📋 Available Commands

### Quick Actions
- **New Tab** - Open a new browser tab
- **New Window** - Open a new browser window

### Tab Management
- **Search Tabs** - Search and switch between all open tabs
- **Close Tab** - Close the current tab
- **Duplicate Tab** - Create a copy of the current tab
- **Reopen Closed Tab** - Restore the last closed tab

### Window Management
- **New Incognito Window** - Open a private browsing window
- **Close Other Tabs** - Close all tabs except the current one

### Browser Settings
- **Chrome Settings** - Open Chrome browser settings
- **Extensions** - Manage Chrome extensions
- **Downloads** - View downloaded files
- **Browser History** - View browsing history
- **BrowserOS Settings** - Configure LLM providers and BrowserOS settings

### Navigation
- **Bookmarks** - Search and open bookmarks
- **Save Bookmark** - Save current page to bookmarks (with folder selection)
- **Browse History** - Search browsing history
- **Manage Extensions** - View and manage installed extensions

### AI & Search Providers
- **ChatGPT** - Open ChatGPT with optional query
- **Claude** - Launch Claude AI chat
- **Google** - Search Google
- **Perplexity** - Research with Perplexity AI
- **Deepseek** - Open Deepseek chat
- **Gemini** - Launch Google Gemini
- **DuckDuckGo AI** - Open DuckDuckGo AI chat

### BrowserOS Agents
- Execute custom BrowserOS agents directly from the palette
- Agents are dynamically loaded from your BrowserOS configuration

## 🏗️ Architecture

### BrowserOS Overlay System

The command palette uses BrowserOS's universal injection system:

- **Overlay Page**: `src/pages/overlay/index.html` - Injected as a centered iframe
- **Loader Script**: `public/browseros-loader.js` - Handles mounting/unmounting and event forwarding
- **Background Worker**: Listens for keyboard shortcuts and toolbar clicks
- **Universal Access**: Works on all pages via `chrome.browserOS.executeJavaScript`

### Command System

Commands are organized by category for extensibility:

```
src/pages/popup/commands/
├── index.ts              # Centralized command registry
├── core/                 # Core browser operations (tabs, windows, settings)
├── navigation/           # Navigation (bookmarks, history, extensions)
└── providers/            # LLM providers and BrowserOS agents
```

### Type System

Shared TypeScript types ensure consistency:

```
src/shared/
├── types/
│   ├── command.ts       # Command interface and categories
│   └── provider.ts      # Provider definitions
├── providers.ts         # Provider registry
├── paletteCommandIds.ts # Command ID enum
└── paletteQueryIds.ts   # Query ID enum
```

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Development Mode

```bash
# Install dependencies
npm install

# Start development server (hot reload enabled)
npm start
```

The `dist` folder will be auto-rebuilt on file changes. Load it as an unpacked extension in Chrome.

### Build for Production

```bash
npm run build
```

### Project Structure

```
chrome-palette/
├── src/
│   ├── pages/
│   │   ├── background/      # Background service worker
│   │   ├── overlay/         # BrowserOS overlay UI
│   │   └── popup/           # Command palette UI
│   └── shared/              # Shared types and utilities
├── public/
│   ├── assets/              # Icons and static files
│   └── browseros-loader.js  # Injection script
└── dist/                    # Build output
```

## 📊 Performance

| Metric | Value |
|--------|-------|
| Bundle Size | 41.72 kB |
| Compressed | 16.10 kB |
| Framework | SolidJS |
| Bundler | Vite |
| Manifest | V3 |

## 🔧 Tech Stack

- **Framework**: SolidJS (reactive, performant)
- **Language**: TypeScript (strict mode)
- **Bundler**: Vite (fast builds, hot reload)
- **Styling**: SCSS (modular, scoped styles)
- **Search**: Fuzzysort (fuzzy search library)
- **Chrome API**: Manifest V3

## 📝 Version History

| Version | Framework | Bundler | Manifest | Size | Compressed | Notes |
|---------|-----------|---------|----------|------|------------|-------|
| **v3.0.0 (2025)** | SolidJS | Vite | V3 | 41.72kb | 16.10kb | BrowserOS integration, modular architecture |
| v2.0.0 (2024) | SolidJS | Vite | V3 | 79kb | 38kb | SolidJS rewrite |
| v1.2.1 (2022) | Preact | ESBuild | V2 | 180kb | 60kb | Preact migration |
| v1.0.0 (2021) | React | Webpack | V2 | 287kb | 93kb | Initial release |

## 🤝 Contributing

This is a fork maintained for BrowserOS integration. For the original project, see [chrome-palette](https://github.com/dbuezas/chrome-palette).

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

Original work Copyright (c) 2023 David Buezas

## 🙏 Credits

- Original Chrome Palette by [David Buezas](https://github.com/dbuezas)
- BrowserOS integration and architecture refactor by the BrowserOS team


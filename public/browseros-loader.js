(function () {
  const CONFIG_KEY = "__BROWSEROS_PALETTE_CONFIG__";
  const OVERLAY_ID = "__browseros_palette_overlay__";
  const GLOBAL_KEY = "__browserosPalette";
  const MESSAGE_SOURCE = "browseros-palette";
  const MESSAGE_TYPE_CLOSE = "close";

  const state = {
    iframe: null,
    cleanup: [],
  };

  const getConfig = () => {
    return window[CONFIG_KEY];
  };

  const withConfig = (callback) => {
    const config = getConfig();
    if (!config) {
      console.warn("[BrowserOS Palette] Missing configuration.");
      return;
    }
    callback(config);
  };

  const removeOverlay = () => {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      existing.remove();
    }
    state.iframe = null;
    while (state.cleanup.length) {
      const cleanup = state.cleanup.pop();
      try {
        cleanup && cleanup();
      } catch (error) {
        console.warn("[BrowserOS Palette] Cleanup failed.", error);
      }
    }
  };

  const handleCloseRequest = () => {
    removeOverlay();
  };

  const createOverlay = () => {
    withConfig((config) => {
      if (document.getElementById(OVERLAY_ID)) {
        return;
      }

      const style = document.createElement("style");
      style.textContent = `
        @keyframes browseros-palette-fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes browseros-palette-fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.98);
          }
        }
      `;
      document.head.appendChild(style);

      const overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      overlay.style.position = "fixed";
      overlay.style.inset = "0px";
      overlay.style.zIndex = "2147483647";
      overlay.style.background = "rgba(0, 0, 0, 0.3)";
      overlay.style.backdropFilter = "blur(4px)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.padding = "32px";
      overlay.style.boxSizing = "border-box";
      overlay.style.animation = "browseros-palette-fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)";

      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          handleCloseRequest();
        }
      });

      const frameWrapper = document.createElement("div");
      frameWrapper.style.width = "min(720px, calc(100vw - 64px))";
      frameWrapper.style.maxWidth = "100%";
      frameWrapper.style.height = "min(300px, calc(100vh - 128px))";
      frameWrapper.style.maxHeight = "100%";
      frameWrapper.style.borderRadius = "8px";
      frameWrapper.style.boxShadow =
        "0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 16px rgba(0, 0, 0, 0.3), 0 32px 80px rgba(0, 0, 0, 0.5)";
      frameWrapper.style.overflow = "hidden";
      frameWrapper.style.background = "transparent";

      const iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.style.background = "transparent";
      iframe.allow = "clipboard-read; clipboard-write";
      iframe.src = config.frameSrc;
      state.iframe = iframe;

      frameWrapper.appendChild(iframe);
      overlay.appendChild(frameWrapper);

      const handleMessage = (event) => {
        if (!event.data || event.data.source !== MESSAGE_SOURCE) return;
        if (event.origin !== config.extensionOrigin) return;
        if (event.data.type === MESSAGE_TYPE_CLOSE) {
          handleCloseRequest();
        }
      };
      window.addEventListener("message", handleMessage);
      state.cleanup.push(() =>
        window.removeEventListener("message", handleMessage)
      );

      const handleEscape = (event) => {
        if (event.key === "Escape" && document.getElementById(OVERLAY_ID)) {
          event.preventDefault();
          event.stopPropagation();
          handleCloseRequest();
        }
      };
      window.addEventListener("keydown", handleEscape, true);
      state.cleanup.push(() =>
        window.removeEventListener("keydown", handleEscape, true)
      );

      document.documentElement.appendChild(overlay);
      iframe.addEventListener("load", () => {
        // Focus the iframe and its content
        iframe.contentWindow?.focus();
        // Give iframe content time to mount and focus input
        setTimeout(() => {
          iframe.contentWindow?.focus();
        }, 50);
      });
    });
  };

  const ensureGlobal = () => {
    if (window[GLOBAL_KEY]) {
      return window[GLOBAL_KEY];
    }
    const api = {
      open: () => {
        createOverlay();
      },
      close: () => {
        handleCloseRequest();
      },
      toggle: () => {
        if (document.getElementById(OVERLAY_ID)) {
          handleCloseRequest();
        } else {
          createOverlay();
        }
      },
    };
    window[GLOBAL_KEY] = api;
    return api;
  };

  const api = ensureGlobal();

  // Global keyboard shortcut listener (Ctrl+B / Cmd+B)
  const handleGlobalKeydown = (event) => {
    // Check for Ctrl+B (Windows/Linux/ChromeOS) or Cmd+B (Mac)
    const isCtrlB = (event.ctrlKey || event.metaKey) && event.key === 'b' && !event.shiftKey && !event.altKey;

    if (isCtrlB) {
      event.preventDefault();
      event.stopPropagation();
      api.toggle();
    }
  };

  // Add keyboard listener with capture phase to intercept before Chrome
  window.addEventListener('keydown', handleGlobalKeydown, true);

  // Only auto-open if explicitly requested
  const shouldOpen = window["__BROWSEROS_PALETTE_SHOULD_OPEN__"];
  if (shouldOpen && !document.getElementById(OVERLAY_ID)) {
    api.open();
  }
})();

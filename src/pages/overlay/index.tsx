import "../popup/index.scss";

import { render } from "solid-js/web";

import App, { setCommandExecutedListener } from "../popup/App";

const MESSAGE_SOURCE = "browseros-palette";
const MESSAGE_TYPE_CLOSE = "close";

const postCloseMessage = () => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        source: MESSAGE_SOURCE,
        type: MESSAGE_TYPE_CLOSE,
      },
      "*"
    );
  }
};

const appContainer = document.querySelector("#app-container");
if (!appContainer) {
  throw new Error("Can not find AppContainer");
}

setCommandExecutedListener((command) => {
  // Don't close palette for frontend commands that just change the input
  // (like "Search Tabs", "Search Bookmarks", etc.)
  // Only close for commands that actually do something (URLs, actions)
  if (command.command) {
    // This is a frontend command (setInput), keep palette open
    return;
  }
  // For all other commands (URLs, background actions), close the palette
  postCloseMessage();
});

window.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      postCloseMessage();
    }
  },
  { capture: true }
);

render(
  () => (
    <App
      onRequestClose={postCloseMessage}
      closeOnBlur={false}
      showPinWarning={false}
    />
  ),
  appContainer
);

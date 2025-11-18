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

setCommandExecutedListener(() => {
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

import Chrome from "chrome";

declare namespace chrome {
  export default Chrome;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const content: string;
  export default content;
}

declare module "*?raw" {
  const content: string;
  export default content;
}

declare namespace chrome {
  namespace browserOS {
    function executeJavaScript(
      tabId: number,
      code: string,
      callback?: (result: unknown) => void
    ): void;
  }
}

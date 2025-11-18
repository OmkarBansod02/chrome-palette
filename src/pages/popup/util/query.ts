import { PaletteQueryId } from "@src/shared/paletteQueryIds";

const MESSAGE_QUERY = "palette:query";

export const requestQuery = async <TResult>(
  id: PaletteQueryId,
  payload?: unknown
): Promise<TResult> => {
  return new Promise<TResult>((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: MESSAGE_QUERY,
        id,
        payload,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.ok) {
          resolve(response.result as TResult);
        } else {
          reject(
            new Error(response?.error ?? "Palette query failed to execute.")
          );
        }
      }
    );
  });
};

type QueryHandler<TPayload = unknown, TResult = unknown> = (
  payload?: TPayload
) => Promise<TResult> | TResult;

type QueryRecord = {
  handler: QueryHandler;
};

const registry = new Map<string, QueryRecord>();

export const registerQuery = (
  id: string,
  handler: QueryHandler
): void => {
  if (registry.has(id)) {
    console.warn(`[palette] Query "${id}" is already registered. Overwriting.`);
  }
  registry.set(id, { handler });
};

export const runRegisteredQuery = async (
  id: string,
  payload?: unknown
): Promise<unknown> => {
  const record = registry.get(id);
  if (!record) {
    throw new Error(`Query "${id}" is not registered.`);
  }
  return await record.handler(payload);
};

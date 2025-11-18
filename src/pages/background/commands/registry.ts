type CommandHandler<TPayload = unknown> = (
  payload?: TPayload
) => Promise<void> | void;

type CommandRecord = {
  handler: CommandHandler;
};

const registry = new Map<string, CommandRecord>();

export const registerCommand = (
  id: string,
  handler: CommandHandler
): void => {
  if (registry.has(id)) {
    console.warn(`[palette] Command "${id}" is already registered. Overwriting.`);
  }
  registry.set(id, { handler });
};

export const runRegisteredCommand = async (
  id: string,
  payload?: unknown
): Promise<void> => {
  const record = registry.get(id);
  if (!record) {
    throw new Error(`Command "${id}" is not registered.`);
  }
  await record.handler(payload);
};

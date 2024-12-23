export const tryParseJson = <T>(value: string): T | undefined => {
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    if (e instanceof Error) {
      console.warn("Failed to parse json", e.message);
      return;
    }
    throw e;
  }
};

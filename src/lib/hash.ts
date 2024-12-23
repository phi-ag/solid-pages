import { bufferToHex } from "~/lib/hex";

export type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const hash = async (algorithm: Algorithm, value: string): Promise<string> => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(hash);
};

export const sha1 = async (value: string): Promise<string> => hash("SHA-1", value);

export const sha256 = async (value: string): Promise<string> => hash("SHA-256", value);

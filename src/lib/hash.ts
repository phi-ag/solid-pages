import { type Hash, createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";

import { bufferToHex } from "~/lib/hex";

export const createSha256 = (): Hash => {
  const hash = createHash("sha256");
  hash.setEncoding("hex");
  return hash;
};

export const sha256File = async (path: string): Promise<string> => {
  const stream = createReadStream(path);
  const hash = createSha256();

  await pipeline(stream, hash);

  hash.end();
  return hash.read();
};

export const createSha1 = (): Hash => {
  const hash = createHash("sha1");
  hash.setEncoding("hex");
  return hash;
};

export const sha1File = async (path: string): Promise<string> => {
  const stream = createReadStream(path);
  const hash = createSha1();

  await pipeline(stream, hash);

  hash.end();
  return hash.read();
};

export type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const hash = async (algorithm: Algorithm, value: string): Promise<string> => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(hash);
};

export const sha1 = async (value: string): Promise<string> => hash("SHA-1", value);

export const sha256 = async (value: string): Promise<string> => hash("SHA-256", value);

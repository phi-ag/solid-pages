import { tryParseJson } from "~/lib/json";

export const stringToUint8Array = (value: string): Uint8Array => {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i++) {
    bytes[i] = value.charCodeAt(i);
  }
  return bytes;
};

export const tryDecodeBase64 = (value: string): string | undefined => {
  try {
    return atob(value);
  } catch (e) {
    if (e instanceof Error) {
      console.warn("Failed to decode base64", e.message);
      return;
    }
    throw e;
  }
};

export const tryDecodeBase64Array = (value: string): Uint8Array | undefined => {
  const decoded = tryDecodeBase64(value);
  if (!decoded) return;
  return stringToUint8Array(decoded);
};

export const tryDecodeBase64Url = (value: string): string | undefined =>
  tryDecodeBase64(value.replaceAll("-", "+").replaceAll("_", "/"));

export const tryDecodeBase64UrlArray = (value: string): Uint8Array | undefined => {
  const decoded = tryDecodeBase64Url(value);
  if (!decoded) return;
  return stringToUint8Array(decoded);
};

export const tryDecodeBase64UrlJson = <T>(value: string): T | undefined => {
  const json = tryDecodeBase64Url(value);
  if (!json) return;
  return tryParseJson(json);
};

export const encodeBase64Url = (value: string): string =>
  btoa(value).replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_");

const decoder = new TextDecoder("utf8");

export const encodeBase64Array = (array: Uint8Array): string =>
  btoa(decoder.decode(array));

export const encodeBase64UrlArray = (array: Uint8Array): string =>
  encodeBase64Url(decoder.decode(array));

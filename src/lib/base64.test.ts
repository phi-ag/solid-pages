import { describe, expect, test } from "vitest";

import {
  encodeBase64Array,
  encodeBase64Url,
  encodeBase64UrlArray,
  tryDecodeBase64,
  tryDecodeBase64Url,
  tryDecodeBase64UrlArray
} from "./base64";

describe("base64", () => {
  test("string", () => {
    const value = "my test string";
    const encoded = btoa(value);
    expect(tryDecodeBase64(encoded)).toEqual(value);
  });

  test("string url", () => {
    const value = "my test string";
    const encoded = encodeBase64Url(value);
    expect(tryDecodeBase64Url(encoded)).toEqual(value);
  });

  test("array", () => {
    const value = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const encoded = encodeBase64Array(value);
    expect(tryDecodeBase64UrlArray(encoded)).toEqual(value);
  });

  test("array url", () => {
    const value = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const encoded = encodeBase64UrlArray(value);
    expect(tryDecodeBase64UrlArray(encoded)).toEqual(value);
  });
});

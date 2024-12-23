import fc from "fast-check";
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
    fc.assert(
      fc.property(fc.string(), (value) => {
        const encoded = btoa(value);
        expect(tryDecodeBase64(encoded)).toEqual(value);
      })
    );
  });

  test("string url", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const encoded = encodeBase64Url(value);
        expect(tryDecodeBase64Url(encoded)).toEqual(value);
      })
    );
  });

  test("array", () => {
    fc.property(fc.uint8Array(), (value) => {
      const encoded = encodeBase64Array(value);
      expect(tryDecodeBase64UrlArray(encoded)).toEqual(value);
    });
  });

  test("array url", () => {
    fc.property(fc.uint8Array(), (value) => {
      const encoded = encodeBase64UrlArray(value);
      expect(tryDecodeBase64UrlArray(encoded)).toEqual(value);
    });
  });
});

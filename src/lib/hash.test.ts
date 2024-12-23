import { describe, expect, test } from "vitest";

import { sha1, sha256 } from "./hash";

describe("hash", () => {
  test("sha1", async () => {
    expect(await sha1("")).toEqual("da39a3ee5e6b4b0d3255bfef95601890afd80709");
  });

  test("sha256", async () => {
    expect(await sha256("")).toEqual(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });
});

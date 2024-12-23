import { describe, expect, test, vi } from "vitest";

import { decode, jwkSchema, verify } from "./jwt";

describe("jwt", () => {
  const exampleJwt =
    "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc1MzBhN2RjMjk3MzVkYWIyMGJjYzBkNjJkZTljNzY2MDliYmE1ZDczNDRhMGZmNDkyODNmNzdiMmY4ZjkwOWMifQ.eyJhdWQiOlsiMzFjMWQ3OThkYzBiYmE3NzhmNTgyY2ZkYTk3M2JjODE1ZmRlN2VjOGY1ZGI5YTJlZWIwNTNhMjQ1NTliNzExNyJdLCJlbWFpbCI6InBldGVyK2dpdGh1YkBsb3BlLmF0IiwiZXhwIjoxNzI4NDYyNDEyLCJpYXQiOjE3MjgzNzYwMTIsIm5iZiI6MTcyODM3NjAxMiwiaXNzIjoiaHR0cHM6Ly9waGktYWcuY2xvdWRmbGFyZWFjY2Vzcy5jb20iLCJ0eXBlIjoiYXBwIiwiaWRlbnRpdHlfbm9uY2UiOiI5Q3ZqN0NYeUM4NXdJWXlYIiwic3ViIjoiZjM4N2ZhODktOGMzNi01MGIxLWE3MmEtMWViMDUwNWMxYjEzIiwiY291bnRyeSI6IkFUIn0.ertAd9KBD-viQd9-V4OYbhS8v5VwUtuiD8a2a2CRUpNsrIY6zjXk7YIbTndKuq_j82EC-QvKqnbXvCpp3od0ZXRAbl5vdCLCZ11zz8DUmkNJVYXPk3FO-DAxQWuuqyS2skUtrPIYeUrRju42_s7Y1qdw7JULcy3yYaY1gMpi5y2UbzNs33GWx22LpuYD86Sb9d2WNfj1yOnMeMz8dHwx180l5_r-N4bQooz4Ym-iYFkmSJPFtrfmXkWDhuXUmMzj5lfdPXV14mkpIT5Y_fxbhKlY7f7wz1OejpeFOkjaxjwEghD7TwsbRVZQJmqi3gucg517ksaM4mUu-DIyxK3Rzg";

  const exampleKeys = [
    {
      kid: "bc0e7642aa249520016161a4c5b8c530111249982eff3fa2698f1352a9029f10",
      kty: "RSA",
      alg: "RS256",
      use: "sig",
      e: "AQAB",
      n: "soyk6mP66gHy9f00HP3xc7dMVEeoWLV5I-_sfq_U3-XAcU2lnct8PAq93Vg7ueIDCoMQd0KlB-LTK9EMQnTmsJMq07eyjOe3IumXGFrpWHpgse1I_yUdzZOTvV7UdUt9kO-6plU0yOgG0eSOKBaVn5at3ue1mVtJ73-nDVOtsPMlDfYXaKh2TkLIJDnMgWgj-8Tp63ELo5N_4AhjakmFt6rrwTjBCkowDDms3VyYIspSQyy0Un4fuAxYFbWeRa9Z3ag7g128oXgUY51PKs8TvXH647EnnwSxjPMzrhilnkfDm_AOdv7G2HPgipU35Lnt11xx6wYaVt1I00Q4YAaCqQ"
    },
    {
      kid: "7530a7dc29735dab20bcc0d62de9c76609bba5d7344a0ff49283f77b2f8f909c",
      kty: "RSA",
      alg: "RS256",
      use: "sig",
      e: "AQAB",
      n: "r4OgieiBJzoY7vWATL2mzY_EV6gY52Nis6alCs1M3lTn4RJX3tmdA3up8D91uH8TqgtlWVzDHpSe6nAfmUmOeReygYy_guCha-NAXXbNLf88MToh8SoPeDNg0bzIbr4XoOUQ7jzWwEA_6tdR3q3KBy-xSMzUDrC_7vo2NrCyQw7xvrAzCW9wlijd9nAhUcMSFNoXW49i5_nmhTVPyjJh5mLLBcrQg268n_ZxlrU22UCdjUK80InCTmL4M_VRpzEhqMcWaNJWcB01Aq5oYl3TkaihhKJav--P7eF8E8L2f3gnEjN3KlIVV26q2o-W1Og_ehJOwLB5FvufE9L-Wc6O_w"
    }
  ];

  const issuer = "https://phi-ag.cloudflareaccess.com";
  const audience = "31c1d798dc0bba778f582cfda973bc815fde7ec8f5db9a2eeb053a24559b7117";

  test("decode", () => {
    const jwt = decode(exampleJwt);
    expect(jwt?.header.alg).toEqual("RS256");
    expect(jwt?.payload.iss).toEqual("https://phi-ag.cloudflareaccess.com");
  });

  test("verify", async () => {
    const keys = jwkSchema.array().parse(exampleKeys);
    const jwt = decode(exampleJwt);

    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2024-10-09T06:00:00.000Z"));
      expect(await verify(issuer, audience, keys, jwt!)).toBeTruthy();

      vi.setSystemTime(new Date("2024-10-09T10:00:00.000Z"));
      await expect(verify(issuer, audience, keys, jwt!)).rejects.toThrowError(
        "JWT expired"
      );
    } finally {
      vi.useRealTimers();
    }
  });
});

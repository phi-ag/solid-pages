import { type FetchEvent } from "@solidjs/start/server";
import { z } from "zod";

import { tryDecodeBase64UrlArray, tryDecodeBase64UrlJson } from "~/lib/base64";
import { sha1 } from "~/lib/hash";

const epochSchema = z.number().int().nonnegative();

const algSchema = z.literal("RS256");

export const headerSchema = z.object({
  alg: algSchema,
  kid: z.string()
});

export const audSchema = z
  .union([z.string(), z.string().array()])
  .transform((value) => (value instanceof String ? [value] : value));

export const payloadSchema = z.object({
  type: z.literal("app"),
  aud: audSchema,
  email: z.email().optional(),
  exp: epochSchema,
  iat: epochSchema,
  nbf: epochSchema.optional(),
  iss: z.url(),
  identity_nonce: z.string().optional(),
  common_name: z.string().optional(),
  sub: z.string(),
  country: z.string().length(2).optional()
});

export type Payload = z.infer<typeof payloadSchema>;

export const jwtSchema = z.object({
  header: headerSchema,
  payload: payloadSchema,
  signature: z.instanceof(Uint8Array),
  data: z.instanceof(Uint8Array)
});

export type Jwt = z.infer<typeof jwtSchema>;

export const jwkSchema = z.object({
  kid: z.string(),
  kty: z.literal("RSA"),
  alg: algSchema,
  use: z.literal("sig"),
  e: z.literal("AQAB"),
  n: z.string()
});

export type Jwk = z.infer<typeof jwkSchema>;

const publicCertSchema = z.object({
  kid: z.string(),
  cert: z.string()
});

export const certsSchema = z.object({
  keys: jwkSchema.array().length(2),
  public_cert: publicCertSchema,
  public_certs: publicCertSchema.array().length(2)
});

export type Certs = z.infer<typeof certsSchema>;

export const decode = (value: string): Jwt => {
  const first = value.indexOf(".");
  const second = value.indexOf(".", first + 1);
  if (first === -1 || second === -1) throw Error("Invalid JWT token");

  const header = tryDecodeBase64UrlJson(value.slice(0, first));
  if (!header) throw Error("Invalid JWT header");

  const payload = tryDecodeBase64UrlJson(value.slice(first + 1, second));
  if (!payload) throw Error("Invalid JWT payload");

  const signature = tryDecodeBase64UrlArray(value.slice(second + 1));
  if (!signature) throw Error("Invalid JWT signature");

  const data = new TextEncoder().encode(value.slice(0, second));

  return jwtSchema.parse({
    header,
    payload,
    signature,
    data
  });
};

export const verify = async (
  issuer: string,
  audience: string,
  keys: Jwk[],
  jwt: Jwt
): Promise<boolean> => {
  if (jwt.payload.iss !== issuer) throw Error("Invalid JWT issuer");
  if (!jwt.payload.aud.includes(audience)) throw Error("Invalid JWT audience");

  const now = new Date().getTime() / 1_000;
  if (jwt.payload.nbf && jwt.payload.nbf > now) throw Error("JWT not yet valid");
  if (jwt.payload.exp <= now) throw Error("JWT expired");

  const jwk = keys.find((key) => key.kid === jwt.header.kid);
  if (!jwk) throw Error("JWT key not found");

  const algorithm = {
    name: "RSASSA-PKCS1-v1_5",
    hash: { name: "SHA-256" }
  } satisfies SubtleCryptoImportKeyAlgorithm;

  const key = await crypto.subtle.importKey("jwk", jwk, algorithm, true, ["verify"]);
  return await crypto.subtle.verify(algorithm.name, key, jwt.signature, jwt.data);
};

const fetchCerts = async (env: Env): Promise<[Date, Certs]> => {
  const url = `${env.JWT_ISSUER}/cdn-cgi/access/certs`;
  const response = await fetch(url);
  if (!response.ok) throw Error("Failed to fetch JWT certificates");

  const expires = response.headers.get("expires");
  if (!expires) throw Error("Missing JWT certificates expires header");

  const certs = certsSchema.parse(await response.json());
  return [new Date(expires), certs];
};

const getKeys = async (event: FetchEvent): Promise<Jwk[]> => {
  const key = "jwt:keys";
  const cached = await event.locals.env.KV.get(key, { type: "json", cacheTtl: 3_600 });
  if (cached) return jwkSchema.array().parse(cached);

  const [expires, certs] = await fetchCerts(event.locals.env);
  event.locals.waitUntil(
    event.locals.env.KV.put(key, JSON.stringify(certs.keys), {
      expiration: Math.trunc(expires.getTime() / 1_000)
    })
  );

  return certs.keys;
};

export const jwtAssertionHeader = (event: FetchEvent): string => {
  const header = event.request.headers.get("Cf-Access-Jwt-Assertion");
  if (!header) throw Error("Missing JWT assertion header");
  return header;
};

export const verifiedPayload = async (event: FetchEvent): Promise<Payload> => {
  const header = jwtAssertionHeader(event);

  const hash = await sha1(header);
  const key = `jwt:payload:${hash}`;
  const cached = await event.locals.env.KV.get(key, { type: "json", cacheTtl: 3_600 });
  if (cached) return payloadSchema.parse(cached);

  const jwt = decode(header);
  const keys = await getKeys(event);
  const verified = await verify(
    event.locals.env.JWT_ISSUER,
    event.locals.env.JWT_AUDIENCE,
    keys,
    jwt
  );

  if (!verified) throw Error("Failed to verify JWT");

  event.locals.waitUntil(
    event.locals.env.KV.put(key, JSON.stringify(jwt.payload), {
      expiration: jwt.payload.exp
    })
  );

  return jwt.payload;
};

export const getUser = async (event: FetchEvent): Promise<string | undefined> => {
  if (import.meta.env.DEV || event.locals.env.LOCAL) return "local@example.com";

  const payload = await verifiedPayload(event);
  if (payload.email) return payload.email;

  const e2eClientId = event.locals.env.E2E_CLIENT_ID;
  if (e2eClientId && payload.common_name === e2eClientId) return "e2e@example.com";
};

export const tryGetUser = async (event: FetchEvent): Promise<string | undefined> => {
  try {
    return await getUser(event);
  } catch (e) {
    if (e instanceof Error) {
      event.locals.log.error("Get user failed", e.message);
      return;
    }
    throw e;
  }
};

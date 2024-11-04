// Generated by Wrangler by running `wrangler types src/worker-configuration.d.ts`

interface Env {
	KV: KVNamespace;
	ENVIRONMENT: "preview";
	JWT_ISSUER: "https://phi-ag.cloudflareaccess.com";
	JWT_AUDIENCE: "2858cbaf26a4b2a7f619f5d28ebf2378b97bef58f330c65c1d903b95697a95ba";
	E2E_CLIENT_ID: "ac524ec30129d7a7e941faf6ed54f19c.access";
	SENTRY_DSN: string;
	R2: R2Bucket;
	DB: D1Database;
	AI: Ai;
	CF_VERSION_METADATA: { id: string; tag: string };
}

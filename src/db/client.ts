import { type FetchEvent } from "@solidjs/start/server";
import { type AnyD1Database, DrizzleD1Database, drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Database = DrizzleD1Database<typeof schema> & { $client: AnyD1Database };

export const createDb = (event: FetchEvent): Database =>
  drizzle(event.locals.env.DB, { schema });

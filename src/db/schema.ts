import { customType, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { parse as uuidParse, stringify as uuidStringify, v7 as uuidv7 } from "uuid";

const uuid = customType<{ data: string; driverData: Uint8Array }>({
  dataType() {
    return "blob";
  },
  toDriver(value) {
    return uuidParse(value);
  },
  fromDriver(value) {
    return uuidStringify(value);
  }
});

export const visitor = sqliteTable("visitor", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text().notNull()
});

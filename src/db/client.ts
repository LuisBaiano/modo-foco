import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import * as schema from './schema';
import migrations from './migrations/migrations';

const opSqliteConnection = open({ name: 'modofoco.db' });

export const db = drizzle(opSqliteConnection, { schema });

export function runMigrations() {
  return migrate(db, migrations);
}

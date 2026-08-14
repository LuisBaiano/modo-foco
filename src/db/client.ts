import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import migrations from './migrations/migrations';

const opSqliteConnection = open({ name: 'modofoco.db' });

export const db = drizzle(opSqliteConnection, { schema });

/**
 * Applies pending migrations by hand instead of drizzle's op-sqlite migrate()
 * helper, which relies on session.transaction() — patched in node_modules (see
 * patches/drizzle-orm+0.45.2.patch) but kept isolated here in case that patch
 * ever needs to be reverted.
 */
export async function runMigrations() {
  await db.run(sql`CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag TEXT NOT NULL UNIQUE,
    applied_at INTEGER NOT NULL
  )`);

  for (const entry of migrations.journal.entries) {
    const key = `m${String(entry.idx).padStart(4, '0')}`;
    const alreadyApplied = await db.get(sql`SELECT 1 FROM __drizzle_migrations WHERE tag = ${entry.tag}`);
    if (alreadyApplied) {
      continue;
    }

    const statements = (migrations.migrations as Record<string, string>)[key].split('--> statement-breakpoint');
    for (const statement of statements) {
      if (statement.trim()) {
        await db.run(sql.raw(statement));
      }
    }
    await db.run(sql`INSERT INTO __drizzle_migrations (tag, applied_at) VALUES (${entry.tag}, ${entry.when})`);
  }
}

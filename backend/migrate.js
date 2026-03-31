import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const SEEDS_DIR      = path.join(__dirname, 'seeds');

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_KEY      = process.env.SERVICE_ROLE_SUPABASE;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_SUPABASE in .env');
  process.exit(1);
}

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json().catch(() => null);
}

async function ensureInfrastructure() {
  // Create the exec_sql helper function (runs once, idempotent)
  const bootstrapRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ sql: 'SELECT 1' }),
  });

  if (bootstrapRes.status === 404) {
    throw new Error(
      '\n  exec_sql function not found in your Supabase project.\n' +
      '  Run this once in the Supabase SQL Editor:\n\n' +
      '  CREATE OR REPLACE FUNCTION exec_sql(sql text)\n' +
      '  RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS\n' +
      '  $$ BEGIN EXECUTE sql; END; $$;\n'
    );
  }

  // Create migrations tracking table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL      PRIMARY KEY,
      filename   TEXT        NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getApplied() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/_migrations?select=filename&order=id`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) return new Set();
  const rows = await res.json();
  return new Set(rows.map(r => r.filename));
}

async function recordMigration(filename) {
  await fetch(`${SUPABASE_URL}/rest/v1/_migrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ filename }),
  });
}

async function runFiles(dir, applied, label) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  [skip] ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`  [run]  ${file}`);
    await runSQL(sql);
    await recordMigration(file);
    ran++;
  }
  if (ran === 0) console.log(`  All ${label} already applied.`);
}

async function migrate() {
  try {
    await ensureInfrastructure();
    const applied = await getApplied();
    const args = process.argv.slice(2);

    console.log('\nRunning migrations...');
    await runFiles(MIGRATIONS_DIR, applied, 'migrations');

    if (args.includes('--seed') || args.includes('-s')) {
      const refreshed = await getApplied();
      console.log('\nRunning seeds...');
      await runFiles(SEEDS_DIR, refreshed, 'seeds');
    }

    console.log('\nDone.\n');
  } catch (err) {
    console.error('\nMigration failed:', err.message);
    process.exit(1);
  }
}

migrate();

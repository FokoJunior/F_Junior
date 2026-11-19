import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

let sqlClient: NeonQueryFunction<false, false> | null = null
let schemaReadyPromise: Promise<void> | null = null

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getSql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL)
  }
  return sqlClient
}

/**
 * Creates the games tables in Neon PostgreSQL on first use (idempotent).
 */
export async function ensureGamesSchema(): Promise<void> {
  if (!hasDatabase()) return
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const sql = getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS game_leaderboard (
          game TEXT NOT NULL,
          entry_id TEXT NOT NULL,
          player_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          ip_hash TEXT NOT NULL,
          device_hash TEXT,
          avatar_url TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (game, entry_id)
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS idx_game_leaderboard_game_score
        ON game_leaderboard (game, score)
      `
      await sql`
        CREATE TABLE IF NOT EXISTS game_rooms (
          code TEXT PRIMARY KEY,
          game_type TEXT NOT NULL,
          state JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS idx_game_rooms_updated_at
        ON game_rooms (updated_at)
      `
      await sql`
        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS admin_projects (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'web',
          year TEXT NOT NULL DEFAULT '2026',
          description TEXT NOT NULL,
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          live_url TEXT,
          repo_url TEXT,
          cover_url TEXT,
          featured BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS admin_posts (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'Tech',
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          published BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS game_players (
          player_key TEXT PRIMARY KEY,
          player_name TEXT NOT NULL,
          ip_hash TEXT,
          device_hash TEXT,
          avatar_url TEXT,
          banned BOOLEAN NOT NULL DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
    })().catch((err) => {
      schemaReadyPromise = null
      throw err
    })
  }
  await schemaReadyPromise
}

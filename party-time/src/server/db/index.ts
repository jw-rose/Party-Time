import 'server-only'
import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/server/db/schema'
// Re-export all DB types for easy import across the app
export type { User, NewUser, Event, NewEvent } from '@/server/db/schema'

if (process.env.NEON_LOCAL_HOST) {
  neonConfig.fetchEndpoint = `http://${process.env.NEON_LOCAL_HOST}:5432/sql`
}

const sql = neon(
  process.env.NEON_LOCAL_HOST
    ? process.env.NEON_LOCAL_DATABASE_URL!
    : process.env.DATABASE_URL!
)
export const db = drizzle(sql, { schema })

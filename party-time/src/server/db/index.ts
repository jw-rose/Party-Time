import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/src/server/db/schema'
// Re-export all DB types for easy import across the app
export type { User, NewUser, Event, NewEvent } from '@/src/server/db/schema'

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })

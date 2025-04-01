// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';

// import { env } from '~/env';
// import * as schema from './schema';

// const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
// if (env.NODE_ENV !== 'production') globalForDb.conn = conn;

// export const db = drizzle(conn, { schema });

// src/db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { env } from '@/env';

import * as schema from './schema';

config({ path: '.env' }); // or .env.local

const sql = neon(env.AUTH_V2_DATABASE_URL);
export const db = drizzle({ client: sql, schema });

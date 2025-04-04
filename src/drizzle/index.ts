// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';

// import { env } from '~/env';
// import * as schema from './schema';

// const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
// if (env.NODE_ENV !== 'production') globalForDb.conn = conn;

// export const db = drizzle(conn, { schema });

// src/db.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { env } from '@/env';

import * as schema from './schema';

config({ path: '.env' }); // or .env.local

// export const sql = neon(env.AUTH_V2_DATABASE_URL);
const pool = new Pool({ connectionString: env.AUTH_V2_DATABASE_URL });
export const db = drizzle({ client: pool, schema });

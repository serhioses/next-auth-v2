import { type Config } from 'drizzle-kit';

import { env } from '@/env';

export default {
    schema: './src/drizzle/schema.ts',
    out: './src/drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: env.AUTH_V2_DATABASE_URL,
    },
    tablesFilter: ['next-auth-v2_*'],
} satisfies Config;

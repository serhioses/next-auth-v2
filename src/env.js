import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_V2_DATABASE_URL: z.string().url(),
    AUTH_V2_DATABASE_URL_UNPOOLED: z.string().url(),
    AUTH_V2_PGHOST: z.string().min(1),
    AUTH_V2_PGHOST_UNPOOLED: z.string().min(1),
    AUTH_V2_PGUSER: z.string().min(1),
    AUTH_V2_PGDATABASE: z.string().min(1),
    AUTH_V2_PGPASSWORD: z.string().min(1),
    AUTH_V2_POSTGRES_URL: z.string().url(),
    AUTH_V2_POSTGRES_URL_NON_POOLING: z.string().url(),
    AUTH_V2_POSTGRES_USER: z.string().min(1),
    AUTH_V2_POSTGRES_HOST: z.string().min(1),
    AUTH_V2_POSTGRES_PASSWORD: z.string().min(1),
    AUTH_V2_POSTGRES_DATABASE: z.string().min(1),
    AUTH_V2_POSTGRES_URL_NO_SSL: z.string().url(),
    AUTH_V2_POSTGRES_PRISMA_URL: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_V2_DATABASE_URL: process.env.DATABASE_URL,
    AUTH_V2_DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    AUTH_V2_PGHOST: process.env.PGHOST,
    AUTH_V2_PGHOST_UNPOOLED: process.env.PGHOST_UNPOOLED,
    AUTH_V2_PGUSER: process.env.PGUSER,
    AUTH_V2_PGDATABASE: process.env.PGDATABASE,
    AUTH_V2_PGPASSWORD: process.env.PGPASSWORD,
    AUTH_V2_POSTGRES_URL: process.env.POSTGRES_URL,
    AUTH_V2_POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    AUTH_V2_POSTGRES_USER: process.env.POSTGRES_USER,
    AUTH_V2_POSTGRES_HOST: process.env.POSTGRES_HOST,
    AUTH_V2_POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    AUTH_V2_POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    AUTH_V2_POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL,
    AUTH_V2_POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

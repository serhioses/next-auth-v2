ALTER TABLE "next-auth-v2_user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "next-auth-v2_user" ALTER COLUMN "password" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "next-auth-v2_user" ALTER COLUMN "salt" SET NOT NULL;
CREATE TYPE "public"."oauth_provides" AS ENUM('discord', 'github');--> statement-breakpoint
CREATE TABLE "next-auth-v2_user_oauth_account" (
	"userId" uuid NOT NULL,
	"provider" "oauth_provides" NOT NULL,
	"providerAccountId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "next-auth-v2_user_oauth_account_providerAccountId_provider_pk" PRIMARY KEY("providerAccountId","provider"),
	CONSTRAINT "next-auth-v2_user_oauth_account_providerAccountId_unique" UNIQUE("providerAccountId")
);
--> statement-breakpoint
ALTER TABLE "next-auth-v2_user" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "next-auth-v2_user" ALTER COLUMN "salt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "next-auth-v2_user_oauth_account" ADD CONSTRAINT "next-auth-v2_user_oauth_account_userId_next-auth-v2_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."next-auth-v2_user"("id") ON DELETE cascade ON UPDATE no action;
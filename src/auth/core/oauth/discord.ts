import { OAuthClient } from '@/auth/core/oauth/base';
import { env } from '@/env';
import { z } from 'zod';

export function createDiscordOAuthClient() {
    const client = new OAuthClient({
        provider: 'discord',
        userInfo: {
            schema: z.object({
                id: z.string(),
                username: z.string(),
                global_name: z.string().nullable(),
                email: z.string().email(),
            }),
            transform(rawUser) {
                return {
                    id: rawUser.id,
                    email: rawUser.email,
                    name: rawUser.global_name ?? rawUser.username,
                };
            },
        },
        urls: {
            auth: 'https://discord.com/oauth2/authorize',
            token: 'https://discord.com/api/oauth2/token',
            user: 'https://discord.com/api/users/@me',
        },
        scopes: ['identify', 'email'],
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
    });

    return client;
}

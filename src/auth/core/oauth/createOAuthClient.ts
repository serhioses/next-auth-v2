import type { TOAuthProvider } from '@/drizzle/schema';
import { createDiscordOAuthClient } from '@/auth/core/oauth/discord';

export function createOAuthClient(provider: TOAuthProvider) {
    switch (provider) {
        case 'discord': {
            return createDiscordOAuthClient();
        }
        default: {
            throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}

import { createOAuthClient } from '@/auth/core/oauth/createOAuthClient';
import { createUserSession } from '@/auth/core/session';
import { connectOAuthUserToAccount } from '@/drizzle/queries';
import { oAuthProviders } from '@/drizzle/schema';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
    const { provider: providerParam } = await params;

    const { data: provider, success } = z.enum(oAuthProviders).safeParse(providerParam);

    if (!success) {
        redirect(
            `/sign-in?oauthError=${encodeURIComponent(`Unsupported provider: ${providerParam}.`)}`,
        );
    }

    const codeParam = req.nextUrl.searchParams.get('code');
    const stateParam = req.nextUrl.searchParams.get('state');

    if (!codeParam || !stateParam) {
        redirect(
            `/sign-in?oauthError=${encodeURIComponent('Failed to connect. Please try again.')}`,
        );
    }

    const oAuthClient = createOAuthClient(provider);

    try {
        const oAuthUser = await oAuthClient.fetchUser(codeParam, stateParam, await cookies());
        const user = await connectOAuthUserToAccount({ ...oAuthUser }, provider);
        await createUserSession(user, await cookies());
    } catch (err) {
        console.error(err);
        redirect(
            `/sign-in?oauthError=${encodeURIComponent('Failed to connect. Please try again.')}`,
        );
    }

    redirect('/');
}

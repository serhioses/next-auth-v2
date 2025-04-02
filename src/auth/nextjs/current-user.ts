import { getUserFromSession } from '@/auth/core/session';
import { getUserById } from '@/drizzle/queries';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

type TFullUser = Exclude<Awaited<ReturnType<typeof getUserById>>, undefined | null>;
type TSessionUser = Exclude<Awaited<ReturnType<typeof getUserFromSession>>, undefined | null>;

function _getCurrentUser(options: {
    withFullUser: true;
    redirectIfNotFound: true;
}): Promise<TFullUser>;
function _getCurrentUser(options: {
    withFullUser: true;
    redirectIfNotFound?: false;
}): Promise<TFullUser | null>;
function _getCurrentUser(options: {
    withFullUser?: false;
    redirectIfNotFound: true;
}): Promise<TSessionUser>;
function _getCurrentUser(options?: {
    withFullUser?: false;
    redirectIfNotFound?: false;
}): Promise<TSessionUser | null>;
async function _getCurrentUser({ withFullUser = false, redirectIfNotFound = false } = {}) {
    const userFromSession = await getUserFromSession(await cookies());

    if (!userFromSession) {
        if (redirectIfNotFound) {
            return redirect('/sign-in');
        }

        return null;
    }

    if (!withFullUser) {
        return userFromSession;
    }

    const fullUser = await getUserById(userFromSession.id);

    if (!fullUser) {
        // This must never happen
        throw new Error('User not found in DB');
    }

    return fullUser;
}

export const getCurrentUser = cache(_getCurrentUser);

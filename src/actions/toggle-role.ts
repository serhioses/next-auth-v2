'use server';

import { createUserSession, getUserFromSession, removeUserSession } from '@/auth/core/session';
import { updateUserRole } from '@/drizzle/queries';
import { cookies } from 'next/headers';

export async function toggleRole() {
    const resolvedCookies = await cookies();
    const userFromSession = await getUserFromSession(resolvedCookies);

    if (!userFromSession) {
        return;
    }

    const updatedUser = await updateUserRole(
        userFromSession.id,
        userFromSession.role === 'user' ? 'admin' : 'user',
    );

    if (!updatedUser) {
        return;
    }

    await removeUserSession(resolvedCookies);
    await createUserSession(updatedUser, resolvedCookies);
}

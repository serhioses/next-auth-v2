'use server';

import type { z } from 'zod';
import { signInSchema, signUpSchema } from '@/auth/nextjs/schemas';
import { createUser, getUserByEmail } from '@/drizzle/queries';
import { redirect } from 'next/navigation';
import { comparePasswords, genSalt, hashPassword } from '@/auth/core/password-hasher';
import { createUserSession, removeUserSession } from '@/auth/core/session';
import { cookies } from 'next/headers';
import type { TOAuthProvider } from '@/drizzle/schema';
import { createOAuthClient } from '@/auth/core/oauth/createOAuthClient';

export async function signUp(unsafeData: z.infer<typeof signUpSchema>) {
    const { success, data } = signUpSchema.safeParse(unsafeData);

    if (!success) {
        return 'Unable to create account';
    }

    const existingUser = await getUserByEmail(data.email);

    if (existingUser) {
        return `Account with ${data.email} already exists`;
    }

    const salt = genSalt();

    try {
        const hashedPassword = await hashPassword(data.password, salt);

        const newUser = await createUser({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            salt,
        });

        if (!newUser) {
            return 'Unable to create account';
        }

        await createUserSession(newUser, await cookies());
    } catch {
        return 'Unable to encrypt the password. Try a different one.';
    }

    redirect('/');
}

export async function signIn(unsafeData: z.infer<typeof signInSchema>) {
    const { success, data } = signInSchema.safeParse(unsafeData);

    if (!success) {
        return 'Unable to login';
    }

    const existingUser = await getUserByEmail(data.email);

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!existingUser || existingUser.password === null || existingUser.salt === null) {
        return 'User not found';
    }

    try {
        const isPasswordCorrect = await comparePasswords({
            passwordString: data.password,
            hashedPassword: existingUser.password,
            salt: existingUser.salt,
        });

        if (!isPasswordCorrect) {
            return 'Wrong email or password';
        }
    } catch {
        return 'Error encrypting the password';
    }

    await createUserSession({ id: existingUser.id, role: existingUser.role }, await cookies());

    redirect('/');
}

export async function logOut() {
    await removeUserSession(await cookies());

    redirect('/');
}

export async function oAuthSignIn(provider: TOAuthProvider) {
    const oAuthClient = createOAuthClient(provider);
    redirect(oAuthClient.genAuthURL(await cookies()));
}

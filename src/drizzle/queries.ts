'use server';

import { db } from '@/drizzle';
import { type UserRole, users, type TUser } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
        where(fields, { eq }) {
            return eq(fields.email, email);
        },
    });

    return user;
}

export async function getUserById(id: string) {
    const user = await db.query.users.findFirst({
        where(fields, { eq }) {
            return eq(fields.id, id);
        },
        columns: { id: true, email: true, name: true, role: true },
    });

    return user;
}

export async function createUser(values: Pick<TUser, 'name' | 'email' | 'password' | 'salt'>) {
    const result = await db
        .insert(users)
        .values({ ...values })
        .returning({ id: users.id, role: users.role });

    return result[0];
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    const result = await db
        .update(users)
        .set({ role: newRole })
        .where(eq(users.id, userId))
        .returning({ id: users.id, role: users.role });

    return result[0];
}

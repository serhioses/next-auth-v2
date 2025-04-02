import { userRoles } from '@/drizzle/schema';
import { z } from 'zod';
import { redisClient } from '@/redis/redis';

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = 'session_id';

const userSessionDataSchema = z.object({
    id: z.string(),
    role: z.enum(userRoles),
});

type TUserSessionData = z.infer<typeof userSessionDataSchema>;

type TCookies = {
    set: (
        key: string,
        value: string,
        options: {
            secure?: boolean;
            httpOnly?: boolean;
            sameSite?: 'strict' | 'lax';
            expires?: number;
        },
    ) => void;
    get: (key: string) => { name: string; value: string } | undefined;
    delete: (key: string) => void;
};

export async function createUserSession(user: TUserSessionData, cookies: Pick<TCookies, 'set'>) {
    const sessionId = Array.from(crypto.getRandomValues(new Uint8Array(256)))
        .map((b) => {
            return b.toString(16).padStart(2, '0');
        })
        .join('');
    await redisClient.set(`session:${sessionId}`, userSessionDataSchema.parse(user), {
        ex: SESSION_EXPIRATION_SECONDS,
    });
    setSessionCookie(sessionId, cookies);
}

export function getUserFromSession(cookies: Pick<TCookies, 'get'>) {
    const sessionId = getUserSessionId(cookies);

    if (!sessionId) {
        return null;
    }

    return getUserSessionData(sessionId);
}

export async function removeUserSession(cookies: Pick<TCookies, 'get' | 'delete'>) {
    const sessionId = getUserSessionId(cookies);

    if (!sessionId) {
        return;
    }

    cookies.delete(COOKIE_SESSION_KEY);
    await redisClient.del(`session:${sessionId}`);
}

export async function updateUserSessionExpiration(cookies: Pick<TCookies, 'get' | 'set'>) {
    const sessionId = getUserSessionId(cookies);

    if (!sessionId) {
        return;
    }

    const userFromSession = await getUserFromSession(cookies);

    if (!userFromSession) {
        return;
    }

    await redisClient.set(`session:${sessionId}`, userFromSession, {
        ex: SESSION_EXPIRATION_SECONDS,
    });
    setSessionCookie(sessionId, cookies);
}

function getUserSessionId(cookies: Pick<TCookies, 'get'>) {
    const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return sessionId || null;
}

async function getUserSessionData(sessionId: string) {
    const rawUserData = await redisClient.get(`session:${sessionId}`);
    const { success, data } = userSessionDataSchema.safeParse(rawUserData);

    return success ? data : null;
}

function setSessionCookie(sessionId: string, cookies: Pick<TCookies, 'set'>) {
    cookies.set(COOKIE_SESSION_KEY, sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
    });
}

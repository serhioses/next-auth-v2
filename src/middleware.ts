import { NextResponse, type NextRequest } from 'next/server';
import { getUserFromSession, updateUserSessionExpiration } from '@/auth/core/session';

const privateRoutes = ['/private'];
const adminRoutes = ['/admin'];

export async function middleware(req: NextRequest) {
    const response = (await authMiddleware(req)) ?? NextResponse.next();

    await updateUserSessionExpiration({
        get: (key) => req.cookies.get(key),
        set: (key, value, options) => {
            response.cookies.set(key, value, options);
        },
    });

    return response;
}

async function authMiddleware(req: NextRequest) {
    if (privateRoutes.includes(req.nextUrl.pathname)) {
        const user = await getUserFromSession(req.cookies);

        if (!user) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
    }

    if (adminRoutes.includes(req.nextUrl.pathname)) {
        const user = await getUserFromSession(req.cookies);

        if (!user) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        if (user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};

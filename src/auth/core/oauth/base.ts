import crypto from 'crypto';
import type { TOAuthProvider } from '@/drizzle/schema';
import { env } from '@/env';
import { z } from 'zod';
import type { TCookies } from '@/auth/core/session';

const STATE_COOKIE_KEY = 'oauth_state';
const STATE_EXPIRATION_SECONDS = 60 * 5;
const CODE_VERIFIER_COOKIE_KEY = 'oauth_code_verifier';
const CODE_VERIFIER_EXPIRATION_SECONDS = 60 * 5;

type TOAuthClientUser = {
    id: string;
    email: string;
    name: string;
};

type TOAuthClientUserInfo<T> = {
    schema: z.ZodSchema<T>;
    transform: (rawUser: T) => TOAuthClientUser;
};
type TOAuthClientUrls = {
    auth: string;
    token: string;
    user: string;
};

type TOAuthClientParams<T> = {
    provider: TOAuthProvider;
    userInfo: TOAuthClientUserInfo<T>;
    urls: TOAuthClientUrls;
    scopes: string[];
    clientId: string;
    clientSecret: string;
};

export class OAuthClient<T> {
    private readonly provider: TOAuthProvider;
    private readonly userInfo: TOAuthClientUserInfo<T>;
    private readonly urls: TOAuthClientUrls;
    private readonly scopes: string[];
    private readonly clientId: string;
    private readonly clientSecret: string;

    private readonly tokenDataSchema = z.object({
        token_type: z.string(),
        access_token: z.string(),
    });

    constructor({
        provider,
        urls,
        userInfo,
        scopes,
        clientId,
        clientSecret,
    }: TOAuthClientParams<T>) {
        this.provider = provider;
        this.urls = urls;
        this.userInfo = userInfo;
        this.scopes = scopes;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private get redirectURL() {
        return new URL(this.provider, env.OAUTH_REDIRECT_BASE_URI).toString();
    }

    genAuthURL(cookies: Pick<TCookies, 'set'>) {
        const url = new URL(this.urls.auth);
        url.searchParams.set('client_id', this.clientId);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('redirect_uri', this.redirectURL);
        url.searchParams.set('scope', this.scopes.join(' '));
        url.searchParams.set('state', createStateParam(cookies));
        url.searchParams.set('code_challenge_method', 'S256');
        url.searchParams.set(
            'code_challenge',
            crypto.createHash('sha256').update(createCodeVerifier(cookies)).digest('base64url'),
        );

        return url.toString();
    }

    async fetchUser(code: string, state: string, cookies: Pick<TCookies, 'get'>) {
        if (!validateStateParam(state, cookies)) {
            throw new InvalidOAuthStateError();
        }

        const tokenData = await this.fetchTokenData(code, getCodeVerifier(cookies));

        const user = await fetch(this.urls.user, {
            method: 'GET',
            headers: {
                Authorization: `${tokenData.tokenType} ${tokenData.accessToken}`,
            },
        })
            .then((r) => r.json())
            .then((rawUser) => {
                const { data, success, error } = this.userInfo.schema.safeParse(rawUser);

                if (!success) {
                    throw new InvalidOAuthUserError(error);
                }

                return this.userInfo.transform(data);
            });

        return user;
    }

    private async fetchTokenData(code: string, codeVerifier: string) {
        const tokenData = await fetch(this.urls.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectURL,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code_verifier: codeVerifier,
            }),
        })
            .then((r) => r.json())
            .then((rawTokenData) => {
                const { data, success, error } = this.tokenDataSchema.safeParse(rawTokenData);

                if (!success) {
                    throw new InvalidOAuthTokenError(error);
                }

                return { tokenType: data.token_type, accessToken: data.access_token };
            });

        return tokenData;
    }
}

class InvalidOAuthTokenError extends Error {
    constructor(zodError: z.ZodError) {
        super('Invalid oauth token');
        this.cause = zodError;
    }
}

class InvalidOAuthUserError extends Error {
    constructor(zodError: z.ZodError) {
        super('Invalid oauth user');
        this.cause = zodError;
    }
}

class InvalidOAuthStateError extends Error {
    constructor() {
        super('Invalid oauth state');
    }
}

class InvalidOAuthCodeverifierError extends Error {
    constructor() {
        super('Invalid oauth code verifier');
    }
}

function createStateParam(cookies: Pick<TCookies, 'set'>) {
    const state = crypto.randomBytes(64).toString('hex');
    cookies.set(STATE_COOKIE_KEY, state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: Date.now() + STATE_EXPIRATION_SECONDS * 1000,
    });

    return state;
}

function validateStateParam(state: string, cookies: Pick<TCookies, 'get'>) {
    return state === cookies.get(STATE_COOKIE_KEY)?.value;
}

function createCodeVerifier(cookies: Pick<TCookies, 'set'>) {
    const codeVerifier = crypto.randomBytes(64).toString('hex');
    cookies.set(CODE_VERIFIER_COOKIE_KEY, codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: Date.now() + CODE_VERIFIER_EXPIRATION_SECONDS * 1000,
    });

    return codeVerifier;
}

function getCodeVerifier(cookies: Pick<TCookies, 'get'>) {
    const codeVerifier = cookies.get(CODE_VERIFIER_COOKIE_KEY)?.value;

    if (!codeVerifier) {
        throw new InvalidOAuthCodeverifierError();
    }

    return codeVerifier;
}

import crypto from 'crypto';

export async function hashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) {
                reject(err);
            } else {
                resolve(derivedKey.toString('hex'));
            }
        });
    });
}

export function genSalt() {
    return crypto.randomBytes(16).toString('hex');
}

export async function comparePasswords({
    passwordString,
    hashedPassword,
    salt,
}: {
    passwordString: string;
    hashedPassword: string;
    salt: string;
}) {
    const inputHashedPassword = await hashPassword(passwordString, salt);

    return crypto.timingSafeEqual(
        Buffer.from(inputHashedPassword, 'hex'),
        Buffer.from(hashedPassword, 'hex'),
    );
}

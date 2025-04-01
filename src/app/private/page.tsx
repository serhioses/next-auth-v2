import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ToggleRoleButton } from '@/app/private/ToggleRoleButton';
// import { getCurrentUser } from '@/auth/nextjs/currentUser';

export default async function PrivatePage() {
    // const currentUser = await getCurrentUser({ redirectIfNotFound: true });
    const currentUser = { role: 'user' };

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-8 text-4xl">Private: {currentUser.role}</h1>
            <div className="flex gap-2">
                <ToggleRoleButton />
                <Button asChild>
                    <Link href="/">Home</Link>
                </Button>
            </div>
        </div>
    );
}

import { SignInForm } from '@/auth/nextjs/components/SignInForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SignIn({
    searchParams,
}: {
    searchParams: Promise<{ oauthError?: string }>;
}) {
    const { oauthError } = await searchParams;

    return (
        <div className="container mx-auto max-w-[750px] p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    {oauthError && (
                        <CardDescription className="text-destructive">{oauthError}</CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <SignInForm />
                </CardContent>
            </Card>
        </div>
    );
}

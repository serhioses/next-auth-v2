'use client';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
// import { oAuthSignIn } from '../actions';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { signInSchema } from '@/auth/nextjs/schemas';
import Link from 'next/link';
import { signIn } from '@/auth/nextjs/actions';
import { zodResolver } from '@hookform/resolvers/zod';

export function SignInForm() {
    const [error, setError] = useState<string>();
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(data: z.infer<typeof signInSchema>) {
        const error = await signIn(data);
        setError(error);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {error && <p className="text-destructive">{error}</p>}
                {/* <div className="flex gap-4">
                    <Button type="button" onClick={async () => await oAuthSignIn('discord')}>
                        Discord
                    </Button>
                    <Button type="button" onClick={async () => await oAuthSignIn('github')}>
                        GitHub
                    </Button>
                </div> */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-4">
                    <Button asChild variant="link">
                        <Link href="/sign-up">Sign Up</Link>
                    </Button>
                    <Button type="submit">Sign In</Button>
                </div>
            </form>
        </Form>
    );
}

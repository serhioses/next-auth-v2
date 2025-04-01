import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-8 text-4xl">Admin</h1>
            <Button asChild>
                <Link href="/">Home</Link>
            </Button>
        </div>
    );
}

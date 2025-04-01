'use client';

import { Button } from '@/components/ui/button';
// import { logOut } from '../actions';

export function LogOutButton() {
    return (
        // <Button variant="destructive" onClick={async () => await logOut()}>
        <Button variant="destructive" onClick={() => console.log('log out')}>
            Log Out
        </Button>
    );
}

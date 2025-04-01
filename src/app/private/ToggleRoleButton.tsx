'use client';

// import { toggleRole } from '@/actions/toggleRole';
import { Button } from '@/components/ui/button';

export function ToggleRoleButton() {
    // return <Button onClick={toggleRole}>Toggle Role</Button>;
    return <Button onClick={() => console.log('toggle role')}>Toggle Role</Button>;
}

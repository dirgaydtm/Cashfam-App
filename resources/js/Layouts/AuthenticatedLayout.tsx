import { usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import Navbar from '@/Components/Main/Navbar';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-base-300">
            {/* Top Navigation */}
            <Navbar user={user} />

            {/* Main content */}
            <main className="flex-1 max-w-[1920px] mx-auto">
                <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

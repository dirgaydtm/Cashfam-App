import { usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import Navbar from '@/Components/Main/Navbar';

export default function Authenticated({
    children,
    onCreateBook,
    onJoinBook,
}: PropsWithChildren<{
    onCreateBook?: () => void;
    onJoinBook?: () => void;
}>) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-base-100">
            {/* Top Navigation */}
            <Navbar
                onCreateBook={onCreateBook}
                onJoinBook={onJoinBook}
            />

            {/* Main content */}
            <main className="flex-1 max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8 mx-auto">
                {children}
            </main>
        </div>
    );
}

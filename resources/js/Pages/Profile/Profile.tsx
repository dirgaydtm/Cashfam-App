import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import UpdateProfileForm from '@/Components/Profile/UpdateProfileForm';
import DeleteAccountForm from '@/Components/Profile/DeleteAccountForm';
import InitialAvatar from '@/Components/Main/InitialAvatar';

export default function Profile({ status }: PageProps<{ status?: string }>) {
    const user = usePage().props.auth.user;
    return (
        <AuthenticatedLayout >
            <Head title="Profile" />

            <div className="flex m-auto h-[75vh] max-w-7xl gap-7 items-center space-y-8">
                {/* Profile*/}
                <div className="h-full flex flex-col justify-center items-center gap-2 mb-2 flex-1">
                    <InitialAvatar
                        username={user.name}
                        className="w-80 h-80 text-[12rem] m-6"
                    />
                    <h2 className="font-bold text-3xl leading-tight">{user.name}</h2>
                    <div className="text-center text-sm">
                        <p className="text-base-content/70">{user.email}</p>
                        <p className="text-base-content/70">Joined on {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p>
                    </div>
                </div>


                <div className='flex flex-col gap-7 flex-2'>
                    {/* Update Profile Section */}
                    <UpdateProfileForm />

                    {/* Delete Account Section */}
                    <DeleteAccountForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
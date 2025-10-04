import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import UpdateProfileForm from '@/Components/Profile/UpdateProfileForm';
import DeleteAccountForm from '@/Components/Profile/DeleteAccountForm';

export default function Profile({ status }: PageProps<{ status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-base-content/90">
                    Profile Settings
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="space-y-6">
                {/* Success Status Alert */}
                {status && (
                    <div className="alert alert-success">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{status}</span>
                    </div>
                )}

                {/* Update Profile Information */}
                <UpdateProfileForm />

                {/* Delete Account Section */}
                <DeleteAccountForm />
            </div>
        </AuthenticatedLayout>
    );
}

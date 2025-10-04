import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Mail, Save } from 'lucide-react';

export default function UpdateProfileForm() {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
                <h3 className="card-title text-2xl mb-2">Profile Information</h3>
                <p className="text-base-content/70 mb-6">
                    Update your account's profile information and email address.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Name</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''
                                    }`}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                            <User
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                                size={18}
                            />
                        </div>
                        {errors.name && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.name}</span>
                            </label>
                        )}
                    </div>

                    {/* Email Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''
                                    }`}
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                                size={18}
                            />
                        </div>
                        {errors.email && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.email}</span>
                            </label>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={processing}
                        >
                            {processing && <span className="loading loading-spinner loading-sm"></span>}
                            <Save size={18} />
                            Save Changes
                        </button>

                        {recentlySuccessful && (
                            <div className="text-success text-sm font-medium flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Saved successfully
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

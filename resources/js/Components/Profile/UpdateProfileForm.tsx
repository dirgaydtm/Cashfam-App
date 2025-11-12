import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User, Mail, Save, Check } from 'lucide-react';

export default function UpdateProfileForm() {
    const user = usePage().props.auth.user;

    const {
        data,
        setData,
        patch,
        errors,
        processing,
        recentlySuccessful,
    } = useForm({
        name: user.name,
        email: user.email,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const isChanged = data.name !== user.name || data.email !== user.email;
    const inputClass = (hasError: boolean) =>
        `input border-0 border-b-1 md:text-base shadow-none peer bg-transparent rounded-none focus:ring-0 focus:text-primary focus:border-primary focus:outline-none h-11 w-full pl-10 ${hasError ? 'input-error' : ''}`;
    const iconClass = "absolute peer-focus:text-primary z-[1] left-3 top-1/2 -translate-y-1/2 text-base-content/40";

    return (
        <div className="card bg-base-100 shadow-lg border-2 border-primary/20">
            <div className="card-body gap-5">
                {/* Header */}
                <div>
                    <h3 className="card-title text-primary text-2xl">Profile Information</h3>
                    <p className="text-base-content/70">Update your account's profile information and email address.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Name Input */}
                    <div className="form-control">
                        <div className="relative">
                            <input
                                type="text"
                                className={inputClass(!!errors.name)}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                            />
                            <User className={iconClass} size={18} />
                        </div>
                        {errors.name && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.name}</span>
                            </label>
                        )}
                    </div>

                    {/* Email Input */}
                    <div className="form-control">
                        <div className="relative">
                            <input
                                type="email"
                                className={inputClass(!!errors.email)}
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <Mail className={iconClass} size={18} />
                        </div>
                        {errors.email && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.email}</span>
                            </label>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end mt-10 gap-4">
                        {recentlySuccessful && (
                            <div className="text-success text-sm font-medium flex items-center gap-2">
                                <Check size={16} />
                                Saved successfully
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={processing || !isChanged}>
                            {processing && <span className="loading loading-spinner loading-sm" />}
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign Up" />

            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-semibold text-base-content">Get started!</h2>
                    <p className="text-base-content/60 mt-2">Start managing finances together</p>
                </div>

                {/* Register Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Name field */}
                    <div className="form-control">
                        <div className="relative">
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                className={`input border-0 md:text-base border-b-1 peer shadow-none bg-transparent rounded-none focus:border-primary focus:outline-none focus:text-primary w-full pl-10 ${errors.name ? 'input-error' : ''}`}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                autoFocus
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <User className="absolute z-[1] peer-focus:text-primary left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                        </div>
                        {errors.name && (
                            <label className="label">
                                <span className="label-text-alt text-xs text-error">{errors.name}</span>
                            </label>
                        )}
                    </div>

                    {/* Email field */}
                    <div className="form-control">
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className={`input border-0 md:text-base border-b-1 peer shadow-none bg-transparent rounded-none focus:border-primary focus:outline-none focus:text-primary w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                                placeholder="Enter your email"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <Mail className="absolute z-[1] peer-focus:text-primary left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                        </div>
                        {errors.email && (
                            <label className="label">
                                <span className="label-text-alt text-xs text-error">{errors.email}</span>
                            </label>
                        )}
                    </div>

                    {/* Password field */}
                    <div className="form-control">
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className={`input border-0 md:text-base border-b-1 peer shadow-none bg-transparent rounded-none focus:border-primary focus:outline-none focus:text-primary h-11 w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <Lock className="absolute z-[1] peer-focus:text-primary left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                            <button
                                type="button"
                                className="absolute z-[1] peer-focus:text-primary right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <label className="label">
                                <span className="label-text-alt text-xs text-error">{errors.password}</span>
                            </label>
                        )}
                    </div>

                    {/* Confirm Password field */}
                    <div className="form-control">
                        <div className="relative">
                            <input
                                id="password_confirmation"
                                type={showPasswordConfirm ? 'text' : 'password'}
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className={`input border-0 md:text-base border-b-1 peer shadow-none bg-transparent rounded-none focus:border-primary focus:outline-none focus:text-primary/100 h-11 w-full pl-10 pr-10 ${errors.password_confirmation ? 'input-error' : ''}`}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <Lock className="absolute z-[1] peer-focus:text-primary left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                            <button
                                type="button"
                                className="absolute z-[1] peer-focus:text-primary right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            >
                                {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password_confirmation && (
                            <label className="label">
                                <span className="label-text-alt text-xs text-error">{errors.password_confirmation}</span>
                            </label>
                        )}
                    </div>

                    {/* Terms & conditions */}
                    <div className="form-control">
                        <label className="cursor-pointer label mx-2 gap-2 justify-start">
                            <input type="checkbox" className="checkbox checkbox-primary checkbox-xs rounded-none" required />
                            <span className="label-text text-xs md:text-base">
                                I agree to the{' '}
                                <a href="#" className="link text-xs md:text-base link-primary hover:link-hover">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="link text-xs md:text-base link-primary hover:link-hover">Privacy Policy</a>
                            </span>
                        </label>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        className="btn btn-primary md:h-11 w-full"
                        disabled={processing}
                    >
                        {processing && <span className="loading loading-spinner loading-sm"></span>}
                        Create account
                    </button>
                </form>

                {/* Sign in link */}
                <div className="text-center">
                    <span className="text-base-content/60 text-sm md:text-base">Already have an account? </span>
                    <Link
                        href={route('login')}
                        className="link link-primary text-sm md:text-base hover:link-hover font-medium"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}

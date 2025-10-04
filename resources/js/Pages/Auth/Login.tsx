import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Lock, Eye, EyeOff, CircleAlert } from 'lucide-react';
import { useState } from 'react';

export default function Login({
    status,
}: {
    status?: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        console.log('Form submitting with data:', data);

        post('/login', {
            onFinish: () => {
                console.log('Request finished');
                reset('password');
            },
            onError: (errors) => {
                console.log('Login errors:', errors);
            },
            onSuccess: () => {
                console.log('Login successful - redirecting...');
            },
            onStart: () => {
                console.log('Login request started');
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign in to CasFam" />

            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-semibold text-base-content">Glad to see you again!</h2>
                    <p className="text-base-content/60 mt-2">Sign in and see your finances at a glance</p>
                </div>

                {/* Status message */}
                {status && (
                    <div className="alert alert-success">
                        <span>{status}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Email field */}
                    <div className="form-control">
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className={`input border-0 border-b-1 md:text-base shadow-none peer bg-transparent rounded-none focus:border-primary focus:text-primary focus:outline-none h-11  w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                                placeholder="Enter your email"
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <Mail className="absolute peer-focus:text-primary z-[1] left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                        </div>
                        {errors.email && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.email}</span>
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
                                className={`input border-0 border-b-1 md:text-base peer shadow-none bg-transparent rounded-none focus:border-primary focus:outline-none focus:text-primary/100 h-11 w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <Lock className="absolute peer-focus:text-primary z-[1] left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                            <button
                                type="button"
                                className="absolute peer-focus:text-primary z-[1] right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.password}</span>
                            </label>
                        )}
                    </div>

                    {/* Remember me */}
                    <div className="form-control">
                        <label className="cursor-pointer label mx-2 gap-2 justify-start">
                            <input type="checkbox" className="checkbox checkbox-primary checkbox-xs rounded-none" required />
                            <span className="label-text text-xs md:text-base">
                                Remember me
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
                        Sign in
                    </button>
                </form>

                {/* Sign up link */}
                <div className="text-center">
                    <span className="text-base-content/60">Don't have an account? </span>
                    <Link
                        href={route('register')}
                        className="link link-primary hover:link-hover font-medium"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}

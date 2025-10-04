import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteAccountForm() {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmDeletion = () => {
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        reset();
    };

    const deleteAccount: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <div className="card bg-base-100 shadow-lg border-2 border-error/20">
                <div className="card-body">
                    <h3 className="card-title text-2xl mb-2 text-error">Delete Account</h3>
                    <p className="text-base-content/70 mb-6">
                        Once your account is deleted, all of its resources and data will be
                        permanently deleted. Before deleting your account, please download any
                        data or information that you wish to retain.
                    </p>

                    <div>
                        <button
                            onClick={confirmDeletion}
                            className="btn btn-error"
                        >
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <input
                type="checkbox"
                id="delete_account_modal"
                className="modal-toggle"
                checked={confirmingDeletion}
                onChange={() => { }}
            />
            <div className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-error/10 p-3 rounded-full">
                            <AlertTriangle className="text-error" size={24} />
                        </div>
                        <h3 className="font-bold text-xl">Delete Account</h3>
                    </div>

                    <p className="text-base-content/70 mb-4">
                        Are you sure you want to delete your account? Once your account is
                        deleted, all of its resources and data will be permanently deleted.
                        Please enter your password to confirm you would like to permanently
                        delete your account.
                    </p>

                    <form onSubmit={deleteAccount} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Password</span>
                            </label>
                            <input
                                type="password"
                                ref={passwordInput}
                                className={`input input-bordered w-full ${errors.password ? 'input-error' : ''
                                    }`}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.password}
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-error"
                                disabled={processing}
                            >
                                {processing && (
                                    <span className="loading loading-spinner loading-sm"></span>
                                )}
                                <Trash2 size={18} />
                                Delete Account
                            </button>
                        </div>
                    </form>
                </div>
                <label className="modal-backdrop" onClick={closeModal}>
                    Close
                </label>
            </div>
        </>
    );
}

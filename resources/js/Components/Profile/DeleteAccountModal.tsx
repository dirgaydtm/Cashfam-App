import { FormEventHandler, RefObject } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import Modal from '@/Layouts/Modal';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    processing: boolean;
    passwordRef: RefObject<HTMLInputElement>;
}

export default function DeleteAccountModal({
    open,
    onClose,
    onSubmit,
    data,
    setData,
    errors,
    processing,
    passwordRef
}: Props) {
    const hasError = errors?.password;

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={
                <>
                    <div className="bg-error/10 p-3 rounded-full">
                        <AlertTriangle className="text-error" size={24} />
                    </div>
                    <span className="font-bold text-xl">Delete Account</span>
                </>
            }
            size="small"
            showCloseButton={false}
        >
            <p className="text-base-content/70 mb-4">
                Are you sure you want to delete your account? Once deleted, all resources and data will be permanently removed. Enter your password to confirm.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
                {/* Password Input */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Password</span>
                    </label>
                    <input
                        type="password"
                        ref={passwordRef}
                        className={`input input-bordered w-full ${hasError ? 'input-error' : ''}`}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter your password"
                    />
                    {hasError && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.password}</span>
                        </label>
                    )}
                </div>

                {/* Actions */}
                <div className="modal-action">
                    <button type="button" onClick={onClose} className="btn btn-ghost">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-error" disabled={processing}>
                        {processing && <span className="loading loading-spinner loading-sm"></span>}
                        <Trash2 size={18} />
                        Delete Account
                    </button>
                </div>
            </form>
        </Modal>
    );
}

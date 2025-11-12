import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';

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

    const confirmDeletion = () => setConfirmingDeletion(true);
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
                    {/* Header */}
                    <h3 className="card-title text-2xl text-error">Delete Account</h3>
                    <p className="text-base-content/70">
                        Once deleted, all resources and data will be permanently removed. Please download any data you wish to retain.
                    </p>

                    {/* Action */}
                    <button onClick={confirmDeletion} className="btn btn-error self-end mt-10">
                        <Trash2 size={18} />
                        Delete Account
                    </button>
                </div>
            </div>

            <DeleteAccountModal
                open={confirmingDeletion}
                onClose={closeModal}
                onSubmit={deleteAccount}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                passwordRef={passwordInput}
            />
        </>
    );
}

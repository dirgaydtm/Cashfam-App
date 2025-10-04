import { useForm } from '@inertiajs/react';
import { Key } from 'lucide-react';
import Modal from '@/Layouts/Modal';

interface JoinBookModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinBookModal({ isOpen, onClose }: JoinBookModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        invitation_code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 🔴 TODO-BE: Implementasi backend untuk join book dengan kode
        // post(route('books.join'), {
        //     onSuccess: () => {
        //         reset();
        //         onClose();
        //     }
        // });

        console.log('Joining book with code:', data.invitation_code);
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Gabung Buku Keuangan" size="small">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Kode Undangan</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Masukkan kode undangan"
                            className={`input input-bordered w-full pl-10 uppercase ${errors.invitation_code ? 'input-error' : ''}`}
                            value={data.invitation_code}
                            onChange={(e) => setData('invitation_code', e.target.value.toUpperCase())}
                            maxLength={8}
                            required
                        />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                    </div>
                    {errors.invitation_code && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.invitation_code}</span>
                        </label>
                    )}
                    <label className="label">
                        <span className="label-text-alt text-base-content/60">
                            Masukkan kode 8 karakter yang diberikan oleh admin buku
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleClose}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={processing || data.invitation_code.length < 8}
                    >
                        {processing && <span className="loading loading-spinner loading-sm"></span>}
                        Gabung
                    </button>
                </div>
            </form>
        </Modal>
    );
}

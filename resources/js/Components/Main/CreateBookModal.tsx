import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { DollarSign, FileText } from 'lucide-react';
import Modal from '@/Layouts/Modal';

interface CreateBookFormData {
    name: string;
    description: string;
    budget?: number;
}

interface CreateBookModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateBookModal({ isOpen, onClose }: CreateBookModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<CreateBookFormData>({
        name: '',
        description: '',
        budget: undefined,
    });

    const [showBudget, setShowBudget] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 🔴 TODO-BE: Implementasi backend untuk create book SUDAH LAE
        post(route('books.store'), {
            onSuccess: () => {
                reset();
                onClose();
                router.reload({ only: ['userBooks'] });
            }
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Buat Buku Keuangan" size="small">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Nama Buku</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="contoh: Anggaran Keluarga 2024"
                            className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                    </div>
                    {errors.name && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.name}</span>
                        </label>
                    )}
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Deskripsi</span>
                    </label>
                    <textarea
                        className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
                        placeholder="Deskripsi singkat buku keuangan ini..."
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={3}
                    />
                    {errors.description && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.description}</span>
                        </label>
                    )}
                </div>

                <div className="form-control">
                    <label className="cursor-pointer label">
                        <span className="label-text font-medium flex items-center gap-2">
                            <DollarSign size={16} />
                            Atur Anggaran Bulanan
                        </span>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={showBudget}
                            onChange={(e) => setShowBudget(e.target.checked)}
                        />
                    </label>
                </div>

                {showBudget && (
                    <div className="form-control">
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Masukkan jumlah anggaran"
                                className={`input input-bordered w-full pl-8 ${errors.budget ? 'input-error' : ''}`}
                                value={data.budget || ''}
                                onChange={(e) => setData('budget', e.target.value ? Number(e.target.value) : undefined)}
                                min="0"
                                step="0.01"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
                                Rp
                            </span>
                        </div>
                        {errors.budget && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.budget}</span>
                            </label>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-8">
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
                        disabled={processing}
                    >
                        {processing && <span className="loading loading-spinner loading-sm"></span>}
                        Buat Buku
                    </button>
                </div>
            </form>
        </Modal>
    );
}

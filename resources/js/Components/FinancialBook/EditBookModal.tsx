import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, DollarSign, FileText, Trash2 } from 'lucide-react';

import type { FinancialBook, BookSettingsFormData } from '@/types';

interface EditBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
    currentUserRole: 'creator' | 'admin' | 'member';
}

export default function EditBookModal({ isOpen, onClose, book, currentUserRole }: EditBookModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm<BookSettingsFormData>({
        name: '',
        description: '',
        budget: undefined,
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (book) {
            setData({
                name: book.name,
                description: book.description,
                budget: book.budget,
            });
        }
    }, [book]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!book) return;

        // For now, just log the data since we're using dummy data
        console.log('Updating book with data:', data);

        // In real implementation, this would be:
        // put(route('books.update', book.id), {
        //     onSuccess: () => {
        //         onClose();
        //     }
        // });

        // For demo, just close the modal
        onClose();
    };

    const handleDelete = () => {
        if (!book) return;

        // For now, just log the action
        console.log('Deleting book:', book.id);

        // In real implementation, this would be:
        // router.delete(route('books.destroy', book.id), {
        //     onSuccess: () => {
        //         onClose();
        //     }
        // });

        // For demo, just close the modal
        onClose();
    };

    const handleClose = () => {
        reset();
        setShowDeleteConfirm(false);
        onClose();
    };

    const canEdit = currentUserRole === 'creator' || currentUserRole === 'admin';
    const canDelete = currentUserRole === 'creator';

    if (!isOpen || !book) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-base-content">Book Settings</h3>
                    <button
                        onClick={handleClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <X size={18} />
                    </button>
                </div>

                {!canEdit ? (
                    /* Read-only view for members */
                    <div className="space-y-6">
                        <div className="alert alert-info">
                            <span>You can only view book details. Contact an admin to make changes.</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Book Name</span>
                                </label>
                                <div className="input input-bordered w-full bg-base-200" tabIndex={-1}>
                                    {book.name}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Description</span>
                                </label>
                                <div className="textarea textarea-bordered w-full bg-base-200 min-h-[80px]" tabIndex={-1}>
                                    {book.description}
                                </div>
                            </div>



                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Currency</span>
                                </label>
                                <div className="input input-bordered w-full bg-base-200" tabIndex={-1}>
                                    Indonesian Rupiah (IDR)
                                </div>
                            </div>

                            {book.budget && (
                                <div>
                                    <label className="label">
                                        <span className="label-text font-medium">Monthly Budget</span>
                                    </label>
                                    <div className="input input-bordered w-full bg-base-200" tabIndex={-1}>
                                        Rp{book.budget.toLocaleString('id-ID')}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Editable form for creators and admins */
                    <div>
                        {showDeleteConfirm ? (
                            /* Delete confirmation */
                            <div className="space-y-6">
                                <div className="alert alert-error">
                                    <Trash2 size={20} />
                                    <div>
                                        <h4 className="font-semibold">Delete Financial Book</h4>
                                        <p className="text-sm">This action cannot be undone. All transactions and member data will be permanently deleted.</p>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Type "{book.name}" to confirm:</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered"
                                        placeholder={book.name}
                                    />
                                </div>

                                <div className="modal-action">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-error"
                                        onClick={handleDelete}
                                    >
                                        Delete Book
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Edit form */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Book Name */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Book Name</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
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

                                {/* Description */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Description</span>
                                    </label>
                                    <textarea
                                        className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
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

                                {/* Budget */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium flex items-center gap-2">
                                            <DollarSign size={16} />
                                            Monthly Budget (Optional)
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Leave empty for no budget limit"
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

                                {/* Danger Zone - Only for creators */}
                                {canDelete && (
                                    <div className="card bg-error/10 border border-error/20">
                                        <div className="card-body p-4">
                                            <h4 className="card-title text-error text-base">Danger Zone</h4>
                                            <p className="text-sm text-base-content/70 mb-4">
                                                Permanently delete this financial book and all its data.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-error btn-sm"
                                                onClick={() => setShowDeleteConfirm(true)}
                                            >
                                                <Trash2 size={16} />
                                                Delete Book
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="modal-action">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        {processing && <span className="loading loading-spinner loading-sm"></span>}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

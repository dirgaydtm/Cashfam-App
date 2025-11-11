import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import Modal from '@/Layouts/Modal';
import type { FinancialBook } from '@/types';
import { router } from '@inertiajs/react';

interface DeleteBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
}

export default function DeleteBookModal({ isOpen, onClose, book }: DeleteBookModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!book) return null;

    const handleDelete = () => {
        setIsDeleting(true);

        router.delete(route('books.destroy', book.id), {
            onSuccess: () => {
                onClose();
            },
            onError: (errors) => {
                console.error('Delete book failed:', errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleClose = () => {
        if (!isDeleting) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            showCloseButton={false}
            title={
                <div className="flex items-center gap-2 text-error">
                    <Trash2 size={20} />
                    Delete Book
                </div>
            }
        >
            <div className="space-y-6">
                {/* Book Info */}
                <div className="space-y-2">
                    <p className="text-sm text-base-content/70">
                        You are about to delete the following book:
                    </p>
                    <div className="card bg-base-200 border border-error/20">
                        <div className="card-body p-4">
                            <h4 className="font-semibold text-lg">{book.name}</h4>
                            <div className="text-xs text-base-content/50 mt-2">
                                {book.members.length} member{book.members.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        className="btn btn-ghost"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-error"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Trash2 size={20} />
                                Delete Book
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

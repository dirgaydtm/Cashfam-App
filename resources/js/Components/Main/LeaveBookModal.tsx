import { AlertTriangle, LogOut } from 'lucide-react';
import Modal from '@/Layouts/Modal';
import { useForm,router } from '@inertiajs/react';
import { useState } from 'react';
import type { FinancialBook } from '@/types';

interface LeaveBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
    onSuccess?: () => void; // Optional callback after successful leave
}

export default function LeaveBookModal({ isOpen, onClose, book, onSuccess }: LeaveBookModalProps) {
    // const [isLoading, setIsLoading] = useState(false);

    const { post, processing, errors } = useForm({});
    const [specificError, setSpecificError] = useState<string | null>(null);

    const handleLeaveBook = () => {
        if (!book) return;

        // setIsLoading(true);

        // 🔴 TODO-BE: Implementasi backend untuk leave book
       post(route('books.leave', book.id), {
            onSuccess: () => {
                onClose();
                onSuccess?.();
                // Redirect di sini dihapus karena backend sudah me-redirect ke books.index
            },
            // TANGKAP ERROR DARI BACKEND
            onError: (formErrors) => {
                // Error 'error' dikirim dari backend, kita tampilkan
                const backendError = formErrors.error;
                
                if (backendError) {
                    setSpecificError(backendError);
                } else {
                    // Jika ada error lain yang tidak kita antisipasi
                    setSpecificError('Terjadi kesalahan saat mencoba meninggalkan buku.');
                    console.error('Failed to leave book:', formErrors);
                }
            }
        });

        // Temporary: simulate API call (comment this when backend ready)
        // setTimeout(() => {
        //     console.log('Leaving book:', book.name);
        //     setIsLoading(false);
        //     onClose();
        //     onSuccess?.();
        // }, 1000);
    };
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="bg-error/10 p-3 rounded-full">
                        <AlertTriangle className="text-error" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-error">Leave Book</h3>
                        <p className="text-sm text-base-content/70">This action cannot be undone</p>
                    </div>
                </div>
            }
            showCloseButton={false}
        >
            <div className="space-y-4 mb-8">
                {specificError && (
                    <div role="alert" className="alert alert-error">
                        <AlertTriangle size={20} />
                        <span className="text-sm font-medium">{specificError}</span>
                    </div>
                )}
                <div className="bg-base-200 p-4 rounded-lg">
                    <p className="font-medium text-base-content/90">
                        You're about to leave:
                    </p>
                    <p className="font-bold text-lg text-primary mt-1">
                        "{book?.name}"
                    </p>
                </div>

                <div className="alert alert-warning">
                    <AlertTriangle size={20} />
                    <div className="text-sm">
                        <p className="font-medium">Warning:</p>
                        <p>You will lose access to all transactions and data in this book. You'll need to be re-invited to join again.</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 justify-end">
                <button
                    className="btn btn-outline btn-sm md:btn-md px-6"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-error btn-sm md:btn-md px-6"
                    onClick={handleLeaveBook}
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Leaving...
                        </>
                    ) : (
                        <>
                            <LogOut size={16} />
                            Leave Book
                        </>
                    )}
                </button>
            </div>
        </Modal>
    );
}
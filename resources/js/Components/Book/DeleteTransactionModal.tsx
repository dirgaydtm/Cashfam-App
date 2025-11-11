import { useState } from 'react';
import { Trash2, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import Modal from '@/Layouts/Modal';
import type { Transaction } from '@/types';
import { formatRupiah } from '@/utils/currency';

interface DeleteTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    onDelete: (transaction: Transaction) => Promise<void>;
}

export default function DeleteTransactionModal({
    isOpen,
    onClose,
    transaction,
    onDelete
}: DeleteTransactionModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!transaction) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(transaction);
            onClose();
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleting(false);
        }
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
                    Delete Transaction
                </div>
            }
        >
            <div className="space-y-6">
                {/* Transaction Info */}
                <div className="space-y-2">
                    <p className="text-sm text-base-content/70">
                        Transaction details:
                    </p>
                    <div className="card bg-base-200 border border-error/20">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-full ${transaction.type === 'income'
                                        ? 'bg-success/10 text-success'
                                        : 'bg-error/10 text-error'
                                        }`}
                                >
                                    {transaction.type === 'income' ? (
                                        <TrendingUp size={24} />
                                    ) : (
                                        <TrendingDown size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold">
                                        {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
                                    </h4>
                                    <p className="text-sm text-base-content/60">{transaction.description}</p>
                                    <p className="text-xs text-base-content/50">{transaction.category}</p>
                                </div>
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
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

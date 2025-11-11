import React from 'react';
import type { Transaction } from '@/types';
import { formatRupiah } from '@/utils/currency';
import { CheckCircle, TrendingDown, TrendingUp, X, XCircle, Trash2 } from 'lucide-react';

// Types
interface TransactionDetailProps {
    transaction: Transaction;
    onClose: () => void;
    canApprove: boolean;
    canDelete: boolean;
    onApprove: (transaction: Transaction) => void;
    onReject: (transaction: Transaction) => void;
    onDelete: () => void;
}

// Helper Function
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
};

// Status Badge Component
function StatusBadge({ status }: { status: Transaction['status'] }) {
    if (status === 'pending') {
        return null; // No badge for pending status
    }

    const badges = {
        approved: { className: 'badge-success', icon: CheckCircle, label: 'Approved' },
        rejected: { className: 'badge-error', icon: XCircle, label: 'Rejected' },
    };

    const badge = badges[status as 'approved' | 'rejected'];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
        <div className={`badge ${badge.className} badge-sm gap-1`}>
            <Icon size={12} />
            {badge.label}
        </div>
    );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-base-content/60">{label}:</span>
            <span>{value}</span>
        </div>
    );
}

// Transaction Detail Component
export default function TransactionDetail({
    transaction,
    onClose,
    canApprove,
    canDelete,
    onApprove,
    onReject,
    onDelete,
}: TransactionDetailProps) {
    const isIncome = transaction.type === 'income';
    const isPending = transaction.status === 'pending';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">Transaction Details</h3>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className={`p-3 rounded-full ${isIncome ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                    }`}
                            >
                                {isIncome ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold">
                                    {isIncome ? '+' : '-'}
                                    {formatRupiah(transaction.amount)}
                                </h4>
                                <p className="text-base-content/60">{transaction.category}</p>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h5 className="font-semibold mb-2">Details</h5>
                            <div className="space-y-2 text-sm">
                                <DetailRow label="Description" value={transaction.description} />
                                <DetailRow label="Date" value={formatDate(transaction.date)} />
                                <DetailRow label="Added by" value={transaction.user.name} />
                                <DetailRow label="Created" value={formatDate(transaction.created_at)} />
                            </div>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-2">Status</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-base-content/60">Status:</span>
                                    <StatusBadge status={transaction.status} />
                                </div>
                                {transaction.approved_by && (
                                    <DetailRow
                                        label={transaction.status === 'approved' ? 'Approved by' : 'Rejected by'}
                                        value={(transaction.approved_by as any).name || 'Admin'}
                                    />
                                )}
                                <DetailRow label="Last updated" value={formatDate(transaction.updated_at)} />
                            </div>
                        </div>
                    </div>

                    {isPending && canApprove && (
                        <>
                            <div className="divider"></div>
                            <div className="flex gap-3">
                                <button
                                    className="btn btn-success btn-sm flex-1"
                                    onClick={() => onApprove(transaction)}
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                                <button
                                    className="btn btn-error btn-sm flex-1"
                                    onClick={() => onReject(transaction)}
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button className="btn btn-primary" onClick={onClose}>
                    Back to List
                </button>
                {canDelete && (
                    <button className="btn btn-error" onClick={onDelete}>
                        <Trash2 size={16} />
                        Delete Transaction
                    </button>
                )}
            </div>
        </div>
    );
}

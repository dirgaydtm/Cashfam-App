import React, { useMemo, useState } from 'react';
import type { FinancialBook, Transaction } from '@/types';
import { dummyTransactions, currentUser } from '@/data';
import { formatRupiah } from '@/utils/currency';
import { Calendar, CheckCircle, Search, TrendingDown, TrendingUp, User, X, XCircle } from 'lucide-react';

interface TransactionsSectionProps {
    book: FinancialBook;
}

// Status Badge Component (integrated)
function StatusBadge({ status }: { status: Transaction['status'] }) {
    switch (status) {
        case 'approved':
            return (
                <div className="badge badge-success badge-sm gap-1">
                    <CheckCircle size={12} />
                    Approved
                </div>
            );
        case 'rejected':
            return (
                <div className="badge badge-error badge-sm gap-1">
                    <XCircle size={12} />
                    Rejected
                </div>
            );
        case 'pending':
            return <div className="badge badge-warning badge-sm">Pending</div>;
        default:
            return <div className="badge badge-neutral badge-sm">{status}</div>;
    }
}

export default function TransactionsSection({ book }: TransactionsSectionProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const role: 'creator' | 'admin' | 'member' =
        book.members.find((m) => m.user.id === currentUser.id)?.role || 'member';
    const canApproveTransactions = role === 'creator' || role === 'admin';

    // 🔴 TODO-BE: Filter dan sorting seharusnya dilakukan di backend
    const bookTransactions = useMemo(() => {
        return dummyTransactions
            .filter((t) => t.book_id === book.id)
            .filter((t) => (filter === 'all' ? true : t.status === filter))
            .filter((t) => {
                if (!searchTerm) return true;
                return (
                    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.user.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [book.id, filter, searchTerm]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    // 🔴 TODO-BE: Implementasi approve/reject transaction
    const handleApprove = (t: Transaction) => {
        console.log('Approve transaction', t.id);
        // post(route('transactions.approve', t.id))
    };

    const handleReject = (t: Transaction) => {
        console.log('Reject transaction', t.id);
        // post(route('transactions.reject', t.id))
    };

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                {!selectedTransaction ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl">Transactions</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        className="input input-bordered w-full pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="select select-bordered"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {bookTransactions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar size={48} className="mx-auto text-base-content/30 mb-4" />
                                    <p className="text-base-content/60">No transactions found</p>
                                </div>
                            ) : (
                                bookTransactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="card bg-base-100 border hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedTransaction(t)}
                                    >
                                        <div className="card-body p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`p-2 rounded-full ${t.type === 'income'
                                                            ? 'bg-success/10 text-success'
                                                            : 'bg-error/10 text-error'
                                                            }`}
                                                    >
                                                        {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{t.description}</p>
                                                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                                                            <span>{t.category}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(t.date)}</span>
                                                            <span>•</span>
                                                            <div className="flex items-center gap-1">
                                                                <User size={12} />
                                                                {t.user.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p
                                                        className={`font-bold ${t.type === 'income' ? 'text-success' : 'text-error'
                                                            }`}
                                                    >
                                                        {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                                                    </p>
                                                    <StatusBadge status={t.status} />
                                                </div>
                                            </div>
                                            {t.status === 'pending' && canApproveTransactions && (
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        className="btn btn-success btn-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApprove(t);
                                                        }}
                                                    >
                                                        <CheckCircle size={14} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-error btn-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReject(t);
                                                        }}
                                                    >
                                                        <XCircle size={14} />
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xl">Transaction Details</h3>
                            <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setSelectedTransaction(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`p-3 rounded-full ${selectedTransaction.type === 'income'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-error/10 text-error'
                                                }`}
                                        >
                                            {selectedTransaction.type === 'income' ? (
                                                <TrendingUp size={24} />
                                            ) : (
                                                <TrendingDown size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">
                                                {selectedTransaction.type === 'income' ? '+' : '-'}{formatRupiah(selectedTransaction.amount)}
                                            </h4>
                                            <p className="text-base-content/60">{selectedTransaction.category}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={selectedTransaction.status} />
                                </div>

                                <div className="divider"></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-semibold mb-2">Details</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Description:</span>
                                                <span>{selectedTransaction.description}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Date:</span>
                                                <span>{new Date(selectedTransaction.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Added by:</span>
                                                <span>{selectedTransaction.user.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Created:</span>
                                                <span>{new Date(selectedTransaction.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold mb-2">Status</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Status:</span>
                                                <StatusBadge status={selectedTransaction.status} />
                                            </div>
                                            {selectedTransaction.approved_by && (
                                                <div className="flex justify-between">
                                                    <span className="text-base-content/60">
                                                        {selectedTransaction.status === 'approved' ? 'Approved by:' : 'Rejected by:'}
                                                    </span>
                                                    <span>{selectedTransaction.approved_by.name}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Last updated:</span>
                                                <span>{new Date(selectedTransaction.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {selectedTransaction.status === 'pending' && canApproveTransactions && (
                                    <>
                                        <div className="divider"></div>
                                        <div className="flex gap-3">
                                            <button
                                                className="btn btn-success btn-sm flex-1"
                                                onClick={() => handleApprove(selectedTransaction)}
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-error btn-sm flex-1"
                                                onClick={() => handleReject(selectedTransaction)}
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="btn btn-primary" onClick={() => setSelectedTransaction(null)}>
                                Back to List
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

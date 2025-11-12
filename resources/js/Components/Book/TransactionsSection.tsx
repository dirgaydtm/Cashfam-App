import React, { useMemo, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { FinancialBook, Transaction } from '@/types';
import { usePage } from '@inertiajs/react';
import { formatRupiah } from '@/utils/currency';
import { Calendar, CheckCircle, Search, TrendingDown, TrendingUp, User, X, XCircle } from 'lucide-react';
import TransactionDetail from './TransactionDetail';

// Types
interface TransactionsSectionProps {
    book: FinancialBook;
    onDeleteTransaction?: (transaction: Transaction) => void;
}

export interface TransactionsSectionRef {
    refetchTransactions: () => void;
}

type TransactionStatus = 'all' | 'pending' | 'approved' | 'rejected';
type ApiFeedback = { message: string; type: 'success' | 'error' };

// Helper Functions
const getCsrfToken = (): string => {
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
};

const matchesSearchTerm = (transaction: Transaction, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
        transaction.description.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.user.name.toLowerCase().includes(term)
    );
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
        <div className={`badge ${badge.className} font-medium badge-md py-3 gap-1`}>
            <Icon size={12} />
            {badge.label}
        </div>
    );
}

const TransactionsSection = forwardRef<TransactionsSectionRef, TransactionsSectionProps>(
    ({ book, onDeleteTransaction }, ref) => {
        // State
        const [transactions, setTransactions] = useState<Transaction[]>([]);
        const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
        const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
        const [filter, setFilter] = useState<TransactionStatus>('all');
        const [searchTerm, setSearchTerm] = useState('');
        const [apiFeedback, setApiFeedback] = useState<ApiFeedback | null>(null);
        const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

        // User Context
        const { auth } = usePage().props;
        const userRole: 'creator' | 'admin' | 'member' =
            book.members.find((m) => m.user.id === auth.user.id)?.role || 'creator';
        const canApproveTransactions = userRole === 'creator' || userRole === 'admin';

        // Fetch Transactions
        const fetchTransactions = useCallback(async () => {
            setIsLoadingTransactions(true);
            try {
                const response = await fetch(`/transactions?book_id=${book.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data.transactions || data);
                } else {
                    console.error('Failed to fetch transactions:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Network error during fetch:', error);
            } finally {
                setIsLoadingTransactions(false);
            }
        }, [book.id]);

        // Expose refetch method to parent
        useImperativeHandle(ref, () => ({
            refetchTransactions: fetchTransactions
        }));

        useEffect(() => {
            fetchTransactions();
        }, [fetchTransactions]);

        // Filtered & Sorted Transactions
        const filteredTransactions = useMemo(() => {
            return transactions
                .filter((t) => filter === 'all' || t.status === filter)
                .filter((t) => matchesSearchTerm(t, searchTerm))
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }, [transactions, filter, searchTerm]);

        // Handle Approve/Reject Transaction
        const handleAction = async (transaction: Transaction, action: 'approve' | 'reject') => {
            if (!canApproveTransactions) {
                setApiFeedback({
                    message: 'You do not have permission to approve/reject transactions.',
                    type: 'error'
                });
                return;
            }

            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                setApiFeedback({
                    message: 'Authentication token (CSRF) not found. Please refresh the page.',
                    type: 'error'
                });
                return;
            }

            setIsProcessingId(transaction.id);
            setApiFeedback(null);

            try {
                const response = await fetch(`/transactions/${transaction.id}/${action}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({ approved_by_user_id: auth.user.id }),
                });

                if (response.ok) {
                    const result = await response.json();
                    const actionVerb = action === 'approve' ? 'approved' : 'rejected';
                    setApiFeedback({
                        message: result.message || `Transaction successfully ${actionVerb}.`,
                        type: 'success'
                    });
                    fetchTransactions();
                    setSelectedTransaction(null);
                } else {
                    const errorData = await response.json();
                    const actionVerb = action === 'approve' ? 'approve' : 'reject';
                    setApiFeedback({
                        message: errorData.message || `Failed to ${actionVerb} transaction.`,
                        type: 'error'
                    });
                }
            } catch (error) {
                console.error('Transaction action error:', error);
                setApiFeedback({
                    message: 'A network or server error occurred while processing the request.',
                    type: 'error'
                });
            } finally {
                setIsProcessingId(null);
            }
        };

        const handleApprove = (transaction: Transaction) => handleAction(transaction, 'approve');
        const handleReject = (transaction: Transaction) => handleAction(transaction, 'reject');

        const canDeleteTransaction = (transaction: Transaction): boolean => {
            return userRole === 'creator' || userRole === 'admin' || transaction.user.id === auth.user.id;
        };


        return (
            <div className="card border border-base-content/30">
                <div className="card-body">
                    {apiFeedback && (
                        <div role="alert" className={`alert mb-4 ${apiFeedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                            {apiFeedback.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            <span className="whitespace-pre-wrap">{apiFeedback.message}</span>
                        </div>
                    )}

                    {!selectedTransaction ? (
                        <div className="space-y-6">
                            <h3 className="font-bold text-xl">Transactions</h3>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search transactions..."
                                        className="input input-bordered focus:outline-none w-full pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-1/2 z-1 -translate-y-1/2 text-base-content/40" size={18} />
                                </div>
                                <select className="select select-bordered focus:outline-none" value={filter} onChange={(e) => setFilter(e.target.value as TransactionStatus)}>
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {isLoadingTransactions ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex gap-4 p-4 border border-base-content/10 rounded-lg">
                                            <div className="skeleton h-12 w-12 rounded-full shrink-0"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="skeleton h-4 w-2/3"></div>
                                                <div className="skeleton h-3 w-1/3"></div>
                                            </div>
                                            <div className="skeleton h-4 w-20"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar size={48} className="mx-auto text-base-content/30 mb-4" />
                                    <p className="text-base-content/60">No transactions found</p>
                                </div>
                            ) : (
                                <div className="">
                                    {filteredTransactions.map((t) => {
                                        const isIncome = t.type === 'income';
                                        const isPending = t.status === 'pending';

                                        return (
                                            <div key={t.id} className="card bg-base-100 hover:bg-base-300 transition cursor-pointer" onClick={() => setSelectedTransaction(t)}>
                                                <div className="card-body">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-full ${isIncome ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                                                {isIncome ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{t.description}</p>
                                                                <div className="flex items-center gap-2 text-sm text-base-content/60">
                                                                    <span>{t.category}</span>
                                                                    <span>•</span>
                                                                    <span>{formatDate(t.date)}</span>
                                                                    <span>•</span>
                                                                    <User size={12} />
                                                                    <span>{t.user.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex gap-3 items-center">
                                                            <p className={`font-bold ${isIncome ? 'text-success' : 'text-error'}`}>
                                                                {isIncome ? '+' : '-'}{formatRupiah(t.amount)}
                                                            </p>
                                                            <StatusBadge status={t.status} />
                                                            {isPending && canApproveTransactions && (
                                                                <div className="flex gap-2">
                                                                    <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleApprove(t); }}>
                                                                        <CheckCircle size={14} />
                                                                        Approve
                                                                    </button>
                                                                    <button className="btn btn-error btn-sm" onClick={(e) => { e.stopPropagation(); handleReject(t); }}>
                                                                        <XCircle size={14} />
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <TransactionDetail
                            transaction={selectedTransaction}
                            onClose={() => setSelectedTransaction(null)}
                            canApprove={canApproveTransactions}
                            canDelete={canDeleteTransaction(selectedTransaction)}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={() => {
                                onDeleteTransaction?.(selectedTransaction);
                                setSelectedTransaction(null);
                            }}
                        />
                    )}
                </div>
            </div>
        );
    });

TransactionsSection.displayName = 'TransactionsSection';

export default TransactionsSection;

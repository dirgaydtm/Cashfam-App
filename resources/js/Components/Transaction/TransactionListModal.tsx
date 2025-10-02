import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, User, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { dummyTransactions, currentUser } from '@/data.js';
import type { FinancialBook, Transaction } from '@/types';
import { formatAmountWithSign } from '@/utils/currency';

interface TransactionListModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
    currentUserRole: 'creator' | 'admin' | 'member';
}

export default function TransactionListModal({ isOpen, onClose, book, currentUserRole }: TransactionListModalProps) {
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const canApproveTransactions = currentUserRole === 'creator' || currentUserRole === 'admin';

    if (!isOpen || !book) return null;

    // Filter transactions for this book
    const bookTransactions = dummyTransactions
        .filter(transaction => transaction.book_id === book.id)
        .filter(transaction => {
            if (filter === 'all') return true;
            return transaction.status === filter;
        })
        .filter(transaction => {
            if (!searchTerm) return true;
            return transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const currencySymbol = 'Rp';

    const handleApproveTransaction = (transaction: Transaction) => {
        console.log('Approving transaction:', transaction.id);
        // In real implementation:
        // post(route('transactions.approve', transaction.id))
    };

    const handleRejectTransaction = (transaction: Transaction) => {
        console.log('Rejecting transaction:', transaction.id);
        // In real implementation:
        // post(route('transactions.reject', transaction.id))
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <div className="badge badge-success badge-sm">Approved</div>;
            case 'rejected':
                return <div className="badge badge-error badge-sm">Rejected</div>;
            case 'pending':
                return <div className="badge badge-warning badge-sm">Pending</div>;
            default:
                return <div className="badge badge-neutral badge-sm">{status}</div>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatAmount = (amount: number, type: string) => {
        return formatAmountWithSign(amount, type as 'income' | 'expense');
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
                {selectedTransaction ? (
                    /* Transaction Details View */
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xl text-base-content">Transaction Details</h3>
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${selectedTransaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                            }`}>
                                            {selectedTransaction.type === 'income' ?
                                                <TrendingUp size={24} /> :
                                                <TrendingDown size={24} />
                                            }
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold">
                                                {formatAmount(selectedTransaction.amount, selectedTransaction.type)}
                                            </h4>
                                            <p className="text-base-content/60">{selectedTransaction.category}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(selectedTransaction.status)}
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
                                                <span>{formatDate(selectedTransaction.date)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Added by:</span>
                                                <span>{selectedTransaction.user.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Created:</span>
                                                <span>{formatDate(selectedTransaction.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="font-semibold mb-2">Status</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Status:</span>
                                                {getStatusBadge(selectedTransaction.status)}
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
                                                <span>{formatDate(selectedTransaction.updated_at)}</span>
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
                                                onClick={() => handleApproveTransaction(selectedTransaction)}
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-error btn-sm flex-1"
                                                onClick={() => handleRejectTransaction(selectedTransaction)}
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
                            <button
                                className="btn btn-primary"
                                onClick={() => setSelectedTransaction(null)}
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Transaction List View */
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-xl text-base-content">Transactions</h3>
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Book Info */}
                        <div className="card bg-base-200">
                            <div className="card-body p-4">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <h4 className="font-semibold">{book.name}</h4>
                                        <p className="text-sm text-base-content/60">
                                            {bookTransactions.length} transaction{bookTransactions.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
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
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
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

                        {/* Transaction List */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {bookTransactions.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar size={48} className="mx-auto text-base-content/30 mb-4" />
                                    <p className="text-base-content/60">No transactions found</p>
                                </div>
                            ) : (
                                bookTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="card bg-base-100 border hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedTransaction(transaction)}
                                    >
                                        <div className="card-body p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                                        }`}>
                                                        {transaction.type === 'income' ?
                                                            <TrendingUp size={20} /> :
                                                            <TrendingDown size={20} />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{transaction.description}</p>
                                                        <div className="flex items-center gap-2 text-sm text-base-content/60">
                                                            <span>{transaction.category}</span>
                                                            <span>•</span>
                                                            <span>{formatDate(transaction.date)}</span>
                                                            <span>•</span>
                                                            <div className="flex items-center gap-1">
                                                                <User size={12} />
                                                                {transaction.user.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-error'
                                                        }`}>
                                                        {formatAmount(transaction.amount, transaction.type)}
                                                    </p>
                                                    {getStatusBadge(transaction.status)}
                                                </div>
                                            </div>

                                            {transaction.status === 'pending' && canApproveTransactions && (
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        className="btn btn-success btn-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApproveTransaction(transaction);
                                                        }}
                                                    >
                                                        <CheckCircle size={14} />
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-error btn-xs"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRejectTransaction(transaction);
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

                        {/* Summary */}
                        {bookTransactions.length > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="stat bg-base-200 rounded-lg">
                                    <div className="stat-title text-xs">Total Income</div>
                                    <div className="stat-value text-success text-sm">
                                        {currencySymbol}{bookTransactions
                                            .filter(t => t.type === 'income' && t.status === 'approved')
                                            .reduce((sum, t) => sum + t.amount, 0)
                                            .toLocaleString()
                                        }
                                    </div>
                                </div>
                                <div className="stat bg-base-200 rounded-lg">
                                    <div className="stat-title text-xs">Total Expenses</div>
                                    <div className="stat-value text-error text-sm">
                                        {currencySymbol}{bookTransactions
                                            .filter(t => t.type === 'expense' && t.status === 'approved')
                                            .reduce((sum, t) => sum + t.amount, 0)
                                            .toLocaleString()
                                        }
                                    </div>
                                </div>
                                <div className="stat bg-base-200 rounded-lg">
                                    <div className="stat-title text-xs">Net Balance</div>
                                    <div className="stat-value text-sm">
                                        {(() => {
                                            const income = bookTransactions
                                                .filter(t => t.type === 'income' && t.status === 'approved')
                                                .reduce((sum, t) => sum + t.amount, 0);
                                            const expenses = bookTransactions
                                                .filter(t => t.type === 'expense' && t.status === 'approved')
                                                .reduce((sum, t) => sum + t.amount, 0);
                                            const net = income - expenses;
                                            return (
                                                <span className={net >= 0 ? 'text-success' : 'text-error'}>
                                                    {net >= 0 ? '+' : ''}{currencySymbol}{net.toLocaleString()}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Close Button */}
                        <div className="modal-action">
                            <button
                                className="btn btn-primary w-full"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

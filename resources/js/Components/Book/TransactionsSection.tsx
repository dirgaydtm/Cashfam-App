import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { FinancialBook, Transaction } from '@/types';
import { dummyTransactions, currentUser } from '@/data';
import { formatRupiah } from '@/utils/currency';
import { Calendar, CheckCircle, Search, TrendingDown, TrendingUp, User, X, XCircle } from 'lucide-react';


interface TransactionsSectionProps {
    book: FinancialBook;
}

const getCsrfToken = (): string => {
    // Membaca XSRF-TOKEN dari cookie Laravel
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
    if (match) {
        return decodeURIComponent(match[2]);
    }
    return '';
};

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
    const [transactions, setTransactions] = useState<Transaction[]>([]); // Data dari API
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true); // Status loading
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [apiFeedback, setApiFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null); // Feedback approve/reject
    const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

    const role: 'creator' | 'admin' | 'member' =
        book.members.find((m) => m.user.id === currentUser.id)?.role || 'creator';
    const canApproveTransactions = role === 'creator' || role === 'admin';

    const fetchTransactions = useCallback(async () => {
        setIsLoadingTransactions(true);
        try {
            // Asumsi endpoint untuk mengambil transaksi buku adalah /transactions?book_id={id}
            const response = await fetch(`/transactions?book_id=${book.id}`);
            if (response.ok) {
                const data = await response.json();
                // Mengasumsikan respons API mengembalikan array transaksi
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

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // 🔴 TODO-BE: Filter dan sorting seharusnya dilakukan di backend
    const bookTransactions = useMemo(() => {
        return transactions // Menggunakan state transactions
            .filter((t) => (filter === 'all' ? true : t.status === filter))
            .filter((t) => {
                if (!searchTerm) return true;
                return (
                    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.user.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            })
            // Sortir data di frontend sementara kita belum punya orderBy di API
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); 
    }, [transactions, filter, searchTerm]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    // 🔴 TODO-BE: Implementasi approve/reject transaction
    const handleAction = async (t: Transaction, action: 'approve' | 'reject') => {
        if (!canApproveTransactions) {
            setApiFeedback({ message: 'Anda tidak memiliki izin untuk menyetujui/menolak transaksi.', type: 'error' });
            return;
        }
        
        setIsProcessingId(t.id);
        setApiFeedback(null);
        const csrfToken = getCsrfToken();
        
        if (!csrfToken) {
             setApiFeedback({ message: 'Token autentikasi (CSRF) tidak ditemukan. Coba refresh halaman.', type: 'error' });
             setIsProcessingId(null);
             return;
        }

        try {
            // Endpoint: /transactions/{id}/approve atau /transactions/{id}/reject
            const url = `/transactions/${t.id}/${action}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // SOLUSI 419: Tambahkan Header X-XSRF-TOKEN
                    'X-XSRF-TOKEN': csrfToken, 
                },
                // Mengirim user_id yang melakukan persetujuan/penolakan
                body: JSON.stringify({ approved_by_user_id: currentUser.id }), 
            });

            if (response.ok) {
                const result = await response.json();
                const actionVerb = action === 'approve' ? 'disetujui' : 'ditolak';
                setApiFeedback({ 
                    message: result.message || `Transaksi berhasil di${actionVerb}.`, 
                    type: 'success' 
                });
                // Ambil ulang data untuk pembaruan real-time
                fetchTransactions(); 
                setSelectedTransaction(null); // Tutup detail view
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData); 
                
                let errorMessage = `Gagal me${action === 'approve' ? 'nyetujui' : 'nolak'} transaksi.`;
                if (errorData.message) {
                    errorMessage = `Gagal: ${errorData.message}`;
                }
                
                setApiFeedback({ message: errorMessage, type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setApiFeedback({ message: 'Terjadi kesalahan jaringan atau server saat memproses permintaan.', type: 'error' });
        } finally {
            setIsProcessingId(null);
        }   
    };
    
    // Wrapper functions
    const handleApprove = (t: Transaction) => handleAction(t, 'approve');
    const handleReject = (t: Transaction) => handleAction(t, 'reject');


    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                {/* IZIN KETUA :) */}
                {/* 3. Menampilkan Feedback API */}
                {apiFeedback && (
                    <div role="alert" className={`alert ${apiFeedback.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                        {apiFeedback.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <span className='whitespace-pre-wrap'>{apiFeedback.message}</span>
                    </div>
                )}
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

                        {/* IZIN KETUA*/}
                        {/* 4. Menampilkan Loading State saat mengambil data */}
                        {isLoadingTransactions ? (
                            <div className="text-center py-8">
                                <span className="loading loading-spinner loading-lg text-primary"></span>
                                <p className="text-base-content/60 mt-2">Memuat transaksi...</p>
                            </div>
                        ) : (
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
                        )}
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
                                                    {/* Asumsi approved_by adalah objek user dengan properti name */}
                                                    <span>{(selectedTransaction.approved_by as any).name || 'Admin'}</span>
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

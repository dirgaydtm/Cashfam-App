import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Users, DollarSign, TrendingUp, TrendingDown, Settings, Calendar, MoreVertical, Share, Target } from 'lucide-react';
import { dummyFinancialBooks, currentUser, dummyTransactions } from '@/data';
import type { FinancialBook, Transaction } from '@/types';
import { formatRupiah } from '@/utils/currency';
import CreateBookModal from '@/Components/FinancialBook/CreateBookModal';
import EditBookModal from '@/Components/FinancialBook/EditBookModal';
import InvitationModal from '@/Components/Collaboration/InvitationModal';
import MembersModal from '@/Components/Collaboration/MembersModal';
import AddTransactionModal from '@/Components/Transaction/AddTransactionModal';
import TransactionListModal from '@/Components/Transaction/TransactionListModal';
import BudgetSetupModal from '@/Components/Settings/BudgetSetupModal';

export default function Dashboard() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<FinancialBook | null>(null);
    const [invitationBook, setInvitationBook] = useState<FinancialBook | null>(null);
    const [membersBook, setMembersBook] = useState<FinancialBook | null>(null);
    const [transactionBook, setTransactionBook] = useState<FinancialBook | null>(null);
    const [addTransactionBook, setAddTransactionBook] = useState<FinancialBook | null>(null);
    const [budgetBook, setBudgetBook] = useState<FinancialBook | null>(null);

    // Filter books where current user is a member
    const userBooks = dummyFinancialBooks.filter(book =>
        book.members.some(member => member.user.id === currentUser.id)
    );

    // Get recent transactions for current user
    const recentTransactions = dummyTransactions
        .filter(transaction => transaction.user_id === currentUser.id)
        .slice(0, 5);

    // Calculate stats
    const totalBooksCount = userBooks.length;
    const pendingTransactionsCount = dummyTransactions.filter(t => t.status === 'pending').length;

    const formatCurrency = (amount: number) => {
        return formatRupiah(amount);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">
                            Selamat datang kembali, {currentUser.name}
                        </h1>
                        <p className="text-base-content/60 mt-1">
                            Kelola keuangan kolaboratif Anda
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-2">
                        <button
                            className="btn btn-primary gap-2"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus size={20} />
                            Buat Buku Keuangan
                        </button>
                        {userBooks.length > 0 && (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-secondary gap-2">
                                    <Plus size={20} />
                                    Tambah Cepat
                                </div>
                                <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                    {userBooks.slice(0, 3).map((book) => (
                                        <li key={book.id}>
                                            <a onClick={() => setAddTransactionBook(book)}>
                                                Tambah ke {book.name}
                                            </a>
                                        </li>
                                    ))}
                                    {userBooks.length > 3 && (
                                        <li><a className="text-base-content/60">+{userBooks.length - 3} buku lainnya</a></li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial Books Grid */}
                <div>
                    <h2 className="text-2xl font-semibold text-base-content mb-4">Buku Keuangan Anda</h2>

                    {userBooks.length === 0 ? (
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body text-center py-12">
                                <DollarSign size={64} className="mx-auto text-base-content/30 mb-4" />
                                <h3 className="text-xl font-semibold text-base-content mb-2">Belum ada buku keuangan</h3>
                                <p className="text-base-content/60 mb-6">
                                    Buat buku keuangan pertama Anda untuk mulai berkolaborasi dengan orang lain
                                </p>
                                <button
                                    className="btn btn-primary gap-2"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    <Plus size={20} />
                                    Buat Buku Pertama Anda
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userBooks.map((book: FinancialBook) => {
                                const userRole = book.members.find(m => m.user.id === currentUser.id)?.role;
                                const bookTransactions = dummyTransactions.filter(t => t.book_id === book.id);
                                const totalExpenses = bookTransactions
                                    .filter(t => t.type === 'expense' && t.status === 'approved')
                                    .reduce((sum, t) => sum + t.amount, 0);
                                const totalIncome = bookTransactions
                                    .filter(t => t.type === 'income' && t.status === 'approved')
                                    .reduce((sum, t) => sum + t.amount, 0);

                                return (
                                    <div key={book.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="card-body">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="card-title text-lg">{book.name}</h3>
                                                    <p className="text-base-content/60 text-sm">{book.description}</p>
                                                </div>
                                                <div className="dropdown dropdown-end">
                                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                                                        <MoreVertical size={16} />
                                                    </div>
                                                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                                        <li>
                                                            <a onClick={() => setTransactionBook(book)}>
                                                                <Calendar size={16} />
                                                                Lihat Transaksi
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={() => setAddTransactionBook(book)}>
                                                                <Plus size={16} />
                                                                Tambah Transaksi
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={() => setMembersBook(book)}>
                                                                <Users size={16} />
                                                                Kelola Anggota
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={() => setInvitationBook(book)}>
                                                                <Share size={16} />
                                                                Undang Anggota
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a onClick={() => setBudgetBook(book)}>
                                                                <Target size={16} />
                                                                Atur Anggaran
                                                            </a>
                                                        </li>
                                                        {(userRole === 'creator' || userRole === 'admin') && (
                                                            <li>
                                                                <a onClick={() => setEditingBook(book)}>
                                                                    <Settings size={16} />
                                                                    Pengaturan
                                                                </a>
                                                            </li>
                                                        )}
                                                        <li><a className="text-error">Keluar dari Buku</a></li>
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Members */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <Users size={16} className="text-base-content/60" />
                                                <div className="avatar-group -space-x-2">
                                                    {book.members.slice(0, 3).map((member, index) => (
                                                        <div key={member.id} className="avatar placeholder">
                                                            <div className="w-8 rounded-full bg-neutral text-neutral-content text-xs">
                                                                <span>{member.user.name.charAt(0)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {book.members.length > 3 && (
                                                        <div className="avatar placeholder">
                                                            <div className="w-8 rounded-full bg-base-300 text-base-content text-xs">
                                                                <span>+{book.members.length - 3}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm text-base-content/60">
                                                    {book.members.length} anggota
                                                </span>
                                            </div>

                                            {/* Budget & spending */}
                                            {book.budget && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Anggaran</span>
                                                        <span>{formatCurrency(book.budget)}</span>
                                                    </div>
                                                    <progress
                                                        className="progress progress-primary w-full"
                                                        value={totalExpenses}
                                                        max={book.budget}
                                                    ></progress>
                                                    <div className="flex justify-between text-xs text-base-content/60 mt-1">
                                                        <span>Dibelanjakan: {formatCurrency(totalExpenses)}</span>
                                                        <span>{Math.round((totalExpenses / book.budget) * 100)}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Financial summary */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-success">
                                                        <TrendingUp size={16} />
                                                        <span className="text-sm font-medium">Pemasukan</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-success">
                                                        {formatCurrency(totalIncome)}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-error">
                                                        <TrendingDown size={16} />
                                                        <span className="text-sm font-medium">Pengeluaran</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-error">
                                                        {formatCurrency(totalExpenses)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Role badge */}
                                            <div className="flex justify-between items-center">
                                                <div className={`badge ${userRole === 'creator' ? 'badge-primary' :
                                                    userRole === 'admin' ? 'badge-secondary' : 'badge-neutral'
                                                    }`}>
                                                    {userRole === 'creator' ? 'Pembuat' : userRole === 'admin' ? 'Admin' : 'Anggota'}
                                                </div>
                                                <div className="card-actions">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => setTransactionBook(book)}
                                                    >
                                                        Lihat Transaksi
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CreateBookModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditBookModal
                isOpen={!!editingBook}
                onClose={() => setEditingBook(null)}
                book={editingBook}
                currentUserRole={editingBook ? editingBook.members.find(m => m.user.id === currentUser.id)?.role || 'member' : 'member'}
            />

            <InvitationModal
                isOpen={!!invitationBook}
                onClose={() => setInvitationBook(null)}
                book={invitationBook}
            />

            <MembersModal
                isOpen={!!membersBook}
                onClose={() => setMembersBook(null)}
                book={membersBook}
                currentUserRole={membersBook ? membersBook.members.find(m => m.user.id === currentUser.id)?.role || 'member' : 'member'}
            />

            <AddTransactionModal
                isOpen={!!addTransactionBook}
                onClose={() => setAddTransactionBook(null)}
                book={addTransactionBook}
            />

            <TransactionListModal
                isOpen={!!transactionBook}
                onClose={() => setTransactionBook(null)}
                book={transactionBook}
                currentUserRole={transactionBook ? transactionBook.members.find(m => m.user.id === currentUser.id)?.role || 'member' : 'member'}
            />

            <BudgetSetupModal
                isOpen={!!budgetBook}
                onClose={() => setBudgetBook(null)}
                book={budgetBook}
            />
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, DollarSign, LogIn } from 'lucide-react';
import { dummyFinancialBooks, currentUser, dummyTransactions } from '@/data';
import type { FinancialBook } from '@/types';
import CreateBookModal from '@/Components/Main/CreateBookModal';
import JoinBookModal from '@/Components/Main/JoinBookModal';
import MembersModal from '@/Components/MembersModal';
import BookCard from '@/Components/Main/BookCard';

export default function Dashboard() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [membersBook, setMembersBook] = useState<FinancialBook | null>(null);

    const userBooks = dummyFinancialBooks.filter(book =>
        book.members.some(member => member.user.id === currentUser.id)
    );

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold leading-tight text-base-content/90">
                Dashboard
            </h2>
        }>
            <Head title="Dashboard" />

            <div className="space-y-6">
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
                            Buat Buku
                        </button>
                        <button
                            className="btn btn-secondary gap-2"
                            onClick={() => setIsJoinModalOpen(true)}
                        >
                            <LogIn size={20} />
                            Gabung
                        </button>
                    </div>
                </div>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {userBooks.map(book => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    currentUserId={currentUser.id}
                                    transactions={dummyTransactions}
                                    onManageMembers={(b) => setMembersBook(b)}
                                    onLeave={(b) => console.log('Leave book (member/admin) not implemented yet', b.id)}
                                    onDelete={(b) => console.log('Delete book (creator) not implemented yet', b.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateBookModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <JoinBookModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />

            <MembersModal
                isOpen={!!membersBook}
                onClose={() => setMembersBook(null)}
                book={membersBook}
            />
        </AuthenticatedLayout>
    );
}

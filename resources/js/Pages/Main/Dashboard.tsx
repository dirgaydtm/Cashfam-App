import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, HandCoins, RectangleEllipsis } from 'lucide-react';
import type { FinancialBook, PageProps } from '@/types';
import CreateBookModal from '@/Components/Main/CreateBookModal';
import JoinBookModal from '@/Components/Main/JoinBookModal';
import MembersModal from '@/Components/Main/MembersModal';
import BookCard from '@/Components/Main/BookCard';
import LeaveBookModal from '@/Components/Main/LeaveBookModal';


interface DashboardProps extends PageProps {
    userBooks?: FinancialBook[];
}

export default function Dashboard() {
    const { props } = usePage<DashboardProps>();
    const { user } = props.auth;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [membersBook, setMembersBook] = useState<FinancialBook | null>(null);
    const [leaveBook, setLeaveBook] = useState<FinancialBook | null>(null);


    const userBooks = props.userBooks || [];

    const modalHandlers = {
        openCreateModal: () => setIsCreateModalOpen(true),
        closeCreateModal: () => setIsCreateModalOpen(false),
        openJoinModal: () => setIsJoinModalOpen(true),
        closeJoinModal: () => setIsJoinModalOpen(false),
        openMembersModal: (book: FinancialBook) => setMembersBook(book),
        closeMembersModal: () => setMembersBook(null),
        openLeaveModal: (book: FinancialBook) => setLeaveBook(book),
        closeLeaveModal: () => setLeaveBook(null),
    };

    
    const hasNoBooks = userBooks.length === 0;

    return (
        <AuthenticatedLayout
            onCreateBook={modalHandlers.openCreateModal}
            onJoinBook={modalHandlers.openJoinModal}
        >
            <Head title="Dashboard" />

            {hasNoBooks ? (
                <div className="flex flex-col items-center gap-7 justify-center min-h-[75vh]">
                    <HandCoins className="size-28 md:size-40 text-primary" />
                    <div className='flex flex-col gap-1'>
                        <h1 className="text-lg md:text-xl font-semibold text-base-content text-center">You don’t have any books yet</h1>
                        <p className="text-sm md:text-base text-base-content/60 text-center max-w-md">
                            Start your first financial record and invite your team to collaborate
                        </p>
                    </div>
                    <button
                        className="btn btn-primary gap-2"
                        onClick={modalHandlers.openCreateModal}
                    >
                        <Plus size={20} />
                        Create Your First Book
                    </button>
                </div>
            ) : (
                <div className='flex flex-col gap-3'>
                    <div className="flex flex-col gap-1 mb-3">
                        <h1 className="text-xl md:text-2xl font-bold text-base-content">
                            Welcome back, {user.name}
                        </h1>
                        <p className="text-xs md:text-base text-base-content/60">
                            Manage your collaborative finances
                        </p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {userBooks.map(book => (
                           <BookCard
                            key={book.id}
                            // Pastikan kita meyakinkan TypeScript bahwa book memiliki total_income/expenses (dari BE)
                            // Jika backend belum menyediakan properti ini, berikan nilai default sehingga tipe terpenuhi
                            book={{
                                ...book,
                                total_expenses: (book as any).total_expenses ?? 0,
                                total_income: (book as any).total_income ?? 0,
                                budget: (book as any).budget ?? null,
                            }}
                            currentUserId={user.id}
                            onManageMembers={modalHandlers.openMembersModal}
                            onLeave={modalHandlers.openLeaveModal}
                        />
                        ))}
                    </div>
                </div>

            )}

            <div className="fab fab-flower z-10 md:hidden">
                <div tabIndex={0} role="button" className="btn btn-xl btn-circle btn-primary">
                    <Plus size={24} />
                </div>
                <div className="fab-close btn btn-circle btn-xl btn-error">
                    ✕
                </div>
                <button
                    onClick={modalHandlers.openJoinModal}
                    className="btn btn-xl btn-circle btn-secondary"
                >
                    <RectangleEllipsis size={20} />
                </button>
                <button
                    onClick={modalHandlers.openCreateModal}
                    className="btn btn-xl btn-circle btn-primary"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Modals */}
            <CreateBookModal
                isOpen={isCreateModalOpen}
                onClose={modalHandlers.closeCreateModal}
            />

            <JoinBookModal
                isOpen={isJoinModalOpen}
                onClose={modalHandlers.closeJoinModal}
            />

            <MembersModal
                isOpen={!!membersBook}
                onClose={modalHandlers.closeMembersModal}
                book={membersBook}
            />

            <LeaveBookModal
                isOpen={!!leaveBook}
                onClose={modalHandlers.closeLeaveModal}
                book={leaveBook}
                // Hapus onSuccess={handleLeaveBookSuccess}
            />
        </AuthenticatedLayout>
    );
}
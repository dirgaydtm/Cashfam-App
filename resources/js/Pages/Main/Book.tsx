import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import type { FinancialBook } from '@/types';
import { X } from 'lucide-react';
import BookHeader from '@/Components/Book/BookHeader';
import TransactionsSection from '@/Components/Book/TransactionsSection';
import AddTransactionForm from '@/Components/Book/AddTransactionForm';



interface BookPageProps {
    book: FinancialBook & {
        total_expenses: number;
        total_income: number;
        current_balance: number;
        budget: number | null;
    };
    // Properti Inertia lainnya seperti auth
    auth: { user: { id: number; name: string; email: string; } };
}

export default function BookPage() {
    const { book, auth } = usePage().props as unknown as BookPageProps;
    const { user } = auth;

    if (!book) {
        return (
            <AuthenticatedLayout>
                <Head title="Book" />
                <div className="alert alert-error mt-6">
                    <X />
                    <span>Book not found.</span>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Pastikan properti yang dibutuhkan BookHeader ada (fallback jika BE belum kirim)
    const bookForHeader = {
        ...book,
        current_balance: book.current_balance ?? (book.total_income - book.total_expenses),
        budget: book.budget ?? null,
    };

    const role: 'creator' | 'admin' | 'member' =
        book.members.find((m) => m.user.id === user.id)?.role || 'member';
    const canEdit = role === 'creator' || role === 'admin';
    const currentUserId = user.id;

    return (
        <AuthenticatedLayout>
            <Head title={`Book • ${book.name}`} />

            <div className="space-y-6">
                <BookHeader book={bookForHeader} canEdit={canEdit} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <TransactionsSection book={book} />
                    </div>

                    <div>
                        <AddTransactionForm book={book} userId={currentUserId} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

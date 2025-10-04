import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { dummyFinancialBooks, currentUser } from '@/data';
import type { FinancialBook } from '@/types';
import { X } from 'lucide-react';
import BookHeader from '@/Components/Book/BookHeader';
import TransactionsSection from '@/Components/Book/TransactionsSection';
import AddTransactionForm from '@/Components/Book/AddTransactionForm';

type PageProps = {
    bookId: string;
};

export default function BookPage() {
    const { props } = usePage();
    const { bookId } = props as unknown as PageProps;

    const book: FinancialBook | undefined = useMemo(
        () => dummyFinancialBooks.find((b) => b.id === String(bookId)),
        [bookId]
    );

    if (!book) {
        return (
            <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Book</h2>}>
                <Head title="Book" />
                <div className="alert alert-error mt-6">
                    <X />
                    <span>Book not found.</span>
                </div>
            </AuthenticatedLayout>
        );
    }

    const role: 'creator' | 'admin' | 'member' =
        book.members.find((m) => m.user.id === currentUser.id)?.role || 'member';
    const canEdit = role === 'creator' || role === 'admin';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-base-content/90">{book.name}</h2>
                    <div className="badge">
                        {role === 'creator' ? 'Creator' : role === 'admin' ? 'Admin' : 'Member'}
                    </div>
                </div>
            }
        >
            <Head title={`Book • ${book.name}`} />

            <div className="space-y-6">
                <BookHeader book={book} canEdit={canEdit} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <TransactionsSection book={book} />
                    </div>

                    <div>
                        <AddTransactionForm book={book} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

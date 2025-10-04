import React, { useState } from 'react';
import type { FinancialBook, BookSettingsFormData } from '@/types';
import { formatRupiah } from '@/utils/currency';
import { getSpentPercent } from '@/utils/budget';
import { dummyTransactions, currentUser } from '@/data';
import { DollarSign, Edit, FileText, Save, Settings, Trash2, X } from 'lucide-react';

interface BookHeaderProps {
    book: FinancialBook;
    canEdit: boolean;
}

export default function BookHeader({ book, canEdit }: BookHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [data, setData] = useState<BookSettingsFormData>({
        name: book.name,
        description: book.description,
        budget: book.budget,
        enable_alerts: true,
        alert_threshold: 80,
    });

    const role = book.members.find((m) => m.user.id === currentUser.id)?.role || 'member';

    // 🔴 TODO-BE: totalExpenses dan totalIncome seharusnya dari backend
    const totalExpenses = dummyTransactions
        .filter((t) => t.book_id === book.id && t.status === 'approved' && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

    const totalIncome = dummyTransactions
        .filter((t) => t.book_id === book.id && t.status === 'approved' && t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;
    const spentPercent = getSpentPercent(totalExpenses, book.budget);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        // 🔴 TODO-BE: Implementasi backend untuk update book settings
        // post(route('books.update', book.id), {
        //     ...data,
        //     onSuccess: () => {
        //         setIsEditing(false);
        //     }
        // });

        console.log('Save book settings:', { ...data, id: book.id });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (role !== 'creator') return;

        // 🔴 TODO-BE: Implementasi backend untuk delete book
        // router.delete(route('books.destroy', book.id), {
        //     onSuccess: () => {
        //         router.visit('/dashboard');
        //     }
        // });

        console.log('Delete book:', book.id);
    };

    const handleCancel = () => {
        setData({
            name: book.name,
            description: book.description,
            budget: book.budget,
            enable_alerts: true,
            alert_threshold: 80,
        });
        setIsEditing(false);
        setShowDelete(false);
    };

    return (
        <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
                {/* Header dengan Edit Button */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Book Name</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="input input-bordered w-full pl-10"
                                            value={data.name}
                                            onChange={(e) => setData({ ...data, name: e.target.value })}
                                            required
                                        />
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Description</span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium flex items-center gap-2">
                                            <DollarSign size={16} />
                                            Monthly Budget (Optional)
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Leave empty for no budget limit"
                                            className="input input-bordered w-full pl-10"
                                            value={data.budget || ''}
                                            onChange={(e) => setData({ ...data, budget: e.target.value ? Number(e.target.value) : undefined })}
                                            min={0}
                                            step={1000}
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60">Rp</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-primary btn-sm">
                                        <Save size={16} />
                                        Save Changes
                                    </button>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                    {role === 'creator' && (
                                        <button
                                            type="button"
                                            className="btn btn-error btn-sm ml-auto"
                                            onClick={() => setShowDelete(true)}
                                        >
                                            <Trash2 size={16} />
                                            Delete Book
                                        </button>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-base-content">{book.name}</h3>
                                        <p className="text-base-content/70 mt-2">{book.description}</p>
                                    </div>
                                    {canEdit && (
                                        <button
                                            className="btn btn-ghost btn-sm btn-square"
                                            onClick={() => setIsEditing(true)}
                                            aria-label="Edit book"
                                        >
                                            <Settings size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Statistics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    {/* Total Income */}
                                    <div className="stat bg-success/10 rounded-lg border border-success/20">
                                        <div className="stat-title text-success">Total Income</div>
                                        <div className="stat-value text-success text-2xl">
                                            {formatRupiah(totalIncome)}
                                        </div>
                                    </div>

                                    {/* Total Expenses */}
                                    <div className="stat bg-error/10 rounded-lg border border-error/20">
                                        <div className="stat-title text-error">Total Expenses</div>
                                        <div className="stat-value text-error text-2xl">
                                            {formatRupiah(totalExpenses)}
                                        </div>
                                    </div>

                                    {/* Net Balance */}
                                    <div className={`stat rounded-lg border ${netBalance >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-warning/10 border-warning/20'}`}>
                                        <div className={`stat-title ${netBalance >= 0 ? 'text-primary' : 'text-warning'}`}>
                                            Net Balance
                                        </div>
                                        <div className={`stat-value text-2xl ${netBalance >= 0 ? 'text-primary' : 'text-warning'}`}>
                                            {netBalance >= 0 ? '+' : '-'}{formatRupiah(Math.abs(netBalance))}
                                        </div>
                                    </div>
                                </div>

                                {/* Budget Progress */}
                                {book.budget && (
                                    <div className="mt-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Monthly Budget</span>
                                            <span className="text-sm font-bold">{formatRupiah(book.budget)}</span>
                                        </div>
                                        <progress
                                            className={`progress w-full ${spentPercent >= 100
                                                ? 'progress-error'
                                                : spentPercent >= 80
                                                    ? 'progress-warning'
                                                    : 'progress-primary'
                                                }`}
                                            value={totalExpenses}
                                            max={book.budget}
                                            aria-label={`Budget spent: ${spentPercent}%`}
                                        />
                                        <div className="flex justify-between text-xs text-base-content/60 mt-1">
                                            <span>Spent: {formatRupiah(totalExpenses)}</span>
                                            <span className={spentPercent >= 100 ? 'text-error font-bold' : ''}>
                                                {spentPercent}% used
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDelete && (
                    <div className="mt-4 p-4 bg-error/10 border border-error rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="text-error mt-1">
                                <Trash2 size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-error">Delete Financial Book</h4>
                                <p className="text-sm text-base-content/70 mt-1">
                                    This action cannot be undone. All transactions and data will be permanently deleted.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <button className="btn btn-error btn-sm" onClick={handleDelete}>
                                        <Trash2 size={16} />
                                        Yes, Delete Book
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setShowDelete(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

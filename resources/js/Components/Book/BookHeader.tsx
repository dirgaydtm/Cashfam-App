import React, { useState, useMemo } from 'react';
import type { FinancialBook } from '@/types';
import { formatRupiah, formatThousands, parseNumericInput } from '@/utils/currency';
import { DollarSign, FileText, Save, Settings, PencilIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { getColorById } from '@/utils/colorGenerator';

interface BookSettingsFormData {
    name: string;
    description: string;
    budget?: number;
}

interface BookHeaderProps {
    book: FinancialBook & {
        total_expenses: number;
        total_income: number;
        current_balance: number;
        budget: number | null;
    };
    canEdit: boolean;
    currentUserId: number;
}

export default function BookHeader({ book, canEdit, currentUserId }: BookHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [budgetDisplay, setBudgetDisplay] = useState('');

    const { data, setData, patch, delete: destroy } = useForm<BookSettingsFormData>({
        name: book.name,
        description: book.description,
        budget: book.budget ?? undefined,
    });

    const headerColor = useMemo(() => getColorById(book.id), [book.id]);

    const role = book.members.find((m) => m.user.id === currentUserId)?.role || 'member';

    // 🔴 TODO-BE: totalExpenses dan totalIncome seharusnya dari backend
    const totalExpenses = book.total_expenses || 0;
    const totalIncome = book.total_income || 0;
    const netBalance = totalIncome - totalExpenses;

    const spentPercent = useMemo(() => {
        if (!book.budget || book.budget <= 0) return totalExpenses > 0 ? 100 : 0;
        return Math.round((totalExpenses / book.budget) * 100);
    }, [totalExpenses, book.budget]);

    const budgetClass = spentPercent >= 100 ? 'progress-error' : spentPercent >= 80 ? 'progress-warning' : 'progress-primary';
    const balanceClass = netBalance >= 0 ? 'primary' : 'warning';

    // Financial stats configuration
    const stats = [
        { title: 'Total Income', value: totalIncome, color: 'success' },
        { title: 'Total Expenses', value: totalExpenses, color: 'error' },
        {
            title: 'Net Balance',
            value: netBalance,
            color: balanceClass,
            prefix: netBalance >= 0 ? '+' : '-',
            absValue: true
        },
    ];

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseNumericInput(e.target.value);
        setData('budget', value ? Number(value) : undefined);
        setBudgetDisplay(formatThousands(value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;

        // 🔴 TODO-BE: Implementasi backend untuk update book settings
        patch(route('books.update', book.id), {
            onSuccess: () => setIsEditing(false),
            onError: (err) => console.error("Update failed:", err),
        });
    };

    const handleDelete = () => {
        if (role !== 'creator') return;

        // 🔴 TODO-BE: Implementasi backend untuk delete book
        destroy(route('books.destroy', book.id), {
            onSuccess: () => console.log('Book deleted successfully'),
            onError: (err) => console.error("Delete failed:", err),
        });
    };

    const handleCancel = () => {
        setData({ name: book.name, description: book.description, budget: book.budget ?? undefined });
        setBudgetDisplay('');
        setIsEditing(false);
    };

    return (
        <div className="card border border-base-content/30 overflow-hidden">
            <div className={`card-header ${headerColor} text-base-100`}>

                <div className={`flex items-start ${headerColor} p-5 justify-between mb-6`}>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold">{book.name}</h3>
                        <p className="mt-2">{book.description}</p>
                    </div>
                    {canEdit && !isEditing && (
                        <button className={`btn btn-ghost btn-md btn-circle bg-transparent hover:bg-base-100 border-0 hover:shadow-none`} onClick={() => setIsEditing(true)}>
                            <PencilIcon size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="card-body">
                {/* Header dengan Edit Button */}
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Book Name</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="input input-bordered focus:outline-none w-full pl-10"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <FileText className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text ">Description</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered max-h-40 focus:outline-none w-full"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2">
                                    Monthly Budget
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="input input-bordered focus:outline-none w-full pl-10"
                                    value={budgetDisplay}
                                    onChange={handleBudgetChange}
                                />
                                <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base-content/60">Rp</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="submit" className="btn btn-primary btn-md">
                                <Save size={16} />
                                Save
                            </button>
                            <button type="button" className="btn btn-ghost btn-md" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Statistics Grid */}
                        <div className="flex gap-5">
                            {/* Monthly Budget Progress */}
                            <div className="flex-1 ">
                                <div className='w-3/4'>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Monthly Budget</span>
                                        <span className="text-sm font-bold">{formatRupiah(book.budget)}</span>
                                    </div>
                                    <progress className={`progress w-full ${budgetClass}`} value={totalExpenses} max={book.budget} />
                                    <div className="flex justify-between text-xs text-base-content/60 mt-1">
                                        <span>Spent: {formatRupiah(totalExpenses)}</span>
                                        <span className={spentPercent >= 100 ? 'text-error font-bold' : ''}>{spentPercent}% used</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Stats */}
                            <div className="flex-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {stats.map((stat) => (
                                    <div key={stat.title} className={`stat bg-${stat.color}/10 rounded-lg border border-${stat.color}/20`}>
                                        <div className={`stat-title text-${stat.color}`}>{stat.title}</div>
                                        <div className={`stat-value text-${stat.color} text-2xl`}>
                                            {stat.prefix}{formatRupiah(stat.absValue ? Math.abs(stat.value) : stat.value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
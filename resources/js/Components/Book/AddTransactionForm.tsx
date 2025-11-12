import React, { useState } from 'react';
import type { FinancialBook } from '@/types';
import { Categories } from '@/constants/categories';
import { CheckCircle, TrendingDown, TrendingUp, X } from 'lucide-react';
import { formatThousands, parseNumericInput } from '@/utils/currency';

interface TransactionFormData {
    book_id: number;
    user_id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
}

interface AddTransactionFormProps {
    book: FinancialBook;
    userId: number;
}

const getCsrfToken = (): string => {
    // Laravel menyimpan token di cookie bernama XSRF-TOKEN
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
    // Token dienkode oleh Laravel, jadi kita perlu decode
    return match ? decodeURIComponent(match[2]) : '';
};

export default function AddTransactionForm({ book, userId }: AddTransactionFormProps) {
    const initialFormData: TransactionFormData = {
        book_id: Number(book.id),
        user_id: userId,
        type: 'expense',
        category: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
    };

    const [data, setData] = useState<TransactionFormData>(initialFormData);
    const [amountDisplay, setAmountDisplay] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const resetForm = () => {
        setData(initialFormData);
        setAmountDisplay('');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseNumericInput(e.target.value);
        setData({ ...data, amount: value ? Number(value) : 0 });
        setAmountDisplay(formatThousands(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            setError('Authentication token (CSRF) not found. Please refresh the page.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                setSuccess('Transaction added successfully and pending approval.');
                resetForm();

                // Reload page to refresh transaction list
                setTimeout(() => window.location.reload(), 1500);
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);

                let errorMessage = 'Failed to add transaction. Please try again.';

                if (response.status === 422 && errorData.errors) {
                    const errors = Object.values(errorData.errors).flat().join(', ');
                    errorMessage = `Data validation failed:\n- ${errors}`;
                } else if (errorData.message) {
                    errorMessage = `Failed: ${errorData.message}`;
                }

                setError(errorMessage);
            }
        } catch (error) {
            console.error(error);
            setError('A network or server error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card border border-base-content/30">
            <div className="card-header flex px-6 py-3 items-center gap-3">
                <h3 className="font-bold text-lg">Add Transaction</h3>
                {/* Transaction Type Selector */}
                {[
                    { type: 'income', icon: TrendingUp, btnClass: 'btn-success' },
                    { type: 'expense', icon: TrendingDown, btnClass: 'btn-error' }
                ].map(({ type, icon: Icon, btnClass }) => (
                    <button
                        key={type}
                        type="button"
                        className={`btn btn-sm btn-circle ${data.type === type ? btnClass : ''}`}
                        onClick={() => setData({ ...data, type: type as 'income' | 'expense' })}
                    >
                        <Icon size={18} />
                    </button>
                ))}
            </div>

            <div className="card-body pt-0">
                {/* Alert Messages */}
                {success && (
                    <div role="alert" className="alert alert-success">
                        <CheckCircle size={20} />
                        <span>{success}</span>
                    </div>
                )}
                {error && (
                    <div role="alert" className="alert alert-error whitespace-pre-wrap">
                        <X size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Amount</span></label>
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input input-bordered w-full pl-10 focus:outline-none"
                                placeholder="0"
                                value={amountDisplay}
                                onChange={handleAmountChange}
                                disabled={isLoading}
                                required
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 z-[1]">Rp</span>
                        </div>
                    </div>

                    {/* Category & Date */}
                    <div className="flex gap-3">
                        <div className="form-control w-full">
                            <label className="label"><span className="label-text font-medium">Category</span></label>
                            <select
                                className="select select-bordered w-full focus:outline-none"
                                value={data.category}
                                onChange={(e) => setData({ ...data, category: e.target.value })}
                                disabled={isLoading}
                                required
                            >
                                <option value="" disabled>Select category</option>
                                {Categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="form-control w-full">
                            <label className="label"><span className="label-text font-medium">Date</span></label>
                            <input
                                type="date"
                                className="input input-bordered w-full focus:outline-none"
                                value={data.date}
                                onChange={(e) => setData({ ...data, date: e.target.value })}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Description</span></label>
                        <textarea
                            className="textarea textarea-bordered w-full focus:outline-none"
                            placeholder="Brief description..."
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            rows={3}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`btn ${data.type === 'income' ? 'btn-success' : 'btn-error'} w-full`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Adding...
                            </>
                        ) : (
                            `Add ${data.type === 'income' ? 'Income' : 'Expense'}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

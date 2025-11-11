import React, { useState } from 'react';
import type { FinancialBook } from '@/types';
import { Categories } from '@/constants/categories';
import { CheckCircle, TrendingDown, TrendingUp, X } from 'lucide-react';

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const resetForm = () => setData(initialFormData);

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
            <div className="card-body">
                <h3 className="font-bold text-lg">Add Transaction</h3>

                {/* izin ketua */}
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

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* Transaction Type Selector */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { type: 'income', icon: TrendingUp, label: 'Income', btnClass: 'btn-success' },
                            { type: 'expense', icon: TrendingDown, label: 'Expense', btnClass: 'btn-error' }
                        ].map(({ type, icon: Icon, label, btnClass }) => (
                            <button
                                key={type}
                                type="button"
                                className={`btn ${data.type === type ? btnClass : 'btn-outline'}`}
                                onClick={() => setData({ ...data, type: type as 'income' | 'expense' })}
                            >
                                <Icon size={18} /> {label}
                            </button>
                        ))}
                    </div>

                    {/* Amount Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Amount</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="input input-bordered w-full pl-10"
                                placeholder="0.00"
                                value={data.amount || ''}
                                onChange={(e) => setData({ ...data, amount: Number(e.target.value) })}
                                required
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60">Rp</span>
                        </div>
                    </div>

                    {/* Category Select */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Category</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={data.category}
                            onChange={(e) => setData({ ...data, category: e.target.value })}
                            required
                        >
                            <option value="" disabled>Select category</option>
                            {Categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Date</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={data.date}
                            onChange={(e) => setData({ ...data, date: e.target.value })}
                            required
                        />
                    </div>

                    {/* Description Textarea */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Description</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            placeholder="Brief description..."
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            rows={3}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`btn ${data.type === 'income' ? 'btn-success' : 'btn-error'} w-full`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding...' : `Add ${data.type === 'income' ? 'Income' : 'Expense'}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

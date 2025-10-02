import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Tag } from 'lucide-react';
import { transactionCategories } from '@/data.js';
import type { TransactionFormData, FinancialBook } from '@/types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
}

export default function AddTransactionModal({ isOpen, onClose, book }: AddTransactionModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<TransactionFormData>({
        type: 'expense',
        category: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0], // Today's date
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!book) return;

        // For now, just log the data since we're using dummy data
        console.log('Adding transaction:', {
            ...data,
            book_id: book.id,
        });

        // In real implementation:
        // post(route('transactions.store', book.id), {
        //     onSuccess: () => {
        //         reset();
        //         onClose();
        //     }
        // });

        // For demo, just reset and close
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen || !book) return null;

    const currencySymbol = 'Rp';

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-base-content">Tambah Transaksi</h3>
                    <button
                        onClick={handleClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Book Info */}
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h4 className="font-semibold">{book.name}</h4>
                                    <p className="text-sm text-base-content/60">Mata Uang: IDR</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Type */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Jenis Transaksi</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className={`btn ${data.type === 'income' ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => setData('type', 'income')}
                            >
                                <TrendingUp size={18} />
                                Pemasukan
                            </button>
                            <button
                                type="button"
                                className={`btn ${data.type === 'expense' ? 'btn-error' : 'btn-outline'}`}
                                onClick={() => setData('type', 'expense')}
                            >
                                <TrendingDown size={18} />
                                Pengeluaran
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Jumlah</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={`input input-bordered w-full pl-10 ${errors.amount ? 'input-error' : ''}`}
                                placeholder="0.00"
                                value={data.amount || ''}
                                onChange={(e) => setData('amount', Number(e.target.value))}
                                required
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
                                {currencySymbol}
                            </span>
                        </div>
                        {errors.amount && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.amount}</span>
                            </label>
                        )}
                    </div>

                    {/* Category */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <Tag size={16} />
                                Kategori
                            </span>
                        </label>
                        <select
                            className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            required
                        >
                            <option value="" disabled>Pilih kategori</option>
                            {transactionCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.category}</span>
                            </label>
                        )}
                    </div>

                    {/* Date */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <Calendar size={16} />
                                Tanggal
                            </span>
                        </label>
                        <input
                            type="date"
                            className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            required
                        />
                        {errors.date && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.date}</span>
                            </label>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <FileText size={16} />
                                Deskripsi
                            </span>
                        </label>
                        <textarea
                            className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
                            placeholder="Deskripsi singkat transaksi ini..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            required
                        />
                        {errors.description && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.description}</span>
                            </label>
                        )}
                    </div>

                    {/* Info Alert */}
                    <div className="alert alert-info">
                        <div className="text-sm">
                            <p className="font-medium">Review Transaksi</p>
                            <p>Transaksi Anda akan dikirim untuk persetujuan oleh administrator buku.</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={handleClose}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className={`btn ${data.type === 'income' ? 'btn-success' : 'btn-error'}`}
                            disabled={processing}
                        >
                            {processing && <span className="loading loading-spinner loading-sm"></span>}
                            Tambah {data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import type { FinancialBook } from '@/types';
import { transactionCategories } from '@/data';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface TransactionFormData {
    book_id: number;        
    user_id: number;        
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    status?: string;        
    approved_by?: number;   
}

interface AddTransactionFormProps {
    book: FinancialBook;
    userId: number;
}

export default function AddTransactionForm({ book, userId }: AddTransactionFormProps) {
    const [data, setData] = useState<TransactionFormData>({
        book_id: Number(book.id),
        user_id: userId,
        type: 'expense',
        category: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                const result = await response.json();
                alert('Transaksi berhasil ditambahkan');
                setData({
                    book_id: Number(book.id),
                    user_id: userId,
                    type: 'expense',
                    category: '',
                    amount: 0,
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    status: undefined,
                    approved_by: undefined,
                });
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData); 
                
                let errorMessage = 'Gagal menambahkan transaksi. Silakan coba lagi.';
                
                if (response.status === 422 && errorData.errors) {
                    errorMessage = 'Gagal validasi data:\n';
                    for (const key in errorData.errors) {
                        errorMessage += `- ${errorData.errors[key].join(', ')}\n`;
                    }
                } else if (errorData.message) {
                    errorMessage = `Gagal: ${errorData.message}`;
                }
                
                alert(errorMessage);
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan jaringan');
        }
    };

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <h3 className="font-bold text-lg">Tambah Transaksi</h3>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className={`btn ${data.type === 'income' ? 'btn-success' : 'btn-outline'}`}
                            onClick={() => setData({ ...data, type: 'income' })}
                        >
                            <TrendingUp size={18} /> Pemasukan
                        </button>
                        <button
                            type="button"
                            className={`btn ${data.type === 'expense' ? 'btn-error' : 'btn-outline'}`}
                            onClick={() => setData({ ...data, type: 'expense' })}
                        >
                            <TrendingDown size={18} /> Pengeluaran
                        </button>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Jumlah</span>
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

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Kategori</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={data.category}
                            onChange={(e) => setData({ ...data, category: e.target.value })}
                            required
                        >
                            <option value="" disabled>
                                Pilih kategori
                            </option>
                            {transactionCategories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Tanggal</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={data.date}
                            onChange={(e) => setData({ ...data, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Deskripsi</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            placeholder="Deskripsi singkat..."
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            rows={3}
                            required
                        />
                    </div>

                    <div className="alert alert-info">
                        <div className="text-sm">
                            <p className="font-medium">Review Transaksi</p>
                            <p>Transaksi akan dikirim untuk persetujuan oleh admin buku.</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={`btn ${data.type === 'income' ? 'btn-success' : 'btn-error'} flex-1`}
                        >
                            Tambah {data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

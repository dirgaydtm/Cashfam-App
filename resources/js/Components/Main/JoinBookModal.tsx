import { useForm } from '@inertiajs/react';
import { Key, X, CheckCircle, XCircle } from 'lucide-react';
import Modal from '@/Layouts/Modal';
import React, { useState, useCallback } from 'react';

interface JoinBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (bookId: string) => void;
}
const getCsrfToken = (): string => {
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
    if (match) {
        return decodeURIComponent(match[2]);
    }
    console.error('CSRF token not found. Authentication might fail.');
    return '';
};

export default function JoinBookModal({ isOpen, onClose, onSuccess }: JoinBookModalProps) {
    const [invitationCode, setInvitationCode] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const resetForm = useCallback(() => {
        setInvitationCode('');
        setErrors({});
        setFeedback(null);
    }, []);

    const handleClose = useCallback(() => {
        if (processing) return;
        resetForm();
        onClose();
    }, [processing, onClose, resetForm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side basic validation
        if (invitationCode.length !== 8) {
            setErrors({ invitation_code: 'Kode undangan harus 8 karakter.' });
            return;
        }

        setProcessing(true);
        setErrors({});
        setFeedback(null);

        try {
            // Panggilan API NYATA ke endpoint Laravel
            const csrfToken = getCsrfToken();
            
            // Asumsi URL API adalah '/books/join'
            const apiUrl = '/books/join'; 

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken, // Mengirim CSRF token
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ invitation_code: invitationCode }),
            });

            // Mendapatkan respons JSON
            const result = await response.json();

            if (response.ok) {
                // Status code 2xx (Success)
                setFeedback({ type: 'success', message: 'Anda berhasil bergabung dengan Buku Keuangan!' });
                if (onSuccess && result.book_id) {
                    // Asumsi server mengembalikan { book_id: '...' } saat sukses
                    onSuccess(result.book_id);
                }
                resetForm(); 
                // Tutup modal setelah penundaan singkat agar pengguna melihat pesan sukses
                setTimeout(onClose, 1500); 
            } else if (response.status === 422 && result.errors) {
                 // Status code 422 (Validation error)
                setFeedback({ type: 'error', message: 'Ada kesalahan dalam data yang Anda kirim.' });
                setErrors(result.errors);
            } else {
                // Status code 4xx atau 5xx lainnya (General error)
                setFeedback({ type: 'error', message: result.message || 'Gagal bergabung ke buku. Periksa koneksi atau kode undangan.' });
            }

        } catch (err) {
            setFeedback({ type: 'error', message: 'Terjadi kesalahan jaringan atau server.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Gabung Buku Keuangan" size="small">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Kode Undangan</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Masukkan kode undangan"
                            className={`input input-bordered w-full pl-10 uppercase ${errors.invitation_code ? 'input-error' : ''}`}
                            value={invitationCode}
                            onChange={(e) => {
                                setInvitationCode(e.target.value.toUpperCase());
                                if (errors.invitation_code) setErrors({});
                            }}
                            maxLength={8}
                            required
                        />
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={18} />
                    </div>
                    {errors.invitation_code && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.invitation_code}</span>
                        </label>
                    )}
                    <label className="label">
                        <span className="label-text-alt text-base-content/60">
                            Masukkan kode 8 karakter yang diberikan oleh admin buku
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleClose}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={processing || invitationCode.length !== 8}
                    >
                        {processing && <span className="loading loading-spinner loading-sm"></span>}
                        Gabung
                    </button>
                </div>
            </form>
        </Modal>
    );
}

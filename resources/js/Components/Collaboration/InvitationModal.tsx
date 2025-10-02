import { useState } from 'react';
import { Copy, Share, Users, CheckCircle, RefreshCw } from 'lucide-react';
import type { FinancialBook } from '@/types';

interface InvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
}

export default function InvitationModal({ isOpen, onClose, book }: InvitationModalProps) {
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const regenerateCode = async () => {
        setRegenerating(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Regenerating invitation code for book:', book?.id);
            // In real implementation:
            // post(route('books.regenerate-invitation', book.id))
            setRegenerating(false);
        }, 1000);
    };

    const shareViaEmail = () => {
        if (!book) return;

        const subject = `Join "${book.name}" on CasFam`;
        const body = `Hi! I'd like to invite you to collaborate on "${book.name}" in CasFam.

Use this invitation code: ${book.invitation_code}

Join us at: ${window.location.origin}/join

CasFam helps us manage our finances together transparently and efficiently.`;

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (!isOpen || !book) return null;

    const inviteUrl = `${window.location.origin}/join?code=${book.invitation_code}`;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-base-content">Invite Members</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Book Info */}
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h4 className="font-semibold">{book.name}</h4>
                                    <p className="text-sm text-base-content/60">
                                        {book.members.length} member{book.members.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invitation Code */}
                    <div className="space-y-3">
                        <label className="label">
                            <span className="label-text font-medium">Invitation Code</span>
                        </label>

                        <div className="flex gap-2">
                            <div className="flex-1 input input-bordered font-mono text-lg text-center bg-primary/10 text-primary font-bold">
                                {book.invitation_code}
                            </div>
                            <button
                                className="btn btn-square btn-outline"
                                onClick={regenerateCode}
                                disabled={regenerating}
                                title="Regenerate code"
                            >
                                <RefreshCw size={18} className={regenerating ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <p className="text-sm text-base-content/60">
                            Share this code with people you want to invite to this financial book.
                        </p>
                    </div>

                    {/* Invitation URL */}
                    <div className="space-y-3">
                        <label className="label">
                            <span className="label-text font-medium">Direct Link</span>
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input input-bordered flex-1 text-sm"
                                value={inviteUrl}
                                readOnly
                            />
                            <button
                                className={`btn btn-outline ${copied ? 'btn-success' : ''}`}
                                onClick={() => copyToClipboard(inviteUrl)}
                            >
                                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Share Actions */}
                    <div className="space-y-3">
                        <label className="label">
                            <span className="label-text font-medium">Share Options</span>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                className="btn btn-outline gap-2"
                                onClick={() => copyToClipboard(book.invitation_code)}
                            >
                                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                Copy Code
                            </button>

                            <button
                                className="btn btn-outline gap-2"
                                onClick={shareViaEmail}
                            >
                                <Share size={18} />
                                Email Invite
                            </button>
                        </div>
                    </div>

                    {/* Current Members */}
                    <div className="space-y-3">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <Users size={16} />
                                Current Members ({book.members.length})
                            </span>
                        </label>

                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {book.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-base-200">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-8">
                                                <span className="text-xs">{member.user.name.charAt(0)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{member.user.name}</p>
                                            <p className="text-xs text-base-content/60">{member.user.email}</p>
                                        </div>
                                    </div>
                                    <div className={`badge badge-sm ${member.role === 'creator' ? 'badge-primary' :
                                        member.role === 'admin' ? 'badge-secondary' : 'badge-neutral'
                                        }`}>
                                        {member.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="alert alert-info">
                        <div className="text-sm">
                            <p className="font-medium">Security Note</p>
                            <p>Anyone with this code can join your financial book. You can regenerate the code at any time to revoke access.</p>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="modal-action">
                        <button
                            className="btn btn-primary w-full"
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

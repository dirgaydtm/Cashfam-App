import { useState } from 'react';
import { Users, Crown, Shield, User, UserMinus, UserCheck, Mail, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import Modal from '@/Layouts/Modal';
import { currentUser } from '@/data.js';
import type { FinancialBook, BookMember } from '@/types';

interface MembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
}

export default function MembersModal({ isOpen, onClose, book }: MembersModalProps) {
    const [selectedMember, setSelectedMember] = useState<BookMember | null>(null);
    const [actionType, setActionType] = useState<'promote' | 'demote' | 'remove' | null>(null);
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const handleMemberAction = (member: BookMember, action: 'promote' | 'demote' | 'remove') => {
        setSelectedMember(member);
        setActionType(action);
    };

    const confirmAction = () => {
        if (!selectedMember || !actionType) return;

        console.log(`${actionType} member:`, selectedMember.user.name);

        // In real implementation:
        // post(route('books.members.update', [book.id, selectedMember.id]), {
        //     action: actionType,
        //     onSuccess: () => {
        //         setSelectedMember(null);
        //         setActionType(null);
        //     }
        // });

        // For demo
        setSelectedMember(null);
        setActionType(null);
    };

    const currentUserRole: 'creator' | 'admin' | 'member' = book ? (book.members.find(m => m.user.id === currentUser.id)?.role || 'member') : 'member';
    const canManageMembers = currentUserRole === 'creator' || currentUserRole === 'admin';
    const canPromoteDemote = currentUserRole === 'creator';

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
        const body = `Hi! I'd like to invite you to collaborate on "${book.name}" in CasFam.\n\nUse this invitation code: ${book.invitation_code}\n\nOpen CasFam and use the Join feature, then enter the code above to join our book.`;

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'creator': return <Crown size={16} className="text-primary" />;
            case 'admin': return <Shield size={16} className="text-secondary" />;
            default: return <User size={16} className="text-base-content/60" />;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'creator': return 'badge-primary';
            case 'admin': return 'badge-secondary';
            default: return 'badge-neutral';
        }
    };

    if (!book) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Users size={20} />
                    Members ({book.members.length})
                </div>
            }
            size="large"
        >
            {selectedMember && actionType ? (
                /* Confirmation Dialog */
                <div className="space-y-6">
                    <div className={`alert ${actionType === 'remove' ? 'alert-error' : 'alert-warning'
                        }`}>
                        <div>
                            <h4 className="font-semibold">
                                {actionType === 'promote' && 'Promote to Admin'}
                                {actionType === 'demote' && 'Remove Admin Rights'}
                                {actionType === 'remove' && 'Remove Member'}
                            </h4>
                            <p className="text-sm">
                                {actionType === 'promote' && `Give ${selectedMember.user.name} admin rights to manage this book?`}
                                {actionType === 'demote' && `Remove admin rights from ${selectedMember.user.name}?`}
                                {actionType === 'remove' && `Remove ${selectedMember.user.name} from this financial book? They will lose access to all transactions and data.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            className="btn btn-ghost"
                            onClick={() => {
                                setSelectedMember(null);
                                setActionType(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className={`btn ${actionType === 'remove' ? 'btn-error' : 'btn-warning'}`}
                            onClick={confirmAction}
                        >
                            {actionType === 'promote' && 'Promote'}
                            {actionType === 'demote' && 'Demote'}
                            {actionType === 'remove' && 'Remove'}
                        </button>
                    </div>
                </div>
            ) : (
                /* Members List */
                <div className="space-y-6">
                    {/* Book Info */}
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h4 className="font-semibold">{book.name}</h4>
                                    <p className="text-sm text-base-content/60">
                                        Manage who can access this book
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invitation (code-only) */}
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

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                className={`btn btn-outline gap-2 ${copied ? 'btn-success' : ''}`}
                                onClick={() => copyToClipboard(book.invitation_code)}
                            >
                                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                                Copy Code
                            </button>

                            <button
                                className="btn btn-outline gap-2"
                                onClick={shareViaEmail}
                            >
                                <Mail size={18} />
                                Email Invite
                            </button>
                        </div>

                        <p className="text-sm text-base-content/60">
                            Share this code with people you want to invite. Anyone with this code can join until you regenerate it.
                        </p>
                    </div>

                    {/* Members List */}
                    <div className="space-y-3">
                        {book.members.map((member) => {
                            const isCurrentUser = member.user.id === currentUser.id;
                            const canModifyMember = canManageMembers && !isCurrentUser && member.role !== 'creator';
                            const canPromoteMember = canPromoteDemote && member.role === 'member' && !isCurrentUser;
                            const canDemoteMember = canPromoteDemote && member.role === 'admin' && !isCurrentUser;

                            return (
                                <div key={member.id} className="card bg-base-100 border">
                                    <div className="card-body p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                {/* Avatar */}
                                                <div className="avatar placeholder">
                                                    <div className="bg-neutral text-neutral-content rounded-full w-12">
                                                        <span className="text-sm">
                                                            {member.user.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* User Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold">
                                                            {member.user.name}
                                                            {isCurrentUser && ' (You)'}
                                                        </h4>
                                                        {getRoleIcon(member.role)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                                                        <Mail size={14} />
                                                        {member.user.email}
                                                    </div>
                                                    <p className="text-xs text-base-content/50">
                                                        Joined {new Date(member.joined_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {/* Role Badge */}
                                                <div className={`badge ${getRoleBadgeClass(member.role)}`}>
                                                    {member.role}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {canModifyMember && (
                                                <div className="dropdown dropdown-end">
                                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </div>
                                                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
                                                        {canPromoteMember && (
                                                            <li>
                                                                <a onClick={() => handleMemberAction(member, 'promote')}>
                                                                    <Shield size={16} />
                                                                    Promote to Admin
                                                                </a>
                                                            </li>
                                                        )}
                                                        {canDemoteMember && (
                                                            <li>
                                                                <a onClick={() => handleMemberAction(member, 'demote')}>
                                                                    <User size={16} />
                                                                    Remove Admin Rights
                                                                </a>
                                                            </li>
                                                        )}
                                                        <li>
                                                            <a
                                                                onClick={() => handleMemberAction(member, 'remove')}
                                                                className="text-error"
                                                            >
                                                                <UserMinus size={16} />
                                                                Remove Member
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Permissions Legend */}
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <h4 className="font-semibold mb-3">Role Permissions</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Crown size={16} className="text-primary" />
                                    <span className="font-medium">Creator:</span>
                                    <span className="text-base-content/70">Full control, can't be removed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-secondary" />
                                    <span className="font-medium">Admin:</span>
                                    <span className="text-base-content/70">Manage members, approve transactions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-base-content/60" />
                                    <span className="font-medium">Member:</span>
                                    <span className="text-base-content/70">Add transactions, view data</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end mt-8">
                        <button
                            className="btn btn-primary"
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

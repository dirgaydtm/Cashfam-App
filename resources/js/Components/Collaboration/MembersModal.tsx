import { useState } from 'react';
import { X, Users, Crown, Shield, User, UserMinus, UserCheck, Mail } from 'lucide-react';
import { currentUser } from '@/data.js';
import type { FinancialBook, BookMember } from '@/types';

interface MembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
    currentUserRole: 'creator' | 'admin' | 'member';
}

export default function MembersModal({ isOpen, onClose, book, currentUserRole }: MembersModalProps) {
    const [selectedMember, setSelectedMember] = useState<BookMember | null>(null);
    const [actionType, setActionType] = useState<'promote' | 'demote' | 'remove' | null>(null);

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

    const canManageMembers = currentUserRole === 'creator' || currentUserRole === 'admin';
    const canPromoteDemote = currentUserRole === 'creator';

    if (!isOpen || !book) return null;

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

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-base-content flex items-center gap-2">
                        <Users size={20} />
                        Members ({book.members.length})
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <X size={18} />
                    </button>
                </div>

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
                        <div className="modal-action">
                            <button
                                className="btn btn-primary w-full"
                                onClick={onClose}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

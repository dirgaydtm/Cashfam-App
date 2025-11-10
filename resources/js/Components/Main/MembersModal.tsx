import { useState } from 'react';
import { Users, Crown, Shield, User, UserMinus, UserCheck, Mail, Copy, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import Modal from '@/Layouts/Modal';
import { currentUser } from '@/data.js';
import InitialAvatar from '@/Components/Main/InitialAvatar';
import type { FinancialBook, BookMember } from '@/types';
import { router, useForm } from '@inertiajs/react';

interface MembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: FinancialBook | null;
}

export default function MembersModal({ isOpen, onClose, book }: MembersModalProps) {
    
    const [selectedMember, setSelectedMember] = useState<BookMember | null>(null);
    const [actionType, setActionType] = useState<'promote' | 'demote' | 'remove' | null>(null);
    const [copied, setCopied] = useState(false);

    // State untuk loading regenerasi kode
    const [isRegenerating, setIsRegenerating] = useState(false);
    // State untuk loading tombol konfirmasi
    const [isConfirming, setIsConfirming] = useState(false);

    const handleMemberAction = (member: BookMember, action: 'promote' | 'demote' | 'remove') => {
        setSelectedMember(member);
        setActionType(action);
        
    };

    const confirmAction = () => {
        if (!selectedMember || !actionType || !book) return;
        setIsConfirming(true);
        // Menggunakan route dengan parameter yang tepat untuk resource route
        // Catatan: Asumsikan fungsi `route()` tersedia secara global
        const actionRoute = route(actionType === 'remove' ? 'books.members.destroy' : 'books.members.update', [book.id, selectedMember.id]);

        const commonOptions = {
            onSuccess: () => {
                router.reload({ only: ['book'] }); // Asumsikan Anda ingin me-refresh prop 'book'
                setSelectedMember(null);
                setActionType(null);
                // Biarkan isConfirming false saat onFinish
            },
            onError: (errors: any) => {
                console.error('Action Failed', errors);
                // Biarkan isConfirming false saat onFinish
            },
            onFinish: () => {
                setIsConfirming(false);
            }
        };

        if (actionType === 'remove') {
            router.delete(
                actionRoute,
                commonOptions
            );
        } else {
            // 'promote' atau 'demote'
            router.patch(
                actionRoute,
                { action: actionType }, // Kirim data 'action' ke endpoint update
                commonOptions
            );
        }
    };

    if (!book) return null; // Awalnya periksa 'book'

    const currentMember = book.members.find(m => m.user.id === currentUser.id);
    const currentUserRole: 'creator' | 'admin' | 'member' = currentMember?.role || 'creator';
    const isCurrentUserCreator = currentUserRole === 'creator';
    const isCurrentUserAdminOrCreator = currentUserRole === 'creator' || currentUserRole === 'admin';
    
    // Hitung jumlah anggota yang dapat menyetujui transaksi (Creator atau Admin)
    const approverCount = book.members.filter(m => m.role === 'creator' || m.role === 'admin').length;

    const copyToClipboard = async (text: string) => {
        try {
            // Menggunakan navigator.clipboard.writeText untuk metode modern
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed'; 
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const regenerateCode = async () => {
        setIsRegenerating(true);
        router.post(
            route('books.regenerate-invitation', book.id), 
            {}, 
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    router.reload({ only: ['book'] }); 
                    // Biarkan isRegenerating false saat onFinish    
                    setCopied(false);
                    console.log('Kode undangan berhasil diperbarui!');            
                },
                onError: (errors: any) => {
                    console.error('Regenerate Failed', errors);
                    // Biarkan isRegenerating false saat onFinish
                },
                onFinish: () => {
                    setIsRegenerating(false);
                }
            }
        );
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

    // Tentukan apakah modal sedang dalam proses loading atau konfirmasi
    const isModalBusy = isRegenerating || isConfirming;


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
                    <div className={`alert ${actionType === 'remove' ? 'alert-error' : 'alert-warning'} flex items-start`}>
                        <div className='flex-shrink-0'>
                            {actionType === 'remove' ? <UserMinus size={24} /> : <UserCheck size={24} />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">
                                {actionType === 'promote' && 'Promote to Admin'}
                                {actionType === 'demote' && 'Remove Admin Rights'}
                                {actionType === 'remove' && 'Remove Member'}
                            </h4>
                            <p className="text-sm">
                                {actionType === 'promote' && `Give **${selectedMember.user.name}** admin rights to manage this book?`}
                                {actionType === 'demote' && `Remove admin rights from **${selectedMember.user.name}**? They will retain 'member' access.`}
                                {actionType === 'remove' && `Remove **${selectedMember.user.name}** from this financial book? They will lose access to all transactions and data.`}
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
                            disabled={isConfirming}
                        >
                            Cancel
                        </button>
                        <button
                            className={`btn ${actionType === 'remove' ? 'btn-error' : 'btn-warning'}`}
                            onClick={confirmAction}
                            disabled={isConfirming}
                        >
                            {isConfirming ? ( // 🔄 Tampilkan loading saat memproses
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {actionType === 'promote' && 'Promote'}
                                    {actionType === 'demote' && 'Demote'}
                                    {actionType === 'remove' && 'Remove'}
                                </>
                            )}
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
                            <div className="flex-1 input input-bordered font-mono text-lg text-center bg-primary/10 text-primary font-bold flex items-center justify-center">
                                {book.invitation_code}
                            </div>
                            <button
                                className={`btn btn-outline gap-2 ${copied ? 'btn-success' : ''}`}
                                onClick={() => copyToClipboard(book.invitation_code)}
                                disabled={isModalBusy}
                            >
                                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                            </button>
                        </div>

                        
                    </div>

                    {/* Members List */}
                    <div className="space-y-3">
                        {book.members.map((member) => {
                            const isCurrentUser = member.user.id === currentUser.id;
                            
                            // PERBAIKAN LOGIKA: Creator hanya bisa promote/demote ORANG LAIN
                            const canPromoteMember = isCurrentUserCreator
                                && member.role === 'member'
                                && !isCurrentUser; 

                            const canDemoteMember = isCurrentUserCreator
                                && member.role === 'admin'
                                && !isCurrentUser;

                            const isApprover = member.role === 'creator' || member.role === 'admin';
                            const isLastApprover = isApprover && approverCount === 1;

                            const canRemoveMember = isCurrentUserAdminOrCreator
                                && !isCurrentUser
                                && member.role !== 'creator'
                                && !(member.role === 'admin' && isLastApprover); // Mencegah Admin/Creator menghapus satu-satunya Admin/Creator yang tersisa

                            const canModifyMember = canPromoteMember || canDemoteMember || canRemoveMember;

                            // ✅ Tambahkan kondisi disabled untuk item menu
                            const isActionDisabled = isModalBusy;

                            // Tentukan apakah tombol menu harus ditampilkan sama sekali
                            const showMenu = canModifyMember;

                            return (
                                <div key={member.id} className="card bg-base-100 border">
                                    <div className="card-body p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                {/* Avatar */}
                                                <div className="avatar">
                                                    <div className="w-12 h-12">
                                                        {/* InitialAvatar expects 'username' prop */}
                                                        <InitialAvatar username={member.user.name} />
                                                    </div>
                                                </div>

                                                {/* User Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold truncate">
                                                            {member.user.name}
                                                            {isCurrentUser && ' (You)'}
                                                        </h4>
                                                        {getRoleIcon(member.role)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-base-content/60 truncate">
                                                        <Mail size={14} className='flex-shrink-0' />
                                                        <span className='truncate'>{member.user.email}</span>
                                                    </div>
                                                    <p className="text-xs text-base-content/50">
                                                        Joined {new Date(member.joined_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {/* Role Badge */}
                                                <div className={`badge ${getRoleBadgeClass(member.role)} flex-shrink-0`}>
                                                    {member.role}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {showMenu && (
                                                <div className="dropdown dropdown-end flex-shrink-0">
                                                    <div 
                                                        tabIndex={0} 
                                                        role="button" 
                                                        className={`btn btn-ghost btn-sm btn-circle ${isActionDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                                                        title="Member actions"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </div>
                                                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
                                                        {canPromoteMember && (
                                                            <li>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMemberAction(member, 'promote')}
                                                                    className="w-full text-left flex items-center gap-2"
                                                                    disabled={isActionDisabled}
                                                                >
                                                                    <Shield size={16} />
                                                                    Promote to Admin
                                                                </button>
                                                            </li>
                                                        )}
                                                        {canDemoteMember && (
                                                            <li>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMemberAction(member, 'demote')}
                                                                    className="w-full text-left flex items-center gap-2"
                                                                    disabled={isActionDisabled}
                                                                >
                                                                    <User size={16} />
                                                                    Remove Admin Rights
                                                                </button>
                                                            </li>
                                                        )}
                                                        {canRemoveMember && (
                                                            <li>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMemberAction(member, 'remove')}
                                                                    className="w-full text-left flex items-center gap-2 text-error"
                                                                    disabled={isActionDisabled}
                                                                >
                                                                    <UserMinus size={16} />
                                                                    Remove Member
                                                                </button>
                                                            </li>
                                                        )}
                                                        {/* Jika tidak ada opsi modifikasi, dropdown tidak perlu menampilkan ini */}
                                                        {!canModifyMember && (
                                                             <li>
                                                                 <span className="disabled block w-full text-left px-2">
                                                                     No actions available
                                                                 </span>
                                                             </li>
                                                         )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end mt-8">
                        <button
                            className="btn btn-primary"
                            onClick={onClose}
                            disabled={isModalBusy}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

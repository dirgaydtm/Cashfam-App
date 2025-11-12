import { LogOut, MoreVertical, TrendingDown, TrendingUp, Users, Trash2, Crown, User, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FinancialBook } from "@/types";
import { formatRupiah } from "@/utils/currency";
import { getSpentPercent } from "@/utils/budget";
import { getColorById } from "@/utils/colorGenerator";
import React, { useMemo, useCallback } from "react";
import { router } from '@inertiajs/react';

interface BookCardProps {
    book: FinancialBook & {
        total_expenses: number;
        total_income: number;
        budget: number | null; // Tambahkan budget agar progress bar berfungsi
    };
    currentUserId: number;
    onManageMembers: (book: FinancialBook) => void;
    onLeave?: (book: FinancialBook) => void;
    onDelete?: (book: FinancialBook) => void;
}

interface SummaryItem {
    key: string;
    label: string;
    icon: LucideIcon;
    value: number;
    colorClass: string;
}

interface MenuAction {
    key: string;
    label: string;
    icon: LucideIcon;
    onClick: (book: FinancialBook) => void;
    visible?: () => boolean;
    className?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, currentUserId, onManageMembers, onLeave, onDelete }) => {
    const { total_income, total_expenses, budget } = book;

    // Generate consistent color based on book ID
    const headerColor = useMemo(() => getColorById(book.id), [book.id]);

    const userRole = useMemo(
        () => book.members.find((m) => m.user.id === currentUserId)?.role,
        [book.members, currentUserId]
    );

    const totalIncome = total_income ?? 0;
    const totalExpenses = total_expenses ?? 0;
    const spentPercent = useMemo(() => getSpentPercent(totalExpenses, budget), [totalExpenses, budget]);

    const summaryItems: SummaryItem[] = useMemo(
        () => [
            { key: "income", label: "Income", icon: TrendingUp, value: totalIncome, colorClass: "text-success" },
            { key: "expense", label: "Expense", icon: TrendingDown, value: totalExpenses, colorClass: "text-error" },
        ],
        [totalIncome, totalExpenses]
    );

    const canManageBook = userRole === "creator" || userRole === "admin";
    const canDeleteBook = userRole === "creator";
    const canLeaveBook = userRole === "member" || userRole === "admin";

    const menuActions: MenuAction[] = useMemo(
        () => [
            { key: "manage-members", label: "Manage Members / Invite", icon: Users, onClick: onManageMembers, visible: () => canManageBook, className: "text-base-content"},
            { key: "leave-book", label: "Leave Book", icon: LogOut, onClick: (b) => onLeave?.(b), visible: () => canLeaveBook && !!onLeave, className: "text-error" },
            { key: "delete-book", label: "Delete Book", icon: Trash2, onClick: (b) => onDelete?.(b), visible: () => canDeleteBook && !!onDelete, className: "text-error" },
        ],
        [onManageMembers, onLeave, onDelete, canManageBook, canDeleteBook, canLeaveBook]
    );

    const handleCardClick = useCallback(() => router.get(route('books.show', book.id)), [book.id]);

    const getRoleIcon = (): JSX.Element => {
        switch (userRole) {
            case 'creator': return <Crown size={16} />;
            case 'admin': return <Shield size={16} />;
            default: return <User size={16} />;
        }
    };

    return (
        <div
            className="card border border-base-content/30 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Open transactions for book ${book.name}`}
            onClick={handleCardClick}
        >
            {/* Header Section */}
            <div className={`card-header rounded-b-none ${headerColor} text-base-100 pl-4 pr-2 py-3`} onClick={(e) => e.stopPropagation()}>
                <h3 className="card-title flex items-center justify-between text-lg">
                    <span className="truncate max-w-[16rem] md:max-w-[15rem] lg:max-w-[11rem]">{book.name}</span>
                    <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <p className="hidden text-sm lg:flex">
                                {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ""}
                            </p>
                            {getRoleIcon()}
                        </span>
                        {/* Dropdown Menu */}
                        <div className="dropdown dropdown-end">
                            <label
                                tabIndex={0}
                                role="button"
                                onClick={e => e.stopPropagation()}
                                className="btn btn-ghost bg-transparent hover:bg-black/5 border-0 hover:shadow-none btn-circle"
                            >
                                <MoreVertical className="size-6 text-base-100" />
                            </label>
                            <ul
                                tabIndex={0}
                                className="dropdown-content z-[1] menu p-0 shadow-xl bg-base-100 rounded-box w-52 mt-1"
                                role="menu"
                                onClick={e => e.stopPropagation()}
                            >
                                {menuActions.filter((a) => !a.visible || a.visible()).map((action) => (
                                    <li key={action.key} role="none">
                                        <button
                                            onClick={evt => {
                                                evt.stopPropagation();
                                                action.onClick(book);
                                            }}
                                            className={`p-3 ${action.className}`}
                                            role="menuitem"
                                            type="button"
                                        >
                                            <action.icon size={16} />
                                            {action.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </span>
                </h3>
                <p className="text-xs md:text-sm h-10 line-clamp-2">{book.description}</p>
            </div>

            {/* Body Section */}
            <div className="hidden md:flex card-body gap-6 p-5">
                {/* Budget Progress */}
                {book.budget && (
                    <div className="hidden lg:flex flex-col">
                        <div className="flex justify-between text-xs lg:text-sm mb-1">
                            <span>Budget</span>
                            <span>{formatRupiah(budget)}</span>
                        </div>
                        <progress
                            className="progress progress-primary w-full"
                            value={totalExpenses}
                            max={budget}
                            aria-label={`Budget spent: ${spentPercent}%`}
                        />
                        <div className="flex justify-between text-xs text-base-content/60 mt-1">
                            <span>Spent: {formatRupiah(totalExpenses)}</span>
                            <span>{spentPercent}%</span>
                        </div>
                    </div>
                )}

                {/* Income & Expense Summary */}
                <div className="flex gap-6">
                    {summaryItems.map((item) => (
                        <div key={item.key} className="flex gap-1 items-center">
                            <div className={`text-lg font-semibold ${item.colorClass}`}>{formatRupiah(item.value)}</div>
                            <item.icon size={20} aria-label={item.label} className={item.colorClass} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookCard;
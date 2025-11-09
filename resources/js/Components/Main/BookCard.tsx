import { LogOut, MoreVertical, TrendingDown, TrendingUp, Users, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FinancialBook, Transaction } from "@/types";
import { formatRupiah } from "@/utils/currency";
import { getSpentPercent } from "@/utils/budget";
import React, { useMemo, useCallback } from "react";
import { router } from '@inertiajs/react';

interface BookCardProps {
    book: FinancialBook;
    currentUserId: number;
    transactions: Transaction[]; // 🔴 TODO-BE: Hapus ini, backend seharusnya kirim total_income & total_expense langsung di object book
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

const BookCard: React.FC<BookCardProps> = ({
    book,
    currentUserId,
    transactions,
    onManageMembers,
    onLeave,
    onDelete,
}) => {
    const userRole = useMemo(
        () => book.members.find((m) => m.user.id === currentUserId)?.role,
        [book.members, currentUserId]
    );

    // 🔴 TODO-BE: Filter & calculation di bawah ini SEHARUSNYA DILAKUKAN DI BACKEND
    // Backend seharusnya sudah kirim book.total_income & book.total_expense
    // Sehingga frontend tidak perlu filter & calculate manual

    // 🔴 BACKEND: Ini tidak efisien, FE menerima SEMUA transactions lalu di-filter per book
    const bookTransactions = useMemo(
        () => transactions.filter((t) => t.book_id === book.id && t.status === "approved"),
        [transactions, book.id]
    );

    // 🔴 BACKEND: Calculation ini seharusnya dilakukan di BE menggunakan SQL SUM()
    const { income: totalIncome, expense: totalExpenses } = useMemo(() => {
        return bookTransactions.reduce(
            (acc, t) => {
                if (t.type === "income") {
                    acc.income += t.amount;
                } else if (t.type === "expense") {
                    acc.expense += t.amount;
                }
                return acc;
            },
            { income: 0, expense: 0 }
        );
    }, [bookTransactions]);

    // ✅ SETELAH IMPLEMENTASI BE, ganti menjadi:
    // const totalIncome = book.total_income;
    // const totalExpenses = book.total_expense;
    // 🔴 END TODO-BE

    const spentPercent = useMemo(
        () => getSpentPercent(totalExpenses, book.budget),
        [totalExpenses, book.budget]
    );

    const summaryItems: SummaryItem[] = useMemo(
        () => [
            {
                key: "income",
                label: "Income",
                icon: TrendingUp,
                value: totalIncome,
                colorClass: "text-success",
            },
            {
                key: "expense",
                label: "Expense",
                icon: TrendingDown,
                value: totalExpenses,
                colorClass: "text-error",
            },
        ],
        [totalIncome, totalExpenses]
    );

    const canManageBook = userRole === "creator" || userRole === "admin";

    const menuActions: MenuAction[] = useMemo(
        () => [
            {
                key: "manage-members",
                label: "Manage Members / Invite",
                icon: Users,
                onClick: onManageMembers,
                visible: () => canManageBook,
            },
            {
                key: "delete-or-leave",
                label: userRole === "creator" ? "Delete Book" : "Leave Book",
                icon: userRole === "creator" ? Trash2 : LogOut,
                onClick: (b) => {
                    if (userRole === "creator") {
                        onDelete?.(b);
                    } else {
                        onLeave?.(b);
                    }
                },
                visible: () => (userRole === "creator" ? !!onDelete : !!onLeave),
                className: "text-error",
            },
        ],
        [onManageMembers, onLeave, onDelete, userRole, canManageBook]
    );

    const handleCardClick = useCallback(() => {
        router.get(route('books.show', book.id));
    }, [book.id]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
        }
    }, [handleCardClick]);

    const getRoleBadgeClass = () => {
        switch (userRole) {
            case "creator":
                return "badge-primary";
            case "admin":
                return "badge-secondary";
            default:
                return "badge-neutral";
        }
    };

    const getRoleDisplayText = () => {
        switch (userRole) {
            case "creator":
                return "Creator";
            case "admin":
                return "Admin";
            default:
                return "Member";
        }
    };

    return (
        <div
            className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/60"
            role="button"
            tabIndex={0}
            aria-label={`Open transactions for book ${book.name}`}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
        >
            <div className="card-body">
                <div className="flex justify-between items-start" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col w-[95%]">
                        <h3 className="card-title text-lg">
                            {book.name}
                            <div className={`badge ${getRoleBadgeClass()}`}>
                                {getRoleDisplayText()}
                            </div>
                        </h3>
                        <p className="text-base-content/60 text-sm h-12 line-clamp-2">
                            {book.description}
                        </p>
                    </div>

                    <div
                        className="w-[5%] dropdown dropdown-end"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                        <MoreVertical
                            tabIndex={0}
                            role="button"
                            aria-haspopup="menu"
                            aria-label="Book menu"
                            className="size-6 btn btn-ghost btn-sm btn-circle"
                        />
                        <ul
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                            role="menu"
                        >
                            {menuActions
                                .filter((a) => !a.visible || a.visible())
                                .map((action) => (
                                    <li key={action.key} role="none">
                                        <button
                                            onClick={(evt) => {
                                                evt.stopPropagation();
                                                action.onClick(book);
                                            }}
                                            className={action.className}
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
                </div>

                {book.budget && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs lg:text-sm mb-1">
                            <span>Budget</span>
                            <span>{formatRupiah(book.budget)}</span>
                        </div>
                        <progress
                            className="progress progress-primary w-full"
                            value={totalExpenses}
                            max={book.budget}
                            aria-label={`Budget spent: ${spentPercent}%`}
                        />
                        <div className="flex justify-between text-xs text-base-content/60 mt-1">
                            <span>Spent: {formatRupiah(totalExpenses)}</span>
                            <span>{spentPercent}%</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-6">
                    {summaryItems.map((item) => (
                        <div key={item.key} className="flex gap-1 items-center">
                            <div className={`text-lg font-semibold ${item.colorClass}`}>
                                {formatRupiah(item.value)}
                            </div>
                            <div className={`flex items-center ${item.colorClass}`}>
                                <item.icon size={20} aria-label={item.label} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookCard;
// Ini Belum

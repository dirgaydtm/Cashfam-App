// Dummy data for CasFam Finance Management App
import type { User, FinancialBook, Transaction } from '@/types';

// Dummy Users
export const dummyUsers: User[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        created_at: "2024-01-15T08:00:00Z",
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        created_at: "2024-01-20T09:00:00Z",
    },
    {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        created_at: "2024-02-01T10:00:00Z",
    },
    {
        id: 4,
        name: "Sarah Wilson",
        email: "sarah@example.com",
        created_at: "2024-02-10T11:00:00Z",
    },
];

// Current logged-in user (for demo purposes)
export const currentUser: User = dummyUsers[0];

// Dummy Financial Books
export const dummyFinancialBooks: FinancialBook[] = [
    // {
    //     id: "1",
    //     name: "Anggaran Keluarga 2024",
    //     description: "Mengelola pengeluaran keluarga dan tabungan untuk tahun ini",
    //     creator_id: 1,
    //     creator: dummyUsers[0],
    //     budget: 75000000,
    //     invitation_code: "KELUARGA24",
    //     members: [
    //         {
    //             id: "1",
    //             user: dummyUsers[0],
    //             role: "creator",
    //             joined_at: "2024-01-15T08:00:00Z",
    //         },
    //         {
    //             id: "2",
    //             user: dummyUsers[1],
    //             role: "admin",
    //             joined_at: "2024-01-16T09:00:00Z",
    //         },
    //         {
    //             id: "3",
    //             user: dummyUsers[2],
    //             role: "member",
    //             joined_at: "2024-01-20T10:00:00Z",
    //         },
    //     ],
    //     created_at: "2024-01-15T08:00:00Z",
    //     updated_at: "2024-03-01T08:00:00Z",
    // },
    // {
    //     id: "2",
    //     name: "Liburan ke Bali",
    //     description: "Merencanakan dan melacak pengeluaran untuk liburan ke bali",
    //     creator_id: 1,
    //     creator: dummyUsers[0],
    //     budget: 45000000,
    //     invitation_code: "BALI24",
    //     members: [
    //         {
    //             id: "4",
    //             user: dummyUsers[0],
    //             role: "creator",
    //             joined_at: "2024-02-01T08:00:00Z",
    //         },
    //         {
    //             id: "5",
    //             user: dummyUsers[3],
    //             role: "member",
    //             joined_at: "2024-02-02T09:00:00Z",
    //         },
    //     ],
    //     created_at: "2024-02-01T08:00:00Z",
    //     updated_at: "2024-02-15T08:00:00Z",
    // },
    // {
    //     id: "3",
    //     name: "Kost Bersama",
    //     description: "Melacak sewa, utilitas, dan pengeluaran bersama",
    //     creator_id: 2,
    //     creator: dummyUsers[1],
    //     budget: 37500000,
    //     invitation_code: "KOSTKUY",
    //     members: [
    //         {
    //             id: "6",
    //             user: dummyUsers[1],
    //             role: "creator",
    //             joined_at: "2024-01-01T08:00:00Z",
    //         },
    //         {
    //             id: "7",
    //             user: dummyUsers[0],
    //             role: "member",
    //             joined_at: "2024-01-02T09:00:00Z",
    //         },
    //         {
    //             id: "8",
    //             user: dummyUsers[2],
    //             role: "member",
    //             joined_at: "2024-01-03T10:00:00Z",
    //         },
    //     ],
    //     created_at: "2024-01-01T08:00:00Z",
    //     updated_at: "2024-02-28T08:00:00Z",
    // },
];

// Dummy Transactions
export const dummyTransactions: Transaction[] = [
    {
        id: "1",
        book_id: "1",
        user_id: 1,
        user: dummyUsers[0],
        type: "expense",
        category: "Belanja",
        amount: 1875000,
        description: "Belanja mingguan di supermarket",
        date: "2024-03-01",
        status: "approved",
        approved_by: dummyUsers[1],
        created_at: "2024-03-01T14:30:00Z",
        updated_at: "2024-03-01T15:00:00Z",
    },
    {
        id: "2",
        book_id: "1",
        user_id: 2,
        user: dummyUsers[1],
        type: "income",
        category: "Gaji",
        amount: 45000000,
        description: "Gaji bulanan",
        date: "2024-03-01",
        status: "approved",
        approved_by: dummyUsers[0],
        created_at: "2024-03-01T09:00:00Z",
        updated_at: "2024-03-01T09:15:00Z",
    },
    {
        id: "3",
        book_id: "1",
        user_id: 3,
        user: dummyUsers[2],
        type: "expense",
        category: "Utilitas",
        amount: 1286250,
        description: "Tagihan listrik bulan Februari",
        date: "2024-02-28",
        status: "pending",
        created_at: "2024-02-28T16:45:00Z",
        updated_at: "2024-02-28T16:45:00Z",
    },
    {
        id: "4",
        book_id: "2",
        user_id: 1,
        user: dummyUsers[0],
        type: "expense",
        category: "Transportasi",
        amount: 6750000,
        description: "Tiket pesawat ke Jakarta",
        date: "2024-02-15",
        status: "approved",
        approved_by: dummyUsers[0],
        created_at: "2024-02-15T11:20:00Z",
        updated_at: "2024-02-15T11:25:00Z",
    },
    {
        id: "5",
        book_id: "3",
        user_id: 1,
        user: dummyUsers[0],
        type: "expense",
        category: "Sewa",
        amount: 12000000,
        description: "Pembayaran sewa bulanan",
        date: "2024-03-01",
        status: "approved",
        approved_by: dummyUsers[1],
        created_at: "2024-03-01T08:00:00Z",
        updated_at: "2024-03-01T08:30:00Z",
    },
    {
        id: "6",
        book_id: "1",
        user_id: 2,
        user: dummyUsers[1],
        type: "expense",
        category: "Hiburan",
        amount: 678750,
        description: "Tiket bioskop dan popcorn",
        date: "2024-02-29",
        status: "rejected",
        approved_by: dummyUsers[0],
        created_at: "2024-02-29T20:15:00Z",
        updated_at: "2024-03-01T09:00:00Z",
    },
];



// Transaction Categories
export const transactionCategories = [
    "Belanja",
    "Utilitas",
    "Sewa",
    "Transportasi",
    "Hiburan",
    "Kesehatan",
    "Pendidikan",
    "Berbelanja",
    "Makan",
    "Perjalanan",
    "Gaji",
    "Freelance",
    "Investasi",
    "Hadiah",
    "Lainnya",
];





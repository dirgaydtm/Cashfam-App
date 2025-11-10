// Dummy data for CasFam Finance Management App
import type { User } from '@/types';

// Dummy Users
export const dummyUsers: User[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        created_at: "2024-01-15T08:00:00Z",
    },
];

// Current logged-in user (for demo purposes)
export const currentUser: User = dummyUsers[0];


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





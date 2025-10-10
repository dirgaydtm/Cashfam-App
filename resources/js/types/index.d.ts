export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

// CasFam-specific interfaces
export interface FinancialBook {
    id: string;
    name: string;
    description: string;
    creator_id: number;
    creator: User;
    budget?: number;
    members: BookMember[];
    invitation_code: string;
    created_at: string;
    updated_at: string;
}

export interface BookMember {
    id: string;
    user: User;
    role: 'creator' | 'admin' | 'member';
    joined_at: string;
}

export interface Transaction {
    id: string;
    book_id: string;
    user_id: number;
    user: User;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    approved_by?: User;
    created_at: string;
    updated_at: string;
}

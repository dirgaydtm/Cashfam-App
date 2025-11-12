<?php

// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\FinancialBook; // Pastikan model ini sudah diimpor!

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Mengambil semua buku di mana pengguna (ID yang sedang login) adalah anggota.
        $userBooks = FinancialBook::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        // PENTING: Eager load relasi yang dibutuhkan frontend
        ->with(['members.user']) // Muat relasi members
        // 🚀 TAMBAHKAN: Muat total income dan expense
        ->withSum(['transactions as total_income' => function ($q) {
            $q->where('type', 'income')->where('status', 'approved');
        }], 'amount')
        ->withSum(['transactions as total_expenses' => function ($q) {
            $q->where('type', 'expense')->where('status', 'approved');
        }], 'amount')
        ->orderBy('created_at', 'desc') // Urutkan berdasarkan yang terbaru dibuat
        ->get(); // Ambil koleksi buku

        return Inertia::render('Main/Dashboard', [ 
            'userBooks' => $userBooks
        ]);
    }
}
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
        ->with([
            'creator',       // Untuk menampilkan siapa pembuat buku
            'members.user'   // Untuk mendapatkan daftar anggota dan data pengguna mereka
        ])
        ->get();

        return Inertia::render('Main/Dashboard', [
            // Mengirim data nyata ke frontend
            'userBooks' => $userBooks,
            'transactions' => [], // Kirim array kosong atau data transaksi nyata
        ]);
    }
}
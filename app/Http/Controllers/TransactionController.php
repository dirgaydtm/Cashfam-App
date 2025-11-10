<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use App\Models\FinancialBook;


class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::query();

        if ($request->has('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        $transactions = $query->with(['user', 'approvedBy'])->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|integer',
            'user_id' => 'required|integer',
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0.01', // Tambahkan min value
            'description' => 'required|string',
            'date' => 'required|date',
        ]);

        // Set nilai default untuk field yang tidak diinput user
        $validated['status'] = 'pending';        
        $validated['approved_by'] = null;        
        
        // Buat transaksi baru
        $transaction = Transaction::create($validated);

        return response()->json([
            'message' => 'Transaction created successfully',
            'data' => $transaction,
        ], 201);
    }


    // Tampilkan detail transaksi berdasarkan ID
    public function show($id)
    {
        $transaction = Transaction::with(['user', 'approvedBy'])->findOrFail($id);
        return response()->json($transaction);
    }

    public function approve(Transaction $transaction, Request $request)
    {
        if (!Auth::check()) {
            // Ini seharusnya tidak terjadi jika middleware 'auth' berjalan,
            // tetapi ini adalah pemeriksaan keamanan tambahan untuk 500 error
            return response()->json(['message' => 'User not authenticated.'], 401);
        }

        $userId = Auth::id();

        // 2. Otorisasi: Pastikan pengguna memiliki izin di buku ini
        // Asumsi: Transaksi memiliki relasi 'book'
        $book = $transaction->book; 
        
        // Asumsi: Model Book memiliki relasi 'members'
        // Anda perlu memastikan tabel/model BookMember ada dan memiliki kolom user_id dan role
        $member = $book->members()->where('user_id', $userId)->first();

        // Cek apakah pengguna adalah member dan memiliki peran 'creator' atau 'admin'
        if (!$member || !in_array($member->role, ['creator', 'admin'])) {
             return response()->json(['message' => 'Anda tidak memiliki izin (admin/creator) untuk menyetujui transaksi ini.'], 403);
        }


        // 3. Cek Status: Hanya bisa menyetujui yang 'pending'
        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi sudah disetujui atau ditolak sebelumnya.'], 400);
        }

        // 4. Update Status
        $transaction->status = 'approved';
        $transaction->approved_by = $userId; // Gunakan ID yang sudah divalidasi
        
        // Memastikan penyimpanan berhasil
        if (!$transaction->save()) {
             // Jika ada masalah database selain constraint violation (misalnya, koneksi), ini membantu menangkapnya
             return response()->json(['message' => 'Gagal menyimpan perubahan status transaksi ke database.'], 500);
        }
        
        // 5. Update Saldo Buku (Logika ini harus diimplementasikan secara terpisah, misalnya di service layer atau event)
        // ...

        return response()->json(['message' => 'Transaksi berhasil disetujui.', 'transaction' => $transaction->load(['user', 'approvedBy'])]);
    }

    public function reject(Transaction $transaction, Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'User not authenticated.'], 401);
        }
        
        $userId = Auth::id();
        $book = $transaction->book; 
        $member = $book->members()->where('user_id', $userId)->first();
        
        if (!$member || !in_array($member->role, ['creator', 'admin'])) {
             return response()->json(['message' => 'Anda tidak memiliki izin (admin/creator) untuk menolak transaksi ini.'], 403);
        }

        // Cek Status
        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi sudah disetujui atau ditolak sebelumnya.'], 400);
        }

        // Update Status
        $transaction->status = 'rejected';
        // Opsional: Anda mungkin ingin mencatat siapa yang menolak, tergantung desain skema Anda
        // $transaction->approved_by = $userId; 
        // $transaction->approved_at = now(); 
        
        if (!$transaction->save()) {
            return response()->json(['message' => 'Gagal menyimpan perubahan status transaksi ke database.'], 500);
        }

        return response()->json(['message' => 'Transaksi berhasil ditolak.', 'transaction' => $transaction->load(['user', 'approvedBy'])]);
    }
}

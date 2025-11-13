<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
            'amount' => 'required|numeric|min:0.01', 
            'description' => 'required|string',
            'date' => 'required|date',
        ]);

        $validated['status'] = 'pending';        
        $validated['approved_by'] = null;        
        
        $transaction = Transaction::create($validated);

        return response()->json([
            'message' => 'Transaction created successfully',
            'data' => $transaction,
        ], 201);
    }


    public function show($id)
    {
        $transaction = Transaction::with(['user', 'approvedBy'])->findOrFail($id);
        return response()->json($transaction);
    }

    public function destroy(Transaction $transaction)
    {
        $user = Auth::user();

        $book = $transaction->book; 
        $member = $book->members()->where('user_id', $user->id)->first();

        if (!$member || !in_array($member->role, ['creator', 'admin'])) {
            Log::warning("Akses Ditolak: User ID {$user->id} mencoba menghapus Transaksi ID {$transaction->id} tanpa izin.");
            return response()->json(['message' => 'Anda tidak memiliki hak untuk menghapus transaksi ini.'], 403);
        }

        try {
            $transactionName = $transaction->description;
            $transaction->delete();

            Log::info("Transaksi ID {$transaction->id} ({$transactionName}) berhasil dihapus oleh User ID {$user->id}.");
            
            return response()->json(['message' => 'Transaksi berhasil dihapus.'], 200);

        } catch (\Exception $e) {
            Log::error('Transaction deletion failed: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal menghapus transaksi karena kesalahan server.'], 500);
        }
    }

    public function approve(Transaction $transaction, Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'User not authenticated.'], 401);
        }

        $userId = Auth::id();

        $book = $transaction->book; 

        $member = $book->members()->where('user_id', $userId)->first();

        if (!$member || !in_array($member->role, ['creator', 'admin'])) {
             return response()->json(['message' => 'Anda tidak memiliki izin (admin/creator) untuk menyetujui transaksi ini.'], 403);
        }

        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi sudah disetujui atau ditolak sebelumnya.'], 400);
        }

        $transaction->status = 'approved';
        $transaction->approved_by = $userId; 
        
        if (!$transaction->save()) {
             return response()->json(['message' => 'Gagal menyimpan perubahan status transaksi ke database.'], 500);
        }
        
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
        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi sudah disetujui atau ditolak sebelumnya.'], 400);
        }

        $transaction->status = 'rejected';
        if (!$transaction->save()) {
            return response()->json(['message' => 'Gagal menyimpan perubahan status transaksi ke database.'], 500);
        }

        return response()->json(['message' => 'Transaksi berhasil ditolak.', 'transaction' => $transaction->load(['user', 'approvedBy'])]);
    }
}

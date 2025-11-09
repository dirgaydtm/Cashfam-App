<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;


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
            'amount' => 'required|numeric',
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
}

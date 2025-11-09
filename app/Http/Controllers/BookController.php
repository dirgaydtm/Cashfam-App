<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FinancialBook;
use App\Models\BookMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str; // <-- Tambahkan ini untuk membuat kode unik
use Inertia\Inertia; // Opsional, tetapi bagus untuk konteks Inertia


class BookController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Data diterima dari modal:', $request->all());

        $validated = $request->validate([
            
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',     // budget opsional, minimal 0 jika diisi
            'budget' => 'nullable|numeric|min:0', 

        ]);

        $user = $request->user(); // Pengguna yang sedang login

        try {
            DB::transaction(function () use ($validated, $user) {
                
                // 1. Buat Kode Undangan Unik
                // Gunakan do-while loop untuk memastikan kode tidak duplikat
                do {
                    $invitationCode = Str::random(8); // Contoh kode 8 karakter
                } while (FinancialBook::where('invitation_code', $invitationCode)->exists());

                // 2. Buat Buku Baru di tabel financial_books
                $book = FinancialBook::create([
                    'creator_id' => $user->id,
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                    'budget' => $validated['budget'] ?? 0, // Default 0 jika tidak diisi
                    'invitation_code' => $invitationCode,
                ]);

                // 3. Tambahkan Pembuat sebagai Anggota Buku (Creator)
                BookMember::create([
                    'book_id' => $book->id,
                    'user_id' => $user->id,
                    'role' => 'creator',
                    'joined_at' => now(),
                ]);
            });

            // Inertia Success Response
            // Mengarahkan pengguna kembali ke dashboard dan memuat ulang 'userBooks'
            return redirect()->route('dashboard')
                             ->with('success', 'Buku keuangan berhasil dibuat!');

        } catch (\Exception $e) {
            // Log error jika ada masalah database
            Log::error('Book creation failed: ' . $e->getMessage());
            
            // Redirect kembali dengan error 
            return redirect()->back()
                             ->withErrors(['general' => 'Gagal membuat buku. Silakan coba lagi.']);
        }
    }

    public function show(FinancialBook $book)
    {
        $user = Auth::user();
        $book->load('members');
        if (!$book->members->contains('user_id', $user->id)) {
            Log::warning('Akses Ditolak ke Buku ID ' . $book->id . ' oleh User ID ' . $user->id);
            abort(403, 'Anda tidak memiliki akses ke buku ini.');
        }
        
        // Eager Load yang Dibutuhkan untuk tampilan Book
        $book->load([
            'creator',
            'members.user',
        ]);

        return Inertia::render('Main/Book', [
            'book' => $book,
            'transactions' => [], // Masih array kosong sampai tabel transactions siap.
        ]);
    }
}
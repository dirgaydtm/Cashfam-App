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
use Illuminate\Validation\ValidationException;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Requests\UpdateBookMemberRequest;


class BookController extends Controller
{
    protected function authorizeCreator(FinancialBook $book)
    {
        $user = Auth::user();

        if ($book->creator_id !== $user->id) {
            Log::warning("Akses Ditolak: User ID {$user->id} mencoba melakukan aksi Creator pada Buku ID {$book->id}.");
            if (request()->wantsJson() || request()->is('api/*') || request()->inertia()) {
                 abort(403, 'Hanya pembuat buku yang dapat melakukan aksi ini.');
            }
            return false;
        }
        return true;
    }

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
        
        $book->load([
            'creator',
            'members.user',
        ]);
        // 1. Ganti loadSum dengan perhitungan langsung menggunakan withSum
        $totals = $book->transactions()
            ->where('status', 'approved')
            ->selectRaw('SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as total_income')
            ->selectRaw('SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as total_expenses')
            ->first(); // Ambil hasilnya

        // 2. Siapkan data buku yang akan dikirim ke Inertia
        $bookData = array_merge($book->toArray(), [
            'total_income' => (int) ($totals->total_income ?? 0),
            'total_expenses' => (int) ($totals->total_expenses ?? 0),
            'current_balance' => (int) ($totals->total_income ?? 0) - (int) ($totals->total_expenses ?? 0),
        ]);

        // $book->loadSum('transactions as total_income', 'amount', fn ($q) => $q->where('type', 'income'));
        // $book->loadSum('transactions as total_expenses', 'amount', fn ($q) => $q->where('type', 'expense'));

        return Inertia::render('Main/Book', [
            'book' => $bookData, // Kirim data yang sudah di-merge
            'transactions' => [], 
            // Anda mungkin ingin menempatkan perhitungan di atas ke dalam $bookData
        ]);
    }

    public function join(Request $request)
    {
        // 1. Validasi Input (Pastikan kode 8 karakter)
        $validated = $request->validate([
            'invitation_code' => 'required|string|size:8',
        ]);

        $user = Auth::user();
        $code = strtoupper($validated['invitation_code']); // Pastikan kode dalam huruf besar

        // 2. Cari Buku Berdasarkan Kode Undangan
        $book = FinancialBook::where('invitation_code', $code)->first();

        if (!$book) {
            // Jika buku tidak ditemukan, kirim respons 422 (Unprocessable Entity)
            return response()->json([
                'message' => 'Kode undangan tidak valid.',
                'errors' => ['invitation_code' => ['Kode undangan tidak ditemukan.']]
            ], 422);
        }

        // 3. Periksa apakah pengguna sudah menjadi anggota
        $isMember = BookMember::where('book_id', $book->id)
                              ->where('user_id', $user->id)
                              ->exists();

        if ($isMember) {
            // Jika sudah menjadi anggota, kirim respons 422
            return response()->json([
                'message' => 'Anda sudah menjadi anggota buku ini.',
                'errors' => ['invitation_code' => ['Anda sudah menjadi anggota buku ini.']]
            ], 422);
        }

        try {
            // 4. Tambahkan pengguna sebagai anggota baru (role: member)
            BookMember::create([
                'book_id' => $book->id,
                'user_id' => $user->id,
                'role' => 'member',
                'joined_at' => now(),
            ]);

            // 5. Sukses: Kirim respons JSON dengan ID buku
            return response()->json([
                'message' => 'Berhasil bergabung ke buku keuangan.',
                'book_id' => $book->id,
            ], 200);

        } catch (\Exception $e) {
            // Log error jika ada masalah database
            Log::error('Book join failed for user ' . $user->id . ': ' . $e->getMessage());
            
            // Kirim respons 500 Internal Server Error
            return response()->json([
                'message' => 'Gagal bergabung ke buku karena kesalahan server.'
            ], 500);
        }
    }

    public function update(UpdateBookRequest $request, FinancialBook $book)
    {
        // 1. Cek apakah ini rute nested untuk anggota (books.members.update)
        if ($request->route()->getName() === 'books.members.update') {
            
            // Resolve UpdateBookMemberRequest secara eksplisit untuk validasi anggota
            $memberRequest = app(UpdateBookMemberRequest::class);
            
            // Panggil fungsi internal untuk mengelola peran
            return $this->updateMemberRole($memberRequest, $book, $request->route('member'));
        }

        // 2. Ini adalah update detail buku standar (books.update)
        $this->authorizeCreator($book);

        $validated = $request->validated();

        $book->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'budget' => $validated['budget'],
        ]);

        return redirect()->back()->with('success', 'Detail buku berhasil diperbarui.');
    }


    public function destroy(FinancialBook $book, BookMember $member)
    {
        // Pastikan ini adalah rute penghapusan anggota
        if (request()->route()->getName() !== 'books.members.destroy') {
             abort(404);
        }

        $this->authorizeCreator($book);
        
        if ($member->book_id !== $book->id) {
            return back()->withErrors(['error' => 'Anggota tidak valid untuk buku ini.']);
        }

        if ($member->role === 'creator') {
            return back()->withErrors(['error' => 'Creator tidak dapat dihapus dari buku.']);
        }

        try {
            $member->delete();
            return back()->with('success', 'Anggota berhasil dihapus dari buku.');

        } catch (\Exception $e) {
            Log::error("Failed to remove member ID {$member->user_id}: " . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus anggota.']);
        }
    }

    public function leave(FinancialBook $book)
    {
        $user = Auth::user();
        $membership = $book->members()->where('user_id', $user->id)->first();

        if (!$membership) {
            // User sudah tidak ada di buku ini, tidak perlu tindakan lebih lanjut.
            return back()->with('message', 'Anda sudah tidak menjadi anggota buku ini.');
        }

        if ($membership->role === 'creator') {
            return back()->withErrors(['error' => 'Creator tidak dapat meninggalkan buku yang mereka buat. Anda harus menghapus buku atau mentransfer kepemilikan terlebih dahulu.']);
        }
        
        try {
            DB::transaction(function () use ($membership) {
                $deleted = $membership->delete();
                Log::info("Status penghapusan keanggotaan (1=berhasil): " . $deleted); // PENTING!
            });

            return redirect()->route('books.index')->with('success', "Anda telah berhasil meninggalkan buku '{$book->name}'.");
        } catch (\Exception $e) {
            Log::error("Gagal meninggalkan buku ID {$book->id}: " . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal meninggalkan buku. Silakan coba lagi.']);
        }
    }

    public function regenerateInvitation(FinancialBook $book)
    {
        // Otorisasi: Hanya Creator yang bisa me-regenerate kode
        if (Auth::id() !== $book->creator_id) {
            throw ValidationException::withMessages([
                'invitation_code' => 'Hanya pembuat buku (creator) yang diizinkan untuk me-regenerate kode undangan.'
            ]);
        }

        // Buat kode baru (asumsi helper/fungsi membuat kode unik ada)
        do {
            $newCode = Str::random(8); // Gunakan 8 karakter untuk konsistensi
        } while (FinancialBook::where('invitation_code', $newCode)->exists());

        $book->invitation_code = $newCode; 
        $book->save();

        // Redirect/Inertia response untuk pembaruan
        // Asumsikan Anda ingin me-reload prop 'book'
        return redirect()->back()->with('success', 'Kode undangan berhasil diperbarui!');
    }
    
    public function updateMember(UpdateBookMemberRequest $request, FinancialBook $book, BookMember $member)
    {
        return $this->updateMemberRole($request, $book, $member);
    }

    public function destroyMember(FinancialBook $book, BookMember $member)
    {
        $currentUserMember = $book->members()->where('user_id', Auth::id())->first();
        
        if (!$currentUserMember) {
            throw ValidationException::withMessages(['member' => 'Anda bukan anggota buku ini.']);
        }

        // 1. Pencegahan Penghapusan Diri Sendiri
        if ($member->user_id === Auth::id()) {
            throw ValidationException::withMessages(['member' => 'Anda tidak dapat menghapus diri sendiri. Silakan tinggalkan buku ini melalui pengaturan yang sesuai.']);
        }

        // 2. Otorisasi (Admin atau Creator)
        $isRequesterCreator = $currentUserMember->role === 'creator';
        $isRequesterAdminOrCreator = $isRequesterCreator || $currentUserMember->role === 'admin';

        if (!$isRequesterAdminOrCreator) {
            throw ValidationException::withMessages(['member' => 'Anda tidak memiliki hak untuk menghapus anggota.']);
        }

        // 3. Pencegahan Penghapusan Creator
        if ($member->role === 'creator') {
             throw ValidationException::withMessages(['member' => 'Anda tidak dapat menghapus pembuat buku (creator).']);
        }
        
        // 4. Pencegahan Admin Menghapus satu-satunya Admin/Creator yang tersisa (Logika frontend Anda)
        $approverCount = $book->members()->whereIn('role', ['creator', 'admin'])->count();
        if ($member->role === 'admin' && $approverCount <= 1) {
             throw ValidationException::withMessages(['member' => 'Tidak dapat menghapus admin terakhir. Buku harus memiliki setidaknya satu admin atau creator.']);
        }

        // Lakukan penghapusan
        $member->delete();

        return redirect()->back()->with('success', "Anggota **{$member->user->name}** berhasil dihapus dari buku.");
    }
    /**
     * INTERNAL: Menangani Promote dan Demote Anggota.
     * @param UpdateBookMemberRequest $request
     * @param FinancialBook $book
     * @param BookMember $member
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function updateMemberRole(UpdateBookMemberRequest $request, FinancialBook $book, BookMember $member)
    {
        // TAMBAHAN FIX 1: Otomatisasi Creator di Controller
        // Ini akan menangani 403 jika UpdateBookMemberRequest gagal mengotorisasi Creator.
        $this->authorizeCreator($book);

        if ($member->book_id !== $book->id) {
            return back()->withErrors(['error' => 'Anggota tidak valid untuk buku ini.']);
        }

        if ($member->user_id === Auth::id()) {
            return back()->withErrors(['error' => 'Anda tidak dapat mengubah peran Anda sendiri.']);
        }

        $action = $request->validated('action');
        // TAMBAHAN FIX 2: Mengubah peran promosi dari 'editor' menjadi 'admin'
        $newRole = $action === 'promote' ? 'admin' : 'member'; 

        if ($member->role === 'creator') {
            return back()->withErrors(['error' => 'Peran creator tidak dapat diubah.']);
        }
        
        if ($member->role === $newRole) {
             $message = $action === 'promote' ? 'Anggota sudah menjadi admin.' : 'Anggota sudah menjadi member.';
             return back()->withErrors(['error' => $message]);
        }
        
        try {
            $member->update(['role' => $newRole]);
            // TAMBAHAN FIX 2: Pesan notifikasi disesuaikan
            $message = $action === 'promote' ? 'Anggota berhasil dipromosikan menjadi admin.' : 'Anggota berhasil didemosi menjadi member.';
            return back()->with('success', $message);

        } catch (\Exception $e) {
            Log::error("Failed to update member role ID {$member->user_id}: " . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal mengubah peran anggota.']);
        }
    }   

   
}
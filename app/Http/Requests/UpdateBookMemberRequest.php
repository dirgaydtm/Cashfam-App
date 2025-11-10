<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\BookMember;

class UpdateBookMemberRequest extends FormRequest
{
    /**
     * Tentukan apakah pengguna diizinkan untuk membuat permintaan ini.
     * Kita akan menggunakan helper otorisasi di controller, namun ini adalah tempat ideal
     * untuk otorisasi spesifik permintaan.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Ambil model FinancialBook dari rute
        $book = $this->route('book');

        // Jika model buku tidak ditemukan (walaupun seharusnya sudah di-resolve)
        if (!$book) {
            return false;
        }

        $user = Auth::user();
        
        // 1. Otorisasi sebagai Creator
        if ($book->creator_id === $user->id) {
            return true;
        }

        // 2. Otorisasi sebagai Admin
        // Periksa di tabel pivot/anggota apakah pengguna saat ini adalah Admin buku ini
        $is_admin = $book->members()
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->exists();

        return $is_admin;    
    }

    /**
     * Dapatkan aturan validasi yang berlaku untuk permintaan tersebut.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            // Aksi harus ada dan hanya boleh 'promote' atau 'demote'
            'action' => 'required|in:promote,demote',
        ];
    }

    /**
     * Dapatkan pesan kesalahan khusus untuk aturan validasi.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'action.required' => 'Aksi (promote atau demote) harus ditentukan.',
            'action.in' => 'Aksi yang tidak valid. Hanya diizinkan "promote" atau "demote".',
        ];
    }
}
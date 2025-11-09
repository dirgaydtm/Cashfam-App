<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
{
    /**
     * Tentukan apakah pengguna diizinkan untuk membuat permintaan ini.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Ganti 'false' menjadi 'true' jika Anda tidak menggunakan authorization gate/policy
        // atau gunakan logic otorisasi yang sesuai
        return true; 
    }

    /**
     * Dapatkan aturan validasi yang berlaku untuk permintaan.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            // Nama buku wajib diisi dan berupa string
            'name' => ['required', 'string', 'max:255'],

            // Deskripsi bersifat opsional (nullable)
            'description' => ['nullable', 'string', 'max:500'],

            // Budget bersifat opsional (nullable). 
            // Jika ada, harus berupa angka (numeric) dan minimal 0.
            'budget' => ['nullable', 'numeric', 'min:0'],
        ];
    }
    
    /**
     * Siapkan data untuk validasi.
     *
     * Ini penting untuk memastikan input kosong dari frontend 
     * diubah menjadi NULL sebelum divalidasi dan disimpan.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Jika 'budget' dikirim sebagai string kosong dari form HTML, 
        // kita paksa menjadi null agar lolos aturan 'nullable'.
        if ($this->budget === '') {
            $this->merge([
                'budget' => null,
            ]);
        }
    }
}
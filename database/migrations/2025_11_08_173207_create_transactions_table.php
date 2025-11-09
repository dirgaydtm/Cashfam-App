<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            // foreign key ke FinancialBook (Buku Keuangan)
            $table->foreignId('book_id')
                  ->constrained('financial_books')
                  ->onDelete('cascade')
                  ->comment('Buku Keuangan terkait');

            // foreign key  ke User yang membuat transaksi
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade')
                  ->comment('Pengguna yang mengajukan transaksi');

            $table->enum('type', ['income', 'expense'])->comment('Jenis: pemasukan atau pengeluaran');
            $table->string('category', 100);
            
            // Menggunakan decimal untuk data keuangan
            $table->decimal('amount', 15, 2); 
            
            $table->text('description');
            $table->date('date');
            
            // Status persetujuan
            $table->string('status', 20)->default('pending')->comment('Status: pending, approved, rejected');

            // Kunci asing ke User yang menyetujui (nullable)
            $table->foreignId('approved_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null')
                  ->comment('Pengguna yang menyetujui transaksi');

            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_members', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('book_id')->constrained('financial_books')->onDelete('cascade');
            
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('role')->default('member'); 

            $table->timestamp('joined_at')->useCurrent(); 

            $table->unique(['book_id', 'user_id']);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_members');
    }
};

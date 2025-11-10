<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookMember extends Model
{
    protected $fillable = [
        'book_id',
        'user_id',
        'role',
        'joined_at',
    ];
    
    // User (Relasi BelongsTo ke User)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Book (Relasi BelongsTo ke FinancialBook)
    public function book(): BelongsTo
    {
        return $this->belongsTo(FinancialBook::class, 'book_id');
    }
}
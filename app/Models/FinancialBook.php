<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialBook extends Model
{
    protected $fillable = [
        'name',
        'description',
        'creator_id',
        'budget',
        'invitation_code',
    ];
    
    // Creator (Relasi BelongsTo ke User)
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    // Members (Relasi HasMany ke BookMember)
    public function members()
    {
        return $this->hasMany(BookMember::class, 'book_id');
    }
    
    // Transaksi (Relasi HasMany ke Transaction)
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'book_id');
    }
}
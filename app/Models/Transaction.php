<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'book_id',
        'user_id',
        'type',
        'category',
        'amount',
        'description',
        'date',
        'status',
        'approved_by',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(FinancialBook::class, 'book_id'); 
    }
    
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

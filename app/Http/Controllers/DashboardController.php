<?php

// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\FinancialBook;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $userBooks = FinancialBook::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['members.user']) 
        ->withSum(['transactions as total_income' => function ($q) {
            $q->where('type', 'income')->where('status', 'approved');
        }], 'amount')
        ->withSum(['transactions as total_expenses' => function ($q) {
            $q->where('type', 'expense')->where('status', 'approved');
        }], 'amount')
        ->orderBy('created_at', 'desc')
        ->get();

        return Inertia::render('Main/Dashboard', [ 
            'userBooks' => $userBooks
        ]);
    }
}
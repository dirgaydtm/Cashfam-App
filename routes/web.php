<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\BookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index']) 
    ->middleware(['auth'])
    ->name('dashboard');

Route::get('/books/{book}', [BookController::class, 'show']) 
    ->middleware(['auth'])
    ->name('books.show');

Route::get('/theme', function () {
    return Inertia::render('Theme/Theme');
})->middleware(['auth'])->name('theme');

Route::middleware(['auth','verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/books', [BookController::class, 'store'])->name('books.store');
    Route::patch('/books/{book}', [BookController::class, 'update'])->name('books.update');
    Route::post('/books/join', [BookController::class, 'join'])->name('books.join');
    Route::post('/books/{book}/leave', [BookController::class, 'leave'])->name('books.leave');

    Route::delete('/books/{book}', [BookController::class, 'destroyBook'])->name('books.destroy');
    Route::get('/books/{book}', [BookController::class, 'show'])->name('books.show');

    Route::post('books/{book}/regenerate-invitation', [BookController::class, 'regenerateInvitation'])
         ->name('books.regenerate-invitation');

    Route::resource('books.members', BookController::class)->only([
        'update',
        'destroy', 
    ]);
    
    Route::patch('books/{book}/members/{member}', [BookController::class, 'updateMember'])
        ->name('books.members.update');

    Route::delete('books/{book}/members/{member}', [BookController::class, 'destroyMember'])
        ->name('books.members.destroy');

    Route::post('/books/{book}/promote-member', [BookController::class, 'promoteMember'])->name('books.promote-member');
    Route::post('/books/{book}/demote-member', [BookController::class, 'demoteMember'])->name('books.demote-member');
    Route::post('/books/{book}/remove-member', [BookController::class, 'removeMember'])->name('books.remove-member');

    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    
    Route::post('/transactions/{transaction}/approve', [TransactionController::class, 'approve'])->name('transactions.approve');
    Route::post('/transactions/{transaction}/reject', [TransactionController::class, 'reject'])->name('transactions.reject');
});

require __DIR__.'/auth.php';

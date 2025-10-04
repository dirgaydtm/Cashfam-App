<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() 
        ? redirect()->route('dashboard') 
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Main/Dashboard');
})->middleware(['auth'])->name('dashboard');

Route::get('/books/{book}', function (string $book) {
    return Inertia::render('Main/Book', [
        'bookId' => $book,
    ]);
})->middleware(['auth'])->name('books.show');

Route::get('/theme', function () {
    return Inertia::render('Theme/Theme');
})->middleware(['auth'])->name('theme');

Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

<?php

use App\Http\Controllers\ChessController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');
Route::get('/chess/moves', [ChessController::class, 'moves'])->name('chess.moves');
Route::post('/chess/move', [ChessController::class, 'move'])->name('chess.move');

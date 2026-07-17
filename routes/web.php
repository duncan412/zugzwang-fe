<?php

use Developful\Zugzwang\Chess;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {


    return view('welcome');
})->name('home');


Route::get('/chess', function () {
    $chess = new Chess();
    $fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    $moves = $chess->getPossibleMoves($fen);

    dd($moves);
})->name('chess');

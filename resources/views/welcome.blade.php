<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Play Zugzwang</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <!-- Styles / Scripts -->
        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
    </head>
    <body>
        <main class="chess-app">
            <header>
                <h1>Play Zugzwang</h1>
                <p>You play white against the PHP chess engine. Drag a piece to make your move.</p>
            </header>
            <div class="game-layout">
                <div id="myBoard" data-moves-url="{{ route('chess.moves', absolute: false) }}"
                    data-move-url="{{ route('chess.move', absolute: false) }}" aria-label="Chessboard"></div>
                <section class="game-panel" aria-label="Game information">
                    <p id="game-status" role="status" aria-live="polite">Loading legal moves...</p>
                    <div class="game-actions">
                        <button id="new-game" type="button">New game</button>
                        <button id="retry-move" type="button" hidden>Try again</button>
                    </div>
                    <h2>Moves</h2>
                    <p id="move-history">No moves yet.</p>
                    <p class="game-hint">Only legal moves are accepted. Pawns automatically promote to queens.</p>
                    <details>
                        <summary>Current FEN</summary>
                        <code id="game-fen"></code>
                    </details>
                </section>
            </div>
            <noscript>Enable JavaScript to play chess.</noscript>
        </main>
    </body>
</html>

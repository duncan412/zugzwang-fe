<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const ENGINE_MOVE = ['data' => [['move' => 'e7e5', 'from' => 'e7', 'to' => 'e5']]];

beforeEach(function () {
    config(['services.zugzwang.url' => 'http://127.0.0.1:8080']);
});

it('requests legal moves with the FEN as a query parameter', function () {
    Http::fake([
        '127.0.0.1:8080/moves*' => Http::response(['data' => [
            ['move' => 'e2e4', 'from' => 'e2', 'to' => 'e4'],
        ]]),
    ]);

    $this->getJson('/chess/moves?fen='.urlencode(STARTING_FEN))
        ->assertOk()
        ->assertExactJson(['data' => [
            ['move' => 'e2e4', 'from' => 'e2', 'to' => 'e4'],
        ]]);

    Http::assertSent(function (Request $request) {
        parse_str(parse_url($request->url(), PHP_URL_QUERY) ?? '', $query);

        return $request->method() === 'GET'
            && str_starts_with($request->url(), 'http://127.0.0.1:8080/moves?')
            && ($query['fen'] ?? null) === STARTING_FEN;
    });
});

it('sends the engine FEN as form data and returns its move', function () {
    Http::fake([
        '127.0.0.1:8080/move' => Http::response(ENGINE_MOVE),
    ]);

    $this->postJson('/chess/move', ['fen' => STARTING_FEN])
        ->assertOk()
        ->assertExactJson(ENGINE_MOVE);

    Http::assertSent(fn (Request $request) => $request->method() === 'POST'
        && $request->url() === 'http://127.0.0.1:8080/move'
        && $request->hasHeader('Content-Type', 'application/x-www-form-urlencoded')
        && $request->data() === ['fen' => STARTING_FEN]);
});

it('rejects invalid FEN without calling the engine', function () {
    Http::preventStrayRequests();

    $this->getJson('/chess/moves?fen=not-a-fen')->assertUnprocessable();
});

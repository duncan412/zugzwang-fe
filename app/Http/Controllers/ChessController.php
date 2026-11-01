<?php

namespace App\Http\Controllers;

use App\Services\ZugzwangClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use UnexpectedValueException;

class ChessController extends Controller
{
    public function moves(Request $request, ZugzwangClient $client): JsonResponse
    {
        return $this->respond($request, $client, false);
    }

    public function move(Request $request, ZugzwangClient $client): JsonResponse
    {
        return $this->respond($request, $client, true);
    }

    private function respond(Request $request, ZugzwangClient $client, bool $engine): JsonResponse
    {
        $validated = $request->validate([
            'fen' => [
                'required',
                'string',
                'max:100',
                'regex:/^(?:[prnbqkPRNBQK1-8]+\/){7}[prnbqkPRNBQK1-8]+ [wb] (?:-|K?Q?k?q?) (?:-|[a-h][36]) \d+ [1-9]\d*$/',
            ],
        ]);

        try {
            return response()->json($engine
                ? $client->move($validated['fen'])
                : $client->moves($validated['fen']));
        } catch (ConnectionException|RequestException|UnexpectedValueException $exception) {
            report($exception);

            return response()->json([
                'message' => 'The chess engine is unavailable. Please try again.',
            ], 502);
        }
    }
}

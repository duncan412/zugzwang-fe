<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use UnexpectedValueException;

class ZugzwangClient
{
    public function moves(string $fen): array
    {
        return $this->request('GET', '/moves', $fen);
    }

    public function move(string $fen): array
    {
        return $this->request('POST', '/move', $fen);
    }

    private function request(string $method, string $path, string $fen): array
    {
        $request = Http::baseUrl(rtrim(config('services.zugzwang.url'), '/'))
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(60);

        if ($method === 'POST') {
            $request->asForm();
        }

        $response = $request->send($method, $path, [
            $method === 'GET' ? 'query' : 'form_params' => ['fen' => $fen],
        ])->throw();

        $data = $response->json('data');

        if (! is_array($data) || ! array_is_list($data) || ($method === 'POST' && count($data) > 1)) {
            throw new UnexpectedValueException('Invalid Zugzwang response data.');
        }

        foreach ($data as $move) {
            if (
                ! is_array($move)
                || ! is_string($move['move'] ?? null)
                || ! preg_match('/^[a-h][1-8][a-h][1-8]$/', $move['move'])
                || ($move['from'] ?? null) !== substr($move['move'], 0, 2)
                || ($move['to'] ?? null) !== substr($move['move'], 2, 2)
            ) {
                throw new UnexpectedValueException('Invalid Zugzwang move.');
            }
        }

        return ['data' => $data];
    }
}

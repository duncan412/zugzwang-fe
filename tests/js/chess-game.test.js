import assert from 'node:assert/strict'
import test from 'node:test'
import { ChessGame } from '../../resources/js/chess-game.js'

const legalOpeningMoves = [
  { move: 'e2e4', from: 'e2', to: 'e4' },
  { move: 'd2d4', from: 'd2', to: 'd4' },
]

test('uses the PHP engine move response and loads the next legal moves', async () => {
  const requests = []
  const api = {
    async moves(fen) {
      requests.push(['moves', fen])
      return legalOpeningMoves
    },
    async move(fen) {
      requests.push(['move', fen])
      return [{ move: 'e7e5', from: 'e7', to: 'e5' }]
    },
  }
  const game = new ChessGame(api)

  await game.synchronize()
  assert.equal(game.play('e2', 'e4'), true)
  await new Promise(resolve => setImmediate(resolve))

  assert.deepEqual(requests.map(([method]) => method), ['moves', 'move', 'moves'])
  assert.equal(requests[1][1].split(' ')[1], 'b')
  assert.equal(requests[2][1].split(' ')[1], 'w')
  assert.equal(game.chess.history().join(' '), 'e4 e5')
  assert.equal(game.legalMoves[0].move, 'e2e4')
  assert.equal(game.canPlay, true)
})

test('rejects an illegal move returned by the PHP engine', async () => {
  const game = new ChessGame({
    async moves() {
      return legalOpeningMoves
    },
    async move() {
      return [{ move: 'e7e4', from: 'e7', to: 'e4' }]
    },
  })

  await game.synchronize()
  game.play('e2', 'e4')
  await new Promise(resolve => setImmediate(resolve))

  assert.match(game.error, /illegal move/i)
  assert.equal(game.chess.history().join(' '), 'e4')
})

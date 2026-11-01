import { Chessboard2 } from '@chrisoakman/chessboard2/dist/chessboard2.min.mjs'
import '@chrisoakman/chessboard2/dist/chessboard2.min.css'
import { ChessApi } from './chess-api.js'
import { ChessGame } from './chess-game.js'

document.addEventListener('DOMContentLoaded', () => {
  const element = document.getElementById('myBoard')
  if (!element) return

  const status = document.getElementById('game-status')
  const retry = document.getElementById('retry-move')
  const history = document.getElementById('move-history')
  const fen = document.getElementById('game-fen')
  const api = new ChessApi(element.dataset.movesUrl, element.dataset.moveUrl,
    document.querySelector('meta[name="csrf-token"]').content)

  const game = new ChessGame(api, () => {
    status.textContent = game.status
    status.classList.toggle('game-error', Boolean(game.error))
    retry.hidden = !game.error
    retry.disabled = game.busy
    fen.textContent = game.fen
    const moves = game.chess.history()
    history.textContent = moves.map((move, index) =>
      index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ${move}` : move).join(' ') || 'No moves yet.'
    requestAnimationFrame(() => board.position(game.fen))
  })

  const board = Chessboard2(element, {
    draggable: true,
    touchDraggable: true,
    position: 'start',
    onDragStart: ({ piece }) => game.canPlay && piece.startsWith('w'),
    onDrop: ({ source, target }) => {
      if (!game.play(source, target)) return 'snapback'
    },
    onSnapEnd: () => board.position(game.fen),
  })

  document.getElementById('new-game').addEventListener('click', () => {
    void game.reset()
  })
  retry.addEventListener('click', () => void game.synchronize())
  void game.synchronize()
})

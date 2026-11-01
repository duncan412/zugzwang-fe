import { Chess } from 'chess.js'

export class ChessGame {
  constructor(api, onChange = () => {}) {
    this.api = api
    this.onChange = onChange
    this.chess = new Chess()
    this.legalMoves = []
    this.busy = false
    this.error = null
    this.version = 0
  }

  get fen() {
    // Preserve the en passant target in the FEN sent to the PHP engine.
    return this.chess.fen({ forceEnpassantSquare: true })
  }

  get canPlay() {
    return !this.busy && !this.error && !this.chess.isGameOver() && this.chess.turn() === 'w'
  }

  get status() {
    if (this.error) return this.error
    if (this.chess.isCheckmate()) {
      return this.chess.turn() === 'w' ? 'Checkmate. Zugzwang wins.' : 'Checkmate. You win!'
    }
    if (this.chess.isStalemate()) return 'Draw by stalemate.'
    if (this.chess.isDraw()) return 'Draw.'
    if (this.busy) return this.chess.turn() === 'b' ? 'Zugzwang is thinking...' : 'Loading legal moves...'
    return this.chess.isCheck() ? 'Your turn. You are in check.' : 'Your turn. You play white.'
  }

  async reset() {
    this.version += 1
    this.chess.reset()
    this.legalMoves = []
    this.busy = false
    this.error = null
    await this.synchronize()
  }

  play(from, to) {
    if (!this.canPlay || !this.legalMoves.some(move => move.from === from && move.to === to)) {
      return false
    }

    const legal = this.chess.moves({ verbose: true }).find(move =>
      move.from === from && move.to === to && (!move.promotion || move.promotion === 'q'))
    if (!legal) return false

    this.chess.move({ from, to, promotion: 'q' })
    this.legalMoves = []
    void this.synchronize()
    return true
  }

  async synchronize() {
    if (this.busy && !this.error) return
    const version = this.version
    this.busy = true
    this.error = null
    this.onChange()

    try {
      if (this.chess.isGameOver()) return

      if (this.chess.turn() === 'b') {
        const moves = await this.api.move(this.fen)
        if (version !== this.version) return
        const move = moves[0]
        if (!move) throw new Error('Zugzwang returned no move for an active game.')

        const legal = this.chess.moves({ verbose: true }).find(candidate =>
          candidate.from === move.from && candidate.to === move.to &&
          (!candidate.promotion || candidate.promotion === 'q'))
        if (!legal) throw new Error('Zugzwang returned an illegal move.')

        this.chess.move({ from: move.from, to: move.to, promotion: 'q' })
        this.onChange()
      }

      if (!this.chess.isGameOver()) {
        const moves = await this.api.moves(this.fen)
        if (version !== this.version) return
        if (moves.length === 0) throw new Error('Zugzwang returned no legal moves for an active game.')
        this.legalMoves = moves
      }
    } catch (error) {
      if (version === this.version) {
        this.error = error instanceof Error ? error.message : 'The chess engine request failed.'
      }
    } finally {
      if (version === this.version) {
        this.busy = false
        this.onChange()
      }
    }
  }
}

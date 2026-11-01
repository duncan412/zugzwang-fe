export class ChessApi {
  constructor(movesUrl, moveUrl, csrfToken) {
    this.movesUrl = movesUrl
    this.moveUrl = moveUrl
    this.csrfToken = csrfToken
  }

  moves(fen) {
    const url = new URL(this.movesUrl, window.location.origin)
    url.searchParams.set('fen', fen)
    return this.request(url, { method: 'GET' })
  }

  move(fen) {
    return this.request(this.moveUrl, {
      method: 'POST',
      body: JSON.stringify({ fen }),
    })
  }

  async request(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': this.csrfToken,
      },
    })
    if (!response.ok) {
      throw new Error(response.status === 419
        ? 'Your session expired. Reload the page to continue.'
        : 'The chess engine request failed. Check the backend and try again.')
    }
    const payload = await response.json()
    if (!Array.isArray(payload.data) || !payload.data.every(move =>
      move && typeof move.move === 'string' && /^[a-h][1-8][a-h][1-8]$/.test(move.move) &&
      move.from === move.move.slice(0, 2) && move.to === move.move.slice(2))) {
      throw new Error('The chess engine returned an invalid response.')
    }
    return payload.data
  }
}

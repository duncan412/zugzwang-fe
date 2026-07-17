import Chessboard2 from '@chrisoakman/chessboard2/dist/chessboard2.min.js'
import '@chrisoakman/chessboard2/dist/chessboard2.min.css'

document.addEventListener('DOMContentLoaded', () => {
  const boardConfig = {
  draggable: true,
  position: 'start',
  touchMove: true
}
  Chessboard2.Chessboard2('myBoard', boardConfig)
})

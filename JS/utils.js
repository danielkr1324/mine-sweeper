'use strict';

function renderBoard(mat) {
  var strHTML = '<table><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      const cell = mat[i][j];
      const className = `cell cell-${i}-${j}`;

      strHTML += `<td oncontextmenu="onCellMarked(this,${i}, ${j}, event)" onclick="onCellClicked(this, ${i}, ${j})" class="${className}">`;

      strHTML += '</td>';
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';

  const elContainer = document.querySelector('.board-container');
  elContainer.innerHTML = strHTML;
}

function renderCell(location, value) {
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
  elCell.style.backgroundColor = value === MINE ? '#F55050' : '#DBCBBD';
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFreePos(board) {
  var emptyPos = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (!board[i][j].isMine && !board[i][j].isShown) {
        emptyPos.push({ i, j });
      }
    }
  }
  if (!emptyPos.length) return null;
  var randIdx = getRandomIntInclusive(0, emptyPos.length - 1);
  return emptyPos[randIdx];
}

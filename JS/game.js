'use strict';

//consts
const MINE = '💣';
const FLAG = '🚩';
const REST_FACE_EMJ = '😐';
const HAPPY_EMJ = '😀';
const DEAD_EMJ = '😵';

//global variables
var gBoard;
var gLevel;
var gGame;
var gIsFirstClick;
var gTimerInterval;

function init() {
  gIsFirstClick = true;

  gLevel = {
    size: 16,
    mines: 36,
  };

  gGame = {
    isOn: true,
    showCount: 0,
    markedCount: 0,
    secPassed: 0,
    isWin: false,
  };

  gBoard = createBoard(16);
  renderBoard(gBoard);
  setMinesNegsCount();

  var elEmj = document.querySelector('.reset');
  var elStopWatch = document.querySelector('.stop-watch');

  elEmj.innerText = HAPPY_EMJ;
  elStopWatch.innerText = '0.000';
}

function createBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  // board[1][2].isMine = true;
  // board[3][3].isMine = true;

  return board;
}

function setMinesNegsCount() {
  for (var i = 0; i < gLevel.mines; i++) {
    var freePos = getFreePos(gBoard);
    if (!freePos) return;
    gBoard[freePos.i][freePos.j].isMine = true;
    negsOperations(freePos.i, freePos.j, updateCellsAroundMine);
  }
  renderBoard(gBoard);
}

function negsOperations(idxI, idxJ, func) {
  for (var i = idxI - 1; i <= idxI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = idxJ - 1; j <= idxJ + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      if (i === idxI && j === idxJ) continue;
      func(i, j);
    }
  }
}

function updateCellsAroundMine(i, j) {
  gBoard[i][j].minesAroundCount++;
}

function isNegMine(i, j) {
  if (gBoard[i][j].isMine) return true;
}

function expandShown(i, j) {
  var curCell = gBoard[i][j];
  var celNumVal = curCell.minesAroundCount ? curCell.minesAroundCount : '';
  if (!curCell.isMine) {
    renderCell({ i, j }, celNumVal);
    curCell.isShown = true;
  }
}

function onCellClicked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isMarked) return;

  if (gIsFirstClick) {
    stopWatch();
    gIsFirstClick = false;
  }

  var currCell = gBoard[i][j];
  if (currCell.isMine) {
    gBoard[i][j].isShown = true;
    gameOver();
    renderCell({ i, j }, MINE);
    return;
  }
  expandShown(i, j);
  currCell.isShown = true;
  if (!currCell.minesAroundCount) negsOperations(i, j, expandShown);
}

function onCellMarked(elCell, i, j, e) {
  e.preventDefault();
  if (!gBoard[i][j].isShown) {
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    elCell.innerText = gBoard[i][j].isMarked ? FLAG : '';
    if (gBoard[i][j].isMine) {
      if (gBoard[i][j].isMarked) gGame.markedCount++;
      else gGame.markedCount--;
    }
  }
  checkGameOver();
}

function stopWatch() {
  var startTime = Date.now();

  gTimerInterval = setInterval(() => {
    var elapsedTime = Date.now() - startTime;
    document.querySelector('.stop-watch').innerText = (
      elapsedTime / 1000
    ).toFixed(3);
  }, 30);
}

function checkGameOver() {
  if (gGame.markedCount === gLevel.mines) {
    gGame.isWin = true;
    gGame.isOn = false;
  }
}

function gameOver() {
  clearInterval(gTimerInterval);
  gGame.isOn = false;
  exposeMines();
  var elEmj = document.querySelector('.reset');
  elEmj.innerText = DEAD_EMJ;
}

function exposeMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        renderCell({ i, j }, MINE);
      }
    }
  }
}

'use strict';

//consts
const MINE = '💣';
const FLAG = '🚩';
const WIN_EMJ = '🤩';
const HAPPY_EMJ = '😀';
const DEAD_EMJ = '😵';
const LIFE = '💖';

//global variables
var gBoard;
var gLevel;
var gGame;
var gIsFirstClick;
var gTimerInterval;
var gSize = 4;
var gMinesNum = 2;

function init(size = gSize, numOfMines = gMinesNum) {
  clearInterval(gTimerInterval);

  gIsFirstClick = true;

  gLevel = {
    size: size,
    mines: numOfMines,
  };

  gGame = {
    isOn: true,
    showCount: 0,
    markedCount: 0,
    secPassed: 0,
    isWin: false,
    liveCount: 3,
  };

  gBoard = createBoard(size);
  renderBoard(gBoard);
  setMinesNegsCount();

  var elEmj = document.querySelector('.reset');
  var elStopWatch = document.querySelector('.stop-watch span');

  elEmj.innerText = HAPPY_EMJ;
  elStopWatch.innerText = '0.0';

  renderLives(gGame.liveCount);
}

function onDifficultySet(size, minesNum) {
  gSize = size;
  gMinesNum = minesNum;
  init(size, minesNum);
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

// function expandShown(i, j) {
//   var curCell = gBoard[i][j];
//   var celNumVal = curCell.minesAroundCount ? curCell.minesAroundCount : '';
//   if (!curCell.isMine) {
//     renderCell({ i, j }, celNumVal);
//     curCell.isShown = true;
//   }
// }
function expandShown(i, j) {
  if (gBoard[i][j].isMarked) return;

  var currCell = gBoard[i][j];
  var celNumVal = currCell.minesAroundCount ? currCell.minesAroundCount : '';
  renderCell({ i, j }, celNumVal);

  if (currCell.isShown) return;
  if (celNumVal) {
    gGame.showCount++;
    currCell.isShown = true;
    return;
  }
  gGame.showCount++;
  currCell.isShown = true;
  console.log(gGame.showCount);
  if (i > 0) expandShown(i - 1, j);
  if (i < gBoard.length - 1) expandShown(i + 1, j);
  if (j > 0) expandShown(i, j - 1);
  if (j < gBoard[0].length - 1) expandShown(i, j + 1);
}

function onCellClicked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return;

  if (gIsFirstClick) {
    stopWatch();
    gIsFirstClick = false;
  }

  var currCell = gBoard[i][j];
  if (currCell.isMine) {
    handleMineClick(i, j);
    return;
  }
  expandShown(i, j);
  checkGameOver();
}

function onCellMarked(elCell, i, j, e) {
  e.preventDefault();
  if (!gBoard[i][j].isShown) {
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    elCell.innerText = gBoard[i][j].isMarked ? FLAG : '';
    if (gBoard[i][j].isMine) {
      if (gBoard[i][j].isMarked) {
        gGame.markedCount++;
      } else gGame.markedCount--;
    }
  }
  checkGameOver();
}

function stopWatch() {
  var startTime = Date.now();

  gTimerInterval = setInterval(() => {
    var elapsedTime = Date.now() - startTime;
    document.querySelector('.stop-watch span').innerText = (
      elapsedTime / 1000
    ).toFixed(1);
  }, 60);
}

function checkGameOver() {
  if (
    gGame.markedCount + gGame.showCount === gBoard.length ** 2 ||
    gGame.showCount === gBoard.length ** 2
  ) {
    gGame.isWin = true;
    gGame.isOn = false;
    gameOver();
    return;
  }
  if (!gGame.liveCount) {
    gameOver();
    return;
  }
}

function handleMineClick(i, j) {
  renderCell({ i, j }, MINE);
  gBoard[i][j].isShown = true;
  gGame.showCount++;
  gGame.liveCount--;
  renderLives(gGame.liveCount);
  var elEmj = document.querySelector('.reset');
  elEmj.innerText = DEAD_EMJ;

  if (gGame.liveCount >= 1) {
    setTimeout(() => {
      elEmj.innerText = HAPPY_EMJ;
    }, 400);
  }

  checkGameOver();
}

function gameOver() {
  clearInterval(gTimerInterval);
  gGame.isOn = false;
  exposeMines();
  var gameOverEmj = gGame.isWin ? WIN_EMJ : DEAD_EMJ;
  var elEmj = document.querySelector('.reset');
  elEmj.innerText = gameOverEmj;
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

function renderLives(liveCount) {
  var elLiveCount = document.querySelector('.lives');
  var livesStr = '';
  for (var i = 0; i < liveCount; i++) {
    livesStr += LIFE;
  }
  elLiveCount.innerText = livesStr;
}

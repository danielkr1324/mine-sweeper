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

//general function that recives indexes and function and operates on neighbors of specific cell
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

//recursive fuction that expose content of one cell or more
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

// handling click according to certein conditions
function onCellClicked(elCell, i, j) {
  if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return;

  var currCell = gBoard[i][j];
  if (currCell.isMine) {
    handleMineClick(i, j);
    return;
  }
  if (gIsFirstClick) {
    setMinesNegsCount();
    stopWatch();
    gIsFirstClick = false;
  }
  expandShown(i, j);
  checkGameOver();
}

// marks cell and apply the game rules regarding marked cells
function onCellMarked(elCell, i, j, e) {
  e.preventDefault();
  if (!gGame.isOn) return;

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

//starting a stop watch and render it to the screen
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
  playSound('pop');
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
  var sound = gGame.isWin ? 'win' : 'lose';
  var gameOverEmj = gGame.isWin ? WIN_EMJ : DEAD_EMJ;
  var elEmj = document.querySelector('.reset');

  gGame.isOn = false;
  clearInterval(gTimerInterval);
  exposeMines();
  playSound(sound);
  elEmj.innerText = gameOverEmj;
}

// expose all mines when the game is done
function exposeMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) {
        renderCell({ i, j }, MINE);
      }
    }
  }
}

// rendering hearts to the screen
function renderLives(liveCount) {
  var elLiveCount = document.querySelector('.lives');
  var livesStr = '';
  for (var i = 0; i < liveCount; i++) {
    livesStr += LIFE;
  }
  elLiveCount.innerText = livesStr;
}

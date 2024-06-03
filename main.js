// Model
let coupled = new Map();
let themes = {
  animals: {
    maxSize: 6,
    numOfCards: 49
  },
  flowers: {
    maxSize: 6,
    numOfCards: 49
  },
  people: {
    maxSize: 4,
    numOfCards: 24
  },
  vegetables: {
    maxSize: 4,
    numOfCards: 27

  }
}

let counter = 0;
let timer;
let timerOn = false;
let chosenTheme;
let chosenSize = 0;


let userGamesStats = {
  animals: {
    2: "00:00:000",
    4: "00:00:000",
    6: "00:00:000"
  },
  flowers: {
    2: "00:00:000",
    4: "00:00:000",
    6: "00:00:000"
  },
  people: {
    2: "00:00:000",
    4: "00:00:000"
  },
  vegetables: {
    2: "00:00:000",
    4: "00:00:000"
  }

}
init();

function init() {
  displaySelectThemeOption();
  if (localStorage.getItem('gameStats') === null) {
    localStorage.setItem('gameStats', JSON.stringify(userGamesStats));
    loadHighestScore();
  } else {
    loadHighestScore();
  }
}

function stopGame() {
  alert("you have reached time limit of 1 hour , better restart a new game. ");
}


// Deivide to model view function
function startTimer() {
  if (!timerOn) {
    let min = document.getElementById('min');
    let sec = document.getElementById('sec');
    let msec = document.getElementById('msec');
    let timerStartedAt = Date.now();

    let secReal = 0;
    let minReal = 0;
    let msecReal = 0;
    min.textContent = "00";
    sec.textContent = "00";
    msec.textContent = "000";
    if (!timerOn) {
      timer = setInterval(function () {
        let elapsedTime = Date.now() - timerStartedAt;
        minReal = Math.floor(elapsedTime / (60 * 1000));
        secReal = Math.floor((elapsedTime % (60 * 1000)) / 1000);
        msecReal = elapsedTime % 1000;
        min.textContent = minReal < 10 ? "0" + minReal : minReal;
        sec.textContent = secReal < 10 ? "0" + secReal : secReal;
        msec.textContent = msecReal < 10 ? "00" + msecReal : msecReal < 100 ? "0" + msecReal : msecReal;

      }, 1);
    }
  }
}


function stopTimer() {
  let min = document.getElementById('min').innerText;
  let sec = document.getElementById('sec').innerText;
  let mils = document.getElementById('msec').innerText;
  timerOn = true;
  console.log(`Timer Stopped at: ${min}:${sec}:${mils}`)
  clearInterval(timer);

  return `${min}:${sec}:${mils}`
}

function resetTimer() {
  if (timerOn == true) {
    timerOn = false;
  }
  clearInterval(timer);
}


function createDeck(size, theme) {
  let deck = [];
  let cardRange = new Array(themes[theme]['numOfCards'] + 1).fill(0).map((_, index) => index);
  for (let i = 0; i < cardRange.length; i++) {
    let tmp = cardRange[i];
    let randomCard = Math.floor(Math.random() * themes[theme]['numOfCards']);
    cardRange[i] = cardRange[randomCard];
    cardRange[randomCard] = tmp;
  }

  for (let i = 0; i < size / 2; i++) {
    deck[i] = cardRange[i];
    deck[i + size / 2] = cardRange[i];
  }
  counter = size / 2;
  console.log(deck);
  return deck;
}


function shuffleDeck(cards) {
  for (let i = 0; i < cards.length; i++) {
    let tmp = cards[i];
    let rnd = Math.floor(Math.random() * cards.length)
    cards[i] = cards[rnd];
    cards[rnd] = tmp;
  }
}


function checkMatch(card) {
  if (coupled.has(card.target.dataset['id'])) {
    card.target.removeEventListener('click', handleCardClick);
    console.log('Coupled!');
    coupled.clear()
    checkWinCondition();
    return true;
  }
  console.log(card.target);
  coupled.values().next().value.addEventListener('click', handleCardClick);
  console.log('Nada')
  return false;
}

function getMaxBoardSize(theme) {
  return themes[theme]['maxSize'];
}

function checkWinCondition() {
  counter--;
  counter == 0 ? endGame() : null;
}

function endGame() {
  let score = stopTimer();
  saveScore(score);
}


function saveScore(score) {

  if (userGamesStats[chosenTheme][chosenSize] != "00:00:000") {
    if (score < userGamesStats[chosenTheme][chosenSize]) {
      userGamesStats[chosenTheme][chosenSize] = score;
      saveScoreToLocalStorage();
      displayGameOverMsg("NEW HIGH SCORE!")
      loadHighestScore();
    } else displayGameOverMsg("");
  } else {
    userGamesStats[chosenTheme][chosenSize] = score;
    saveScoreToLocalStorage();
    const firstGame = JSON.parse(localStorage.getItem('firstGame'));
    displayGameOverMsg("Great score for first time, Now try to break it!")
    loadHighestScore();

  }

}

function saveScoreToLocalStorage() {
  localStorage.setItem('gameStats', JSON.stringify(userGamesStats))
}

/** Should it be in View ? or split between view and logic?  */
function loadHighestScore() {
  updateView(document.getElementById('scoreBoardBody'), 'removeChildren');
  userGamesStats = JSON.parse(localStorage.getItem('gameStats'));
  for (const chosenTheme in userGamesStats) {
    for (const bordSize in userGamesStats[chosenTheme]) {
      if (userGamesStats[chosenTheme][bordSize] != "00:00:000") {
        const tbody = document.getElementById('scoreBoardBody');
        const tr = document.createElement('tr');
        const tdTheme = document.createElement('td');
        const tdValue = document.createElement('td');
        const tdBoardSize = document.createElement('td');
        tdTheme.textContent = chosenTheme.charAt(0).toUpperCase() + chosenTheme.slice(1);
        tr.appendChild(tdTheme);
        tdBoardSize.textContent = bordSize + "X" + bordSize;
        tr.appendChild(tdBoardSize);
        tdValue.textContent = userGamesStats[chosenTheme][bordSize];
        tr.appendChild(tdValue);
        tbody.appendChild(tr);
      }
    }
  }
}



//View
// Make sure in this function only whats Need it takes care of , the rest let "handleClick" take care of!
// Maybe return true / false? 
function resetGame() {
  location.reload(true);
}

function lockMenueItems() {
  updateView(document.getElementById('selectBoardSize'), 'disable')
  updateView(document.getElementById('selectTheme'), 'disable')
}

function renderCards(cards, theme) {
  const n = Math.sqrt(cards.length);
  const board = document.getElementById('board');
  for (let i = 0; i < cards.length; i++) {
    if (i % n == 0) {
      const row = document.createElement('div');
      row.className = "row";
      board.appendChild(row);
    }
    const card = document.createElement('img');
    card.className = 'card';
    card.src = "public/cards/" + theme + "/back.png";

    card.dataset.id = cards[i];
    card.addEventListener('click', handleCardClick);

    card.addEventListener('animationend', function () {
      this.classList.remove('flip');
    });

    board.lastElementChild.appendChild(card);
  }
}

function displayBoard() {
  const board = document.getElementById('board');
  updateView(board, "toggleHide");
}

function displayGameOverMsg(msg = "") {
  const gameOver = document.getElementById('gameOver');
  const gameOverMsg = document.getElementById('gameOverMsg');
  gameOverMsg.textContent = msg ? msg : "I'm sure you can do better!";
  updateView(gameOver, "toggleHide");
}

function displayTimer() {
  const timer = document.getElementById('timer');
  updateView(timer, "toggleHide");
}


function displayStartButton() {
  const startBtn = document.getElementById('startGame');
  startBtn.addEventListener('click', handleStartButtonClick);
  updateView(startBtn, "toggleHide");
}
displayStartButton()


function displayResetButton() {
  const resetBtn = document.getElementById('resetGame');
  resetBtn.addEventListener('click', handleResetButtonClick);
  updateView(resetBtn, "toggleHide");

}

function displaySelectThemeOption() {
  const selectTheme = document.getElementById('selectTheme');
  selectTheme.addEventListener('change', handleThemeSelect);
  updateView(selectTheme, "toggleHide");
}


function displayBoardSizeOption(theme) {
  const selectBoardSize = document.getElementById('selectBoardSize');
  selectBoardSize.addEventListener('click', handleBoardSizeClick);

  updateView(selectBoardSize.children[0], 'removeSiblings').then((msg) => {
    console.log(msg);
    addBoardSizeOptions(theme, selectBoardSize);
  });
  updateView(selectBoardSize, 'enable');
  updateView(document.getElementById('startGame'), 'disable');
}

function addBoardSizeOptions(theme, selectBoardSize) {
  let boardSize = getMaxBoardSize(theme);
  console.log("Size: " + boardSize);
  for (let i = 2; i <= boardSize; i += 2) {
    const option = document.createElement('option');
    option.value = i;
    option.innerText = i + "X" + i;
    selectBoardSize.appendChild(option);
  }
}

function displayRestartButton() {
  const restartGame = document.getElementById('restartGame');
  restartGame.addEventListener('click', handleRestartGame);
  updateView(restartGame, 'toggleHide')
}

//Controllers

/*this should move to view*/
function flipCard(card) {
  card.classList.add('flip');
  const imgId = card.dataset['id'];
  const currentSrc = card.getAttribute('src');
  const newSrc = currentSrc.includes('back.png') ? currentSrc.substring(0, currentSrc.lastIndexOf('/')) + `/${imgId}.png` : currentSrc.substring(0, currentSrc.lastIndexOf('/')) + '/back.png';
  card.setAttribute('src', newSrc);
}

function handleCardClick(card) {
  flipCard(card.target);
  if (coupled.size === 0) {
    coupled.set(card.target.dataset['id'], card.target);
    card.target.removeEventListener('click', handleCardClick);
  } else {

    if (!checkMatch(card)) {
      setTimeout(() => {

        flipCard(card.target);
        flipCard(coupled.values().next().value);
        coupled.clear();


        const cards = document.getElementsByClassName('card');
        for (let i = 0; i < cards.length; i++) {
          cards[i].addEventListener('click', handleCardClick);
        }
      }, 1000);
      const cards = document.getElementsByClassName('card');
      for (let i = 0; i < cards.length; i++) {
        cards[i].removeEventListener('click', handleCardClick);
      }


    }
  }
}

function handleStartButtonClick() {
  displayStartButton();
  displayResetButton();
  displayRestartButton();
  startGame();
}


function handleResetButtonClick() {
  resetGame();
}

function handleThemeSelect() {
  const theme = document.getElementById('selectTheme').value;
  displayBoardSizeOption(theme);

}

function handleBoardSizeClick() {
  const boardSize = document.getElementById('selectBoardSize').value;
  if (boardSize === "def") {
    updateView(document.getElementById('startGame'), 'disable');
  } else {
    updateView(document.getElementById('startGame'), 'enable');
  }
}


// Restart Game -  same condition , new board
function handleRestartGame() {
  updateView(document.getElementById('board'), "removeChildren");
  displayBoard();
  displayTimer();
  resetTimer();
  loadHighestScore();
  displayGameOverMsg("");
  startGame();
}


function startGame() {

  const theme = document.getElementById('selectTheme').value;
  chosenTheme = theme; // what to do with this? should i leave it at this scope? 
  const boardSize = document.getElementById('selectBoardSize').value;
  console.log(boardSize);
  let cards = createDeck(Math.pow(Number(boardSize), 2), theme);
  chosenSize = boardSize;

  shuffleDeck(cards);
  renderCards(cards, theme);
  lockMenueItems();
  displayBoard();
  displayTimer();

  //Add count down to star Game? 
  startTimer();
}



// Move this to view? 
function updateView(elem, command) {
  return new Promise((resolve, reject) => {
    switch (command) {
      case "toggleHide":
        console.log(elem);
        elem.classList.toggle('hidden');
        break;
      case "removeChildren":
        elem.replaceChildren();
        break;
      case "removeSiblings":
        removeSiblings(elem).then(msg => {
          resolve(msg);
        })
        break;
      case "disable":
        elem.disabled = true;
        break;
      case 'enable':
        elem.removeAttribute('disabled');
        break;
      default:
        reject("Invalid command: " + command);
    }
  })
}

function removeSiblings(elem) {
  return new Promise((resolve) => {
    elem = elem.nextSibling;
    while (elem) {
      let tmp = elem.nextSibling;
      if (elem instanceof HTMLOptionElement) {
        elem.remove();
        console.log(elem)
      }
      elem = tmp;
    }
    resolve("Removed all siblings");
  })
}
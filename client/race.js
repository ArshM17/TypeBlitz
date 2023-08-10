const socket = io();
var PLAYERS = [];
var isReady = false;
var gameOver = false;
let userName = localStorage.getItem("userName");
let roomId = localStorage.getItem("roomId");
const header = document.getElementById("header");
const container = document.getElementById("car-container");
const readyBtn = document.getElementById("readyBtn");
const raceAgainBtn = document.getElementById("raceAgainBtn");
raceAgainBtn.style.visibility = "hidden";
const countdownDisplay = document.getElementById("countdown-timer");
let countDownTimer;
let countdownTime;
// const RANDOM_QUOTE_API_URL = "http://metaphorpsum.com/paragraphs/1";

// header.innerText = `Welcome ${userName}`;

socket.on("connect", () => {
  // console.log(socket.id);
  socket.emit("join-room", roomId, userName);
  socket.emit("get-para", roomId);
  socket.emit("new-player", socket.id, roomId);
  // generateRandomNumberEverySecond();
  // renderNewQuote();
});

socket.on("update-players", (list) => {
  PLAYERS = list;
  // console.log(PLAYERS);
  createPlayerDivs(PLAYERS);
});

socket.on("start-race", () => {
  generateRandomNumberEverySecond();
});

window.onbeforeunload = function () {
  if (!gameOver) {
    window.setTimeout(function () {
      window.location = window.origin;
      // window.location = "http://localhost:3000";
    }, 0);
    window.onbeforeunload = null;
  }
};

function createPlayerDivs(playersArray) {
  container.innerHTML = "";

  playersArray.forEach((player) => {
    const playerDiv = document.createElement("div");
    playerDiv.innerText = player.userName + " " + player.speed;
    playerDiv.classList.add("car");
    playerDiv.style.position = "relative";
    playerDiv.style.left = `${player.progress}%`;
    // playerDiv.style.backgroundColor = "blue";
    container.appendChild(playerDiv);
    playerDiv.style.color = player.isReady ? "green" : "red";
  });
}
let updater;
function generateRandomNumberEverySecond() {
  quoteInputElement.disabled = false;
  quoteInputElement.focus();

  updater = setInterval(() => {
    // const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    // console.log(correctPart.length, quote.length);
    if (correctPart.length >= quote.length) {
      // console.log("clear");
      clearInterval(updater);
    }

    socket.emit(
      "update-info",
      (correctPart.length / quote.length) * 100,
      roomId,
      correctPart.length / 5
    );
    // console.log("stop");
  }, 1000);
}

readyBtn.addEventListener("click", (e) => {
  isReady = !isReady;
  // console.log(isReady);
  if (isReady) {
    readyBtn.innerText = "Not Ready";
    socket.emit("ready", roomId);
  } else {
    readyBtn.innerText = "Ready";
    socket.emit("not-ready", roomId);
  }
});

socket.on("start-countdown", () => {
  startCountdown();
});

socket.on("stop-countdown", () => {
  stopCountdown();
});

socket.on("send-para", (para) => {
  console.log(para);
  quote = para;
});

function startCountdown() {
  countdownTime = 10;
  countdownDisplay.innerText = `Race starts in ${countdownTime} seconds`;
  countDownTimer = setInterval(() => {
    countdownTime--;
    countdownDisplay.innerText = `Race starts in ${countdownTime} seconds`;

    if (countdownTime <= 0) {
      clearInterval(countDownTimer);
      countdownDisplay.innerText = "Type!";
      generateRandomNumberEverySecond();
      startTimer();
    } else if (countdownTime <= 6) {
      // After 4 seconds of starting the timer, disable all ready buttons.
      readyBtn.disabled = true;
      renderNewQuote();
    }
  }, 1000); // 1000 milliseconds = 1 second
}

function stopCountdown() {
  countdownDisplay.innerText = "Waiting for all players to get ready...";
  clearInterval(countDownTimer);
}

//--------------------------------------------------------------------------//

// const RANDOM_QUOTE_API_URL = "http://metaphorpsum.com/paragraphs/1";
const quoteDisplayElement = document.getElementById("quoteDisplay");
const quoteInputElement = document.getElementById("quoteInput");
const timerElement = document.getElementById("timer");

let quote;
let correctPart = "";
let wordsArray;
let currIndex = 0;
quoteInputElement.disabled = true;

quoteInputElement.addEventListener("input", (e) => {
  const typed = quoteInputElement.value;
  if (typed.includes(" ")) {
    if (wordsArray[currIndex] + " " === typed) {
      quoteInputElement.value = "";
      currIndex++;
      correctPart += typed;
      if (currIndex == wordsArray.length) {
        quoteInputElement.disabled = true;
      }
      return;
    }
  }
  const check = correctPart + typed;
  const arrayQuote = quoteDisplayElement.querySelectorAll("span");
  const arrayValue = check.split("");

  let correct = true;
  arrayQuote.forEach((characterSpan, index) => {
    const character = arrayValue[index];
    if (character == null) {
      characterSpan.classList.remove("correct");
      characterSpan.classList.remove("incorrect");
      correct = false;
    } else if (character === characterSpan.innerText && correct) {
      characterSpan.classList.add("correct");
      characterSpan.classList.remove("incorrect");
      correct = true;
    } else {
      characterSpan.classList.remove("correct");
      characterSpan.classList.add("incorrect");
      correct = false;
    }
  });
});

// function getRandomQuote() {
//   return fetch(RANDOM_QUOTE_API_URL)
//     .then((response) => response.text())
//     .then((data) => data);
// }

function renderNewQuote() {
  // quote = await getRandomQuote();
  wordsArray = quote.split(" ");
  quoteDisplayElement.innerHTML = "";
  quote.split("").forEach((character) => {
    const characterSpan = document.createElement("span");
    characterSpan.innerText = character;
    quoteDisplayElement.appendChild(characterSpan);
  });
  quoteInputElement.value = null;
  // startTimer();
}

// let startTime;
// function startTimer() {
//   timerElement.innerText = 0;
//   startTime = new Date();
//   setInterval(() => {
//     timer.innerText = getTimerTime();
//   }, 1000);
// }
let time, timer;
function startTimer() {
  time = 40;
  timerElement.innerText = time;
  timer = setInterval(() => {
    time--;
    timerElement.innerText = time;

    if (time <= 0) {
      // console.log(PLAYERS);
      clearInterval(timer);
      clearInterval(updater);
      timerElement.innerText = "Time Up!";
      quoteInputElement.disabled = true;
      roomId = roomId + "rematch";
      localStorage.setItem("roomId", roomId);
      // localStorage.setItem("userName", userName);
      gameOver = true;
      //make rematch button visible
      raceAgainBtn.style.visibility = "visible";
      // setTimeout(() => {
      //   window.location = "http://localhost:3000/race";
      // }, 3000);
    }
  }, 1000); // 1000 milliseconds = 1 second
}

socket.on("game-over", () => {
  clearInterval(timer);
  clearInterval(updater);
  roomId = roomId + "rematch";
  localStorage.setItem("roomId", roomId);
  gameOver = true;
  raceAgainBtn.style.visibility = "visible";
});

raceAgainBtn.addEventListener("click", () => {
  window.location = `${window.origin}/race`;
});

// function getTimerTime() {
//   return Math.floor((new Date() - startTime) / 1000);
// }

const socket = io();
var PLAYERS = [];

const userName = localStorage.getItem("userName");
const roomId = localStorage.getItem("roomId");
const header = document.getElementById("header");
const container = document.getElementById("container");

header.innerText = `Welcome to room:${roomId}, ${userName}`;

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("join-room", roomId, userName);
  socket.emit("new-player", socket.id, roomId);
  // generateRandomNumberEverySecond();
});

socket.on("update-players", (list) => {
  PLAYERS = list;
  console.log(PLAYERS);
  createPlayerDivs(PLAYERS);
});

socket.on("start-race", () => {
  generateRandomNumberEverySecond();
});

window.onbeforeunload = function () {
  window.setTimeout(function () {
    window.location = "http://localhost:3000";
  }, 0);
  window.onbeforeunload = null;
};

function createPlayerDivs(playersArray) {
  container.innerHTML = "";
  playersArray.forEach((player) => {
    const playerDiv = document.createElement("div");
    playerDiv.innerText = player.userName;
    playerDiv.style.position = "relative";
    playerDiv.style.left = `${player.progress}%`;
    playerDiv.style.backgroundColor = "blue"; // You can set other styles as needed
    container.appendChild(playerDiv);
  });
}

function generateRandomNumberEverySecond() {
  const min = 3; // Minimum value for the random number (inclusive)
  const max = 6; // Maximum value for the random number (inclusive)

  setInterval(() => {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    // console.log(randomNumber);
    socket.emit("update-info", randomNumber, roomId);
  }, 1000);
}

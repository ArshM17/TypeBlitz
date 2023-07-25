const socket = io();
var PLAYERS = [];

const userName = localStorage.getItem("userName");
const roomId = localStorage.getItem("roomId");

const header = document.getElementById("header");
header.innerText = `Welcome to room:${roomId}, ${userName}`;

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("join-room", roomId);
  socket.emit("new-player", socket.id, roomId);
});

socket.on("update-players", (list) => {
  PLAYERS = list;
  console.log(PLAYERS);
});

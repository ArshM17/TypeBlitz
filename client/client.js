// const socket = io();
// var PLAYERS = [];

var userName, room;
const form = document.getElementById("form");
const userNameInput = document.getElementById("username");
const roomInput = document.getElementById("roomId");

// socket.on("connect", () => {
//   console.log(socket.id);
//   console.log(userName, room);
//   socket.emit("new-player", socket.id);
// });

// socket.on("update-players", (list) => {
//   PLAYERS = list;
//   console.log(PLAYERS);
// });

form.addEventListener("submit", (e) => {
  e.preventDefault();
  userName = userNameInput.value;
  room = roomInput.value;
  if (userName === "" || room === "") return;
  localStorage.setItem("userName", userName);
  localStorage.setItem("roomId", room);
  window.location = "http://localhost:3000/race";
});

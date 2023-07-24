const socket = io();
var PLAYERS = [];

socket.on("connect", () => {
  console.log(socket.id);
  socket.emit("new-player", socket.id);
});

socket.on("update-players", (list) => {
  PLAYERS = list;
  console.log(PLAYERS);
});

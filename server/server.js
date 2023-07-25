const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const { Server } = require("socket.io");
const io = new Server(server);

const PLAYERS = [];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "home.html"));
});

app.get("/race", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "race.html"));
});

app.use(express.static(path.join(__dirname, "../client")));

io.on("connection", (socket) => {
  console.log(`new player: ${socket.id}`);

  socket.on("new-player", (id, roomId) => {
    PLAYERS.push({ id: id, progress: 0 });
    console.log(PLAYERS);
    socket.to(roomId).emit("update-players", PLAYERS);
  });

  socket.on("disconnect", () => {
    var idx;
    for (var i = 0; i < PLAYERS.length; i++) {
      if (PLAYERS[i].id == socket.id) {
        idx = i;
        break;
      }
    }
    PLAYERS.splice(idx, 1);
    io.emit("update-players", PLAYERS);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });
});

server.listen(3000, () => {
  console.log("Server Started");
});

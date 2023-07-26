const { kMaxLength } = require("buffer");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const { Server } = require("socket.io");
const io = new Server(server);

// const PLAYERS = [];
const ROOMS = new Map();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "home.html"));
});

app.get("/race", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "race.html"));
});

app.use(express.static(path.join(__dirname, "../client")));

io.on("connection", (socket) => {
  // console.log(`new player: ${socket.id}`);

  socket.on("new-player", (id, roomId) => {
    // PLAYERS.push({ id: id, progress: 0 });
    // console.log(PLAYERS);
    io.to(roomId).emit("update-players", ROOMS.get(roomId));
  });

  socket.on("disconnecting", () => {
    var room = [...socket.rooms][1];
    var PLAYERS = ROOMS.get(room);

    var idx;
    for (var i = 0; i < PLAYERS.length; i++) {
      if (PLAYERS[i].id == socket.id) {
        idx = i;
        break;
      }
    }
    PLAYERS.splice(idx, 1);
    console.log(PLAYERS);
    io.emit("update-players", PLAYERS);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    if (ROOMS.has(roomId)) {
      ROOMS.get(roomId).push({ id: socket.id, progress: 0 });
    } else {
      ROOMS.set(roomId, [{ id: socket.id, progress: 0 }]);
    }
  });
});

server.listen(3000, () => {
  console.log("Server Started");
});

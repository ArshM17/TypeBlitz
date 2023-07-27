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
    let room = [...socket.rooms][1];
    let PLAYERS = ROOMS.get(room);

    let idx = getSocketIndex(PLAYERS, socket.id);
    // for (let i = 0; i < PLAYERS.length; i++) {
    //   if (PLAYERS[i].id == socket.id) {
    //     idx = i;
    //     break;
    //   }
    // }
    PLAYERS.splice(idx, 1);
    io.to(room).emit("update-players", PLAYERS);
  });

  socket.on("join-room", (roomId, userName) => {
    socket.join(roomId);
    if (ROOMS.has(roomId)) {
      ROOMS.get(roomId).push({
        id: socket.id,
        userName: userName,
        progress: 0,
        isReady: false,
      });
    } else {
      ROOMS.set(roomId, [
        { id: socket.id, userName: userName, progress: 0, isReady: false },
      ]);
    }
    // if (ROOMS.get(roomId).length >= 2) {
    //   io.to(roomId).emit("start-race");
    // }
  });

  socket.on("ready", (roomId) => {
    // console.log(`${socket.id} is ready`);
    let PLAYERS = ROOMS.get(roomId);
    let idx = getSocketIndex(PLAYERS, socket.id);
    PLAYERS[idx].isReady = true;
    io.to(roomId).emit("update-players", PLAYERS);
    let count = countReady(PLAYERS);
    if (count == PLAYERS.length && count > 1) {
      io.to(roomId).emit("start-countdown");
    }
  });

  socket.on("not-ready", (roomId) => {
    // console.log(`${socket.id} is not ready`);
    let PLAYERS = ROOMS.get(roomId);
    let idx = getSocketIndex(PLAYERS, socket.id);
    PLAYERS[idx].isReady = false;
    io.to(roomId).emit("update-players", PLAYERS);
    io.to(roomId).emit("stop-countdown");
  });

  socket.on("update-info", (newValue, roomId) => {
    // console.log(roomId, newValue);
    let PLAYERS = ROOMS.get(roomId);
    // console.log(PLAYERS);
    let idx = getSocketIndex(PLAYERS, socket.id);
    // for (let i = 0; i < PLAYERS.length; i++) {
    //   if (PLAYERS[i].id == socket.id) {
    //     idx = i;
    //     break;
    //   }
    // }
    PLAYERS[idx].progress += newValue;
    io.to(roomId).emit("update-players", PLAYERS);
  });
});

server.listen(3000, () => {
  console.log("Server Started");
});

function getSocketIndex(PLAYERS, socketId) {
  let idx;
  for (let i = 0; i < PLAYERS.length; i++) {
    if (PLAYERS[i].id == socketId) {
      idx = i;
      break;
    }
  }
  return idx;
}

function countReady(PLAYERS) {
  let count = 0;
  for (let i = 0; i < PLAYERS.length; i++) {
    if (PLAYERS[i].isReady) count++;
  }
  return count;
}

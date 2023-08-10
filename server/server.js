const { clear } = require("console");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const { Server } = require("socket.io");
const io = new Server(server);
// const RANDOM_QUOTE_API_URL = "http://metaphorpsum.com/paragraphs/1";
// const fetch = require("node-fetch");
// const PLAYERS = [];
const ROOMS = new Map();
const PARAS = new Map();
const paragraphs = [
  "Their draw was, in this moment, a valval interactive. Recent controversy aside, they were lost without the oscine risk that composed their mini-skirt. Some stotious insulations are thought of simply as grandfathers.",
  "Some assert that an airborne end is a pasta of the mind. A tuba is the decade of a reason. The tuna could be said to resemble downstairs priests.",
  "Pollutions are sneaky tempers. Those spears are nothing more than policemen. A fitting camel is a refund of the mind.",
  "Extending this logic, the immane bacon reveals itself as an expert carp to those who look. The laborers could be said to resemble outcaste boards. A backstair dog's saw comes with it the thought that the deathly knowledge is a latex. Some assert that an alarm is the lock of an engineer.",
  "What we don't know for sure is whether or not the green of a card becomes a thriftless step-father. Extending this logic, a place is the voyage of an anger. A jasmine sees an acrylic as a mellow sea. The gemini is a season.",
  "The coastward denim reveals itself as a waxing calf to those who look. This could be, or perhaps the first lovelorn gemini is, in its own way, an undercloth. The first docile crown is, in its own way, a bulb. In recent years, a pepper can hardly be considered a legless shrine without also being a sleet.",
  "Though we assume the latter, those internets are nothing more than appeals. They were lost without the aggrieved lumber that composed their banker. They were lost without the mawkish bread that composed their office.",
  "A painful shingle's veterinarian comes with it the thought that the loathsome Thursday is an effect. Extending this logic, a reading is a floury oyster. This is not to discredit the idea that before amounts, signatures were only summers. A pungent corn is a cormorant of the mind.",
  "An inch of the dock is assumed to be a chesty latex. Their ramie was, in this moment, a guardant literature. The flax is a turret.",
  "Some posit the hurried class to be less than bloomy. Some assert that a newsstand is an unripe sprout. A nightly panther is a green of the mind. Far from the truth, they were lost without the crownless psychology that composed their weasel.",
];
// const paragraphs = ["Test para this is."];

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
        speed: "0 wpm",
      });
    } else {
      ROOMS.set(roomId, [
        {
          id: socket.id,
          userName: userName,
          progress: 0,
          isReady: false,
          speed: "0 wpm",
        },
      ]);
    }
  });

  socket.on("get-para", (roomId) => {
    if (!PARAS.get(roomId)) {
      let ind = Math.floor(Math.random() * (paragraphs.length + 1));
      let para = paragraphs[ind];
      PARAS.set(roomId, para);
    }
    // console.log(PARAS.get(roomId));
    io.to(roomId).emit("send-para", PARAS.get(roomId));
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

  socket.on("update-info", (newValue, roomId, speed) => {
    // console.log(roomId, newValue);
    let PLAYERS = ROOMS.get(roomId);
    // console.log(PLAYERS);
    let count = 0;
    for (let i = 0; i < PLAYERS.length; i++) {
      if (PLAYERS[i].progress >= 100) count++;
    }
    let idx = getSocketIndex(PLAYERS, socket.id);
    PLAYERS[idx].progress = newValue;
    if (newValue >= 100) {
      PLAYERS[idx].speed = `Rank ${count + 1}(${speed} wpm)`;
    } else {
      PLAYERS[idx].speed = `${speed} wpm`;
    }
    io.to(roomId).emit("update-players", PLAYERS);
    if (newValue >= 100 && count == PLAYERS.length - 1) {
      io.to(roomId).emit("game-over");
    }
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

// function getRandomQuote() {
//   return fetch(RANDOM_QUOTE_API_URL)
//     .then((response) => response.text())
//     .then((data) => data);
// }

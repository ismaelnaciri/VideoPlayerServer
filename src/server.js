const express = require('express');
const {Server} = require("socket.io");
const port = 3000;
const io = new Server(8887);
const ioAndroid = new Server(8888);
const app = express();
const fs = require('fs');
const path = require('path');

const cors = require('cors');

//App server can't listen to the same port of sockets

app.use(cors());

app.use(express.json());
app.use(express.static("assets"));
app.listen(port, () => {
  console.log(`El servidor està escoltant el port::${port}`);
});


let videos = [];
let images = [];

let filesVid = fs.readdirSync(__dirname + "\\assets\\videos");
let filesImg = fs.readdirSync(__dirname + "\\assets\\imgs");

let socketAndroid = undefined;
let socketAngular = undefined;


// filesImg.forEach(element => {
//   if (element.split('.')[1] === 'png') )
//   // || element
// });


filesVid.forEach(element => {
  if (element.split('.')[1] === 'mp4'
    || element.split('.')[1] === 'ogg') {

      videos.push({
        title: element,
        videoUrl: "videos/" + element,
        opened: false,
        verified: undefined
      });
  }
});

let serverCode;

//Cannot nest socket.on!!!

ioAndroid.on("connection", (socket) => {
  socketAndroid = socket;

  socketAndroid.on("EnviarCodiPeli", (androidCodi) => {
    console.log("Server code: " + serverCode);
    console.log("Android code: " + androidCodi);

    if (serverCode === androidCodi) {
      console.log("WORKS?" ,serverCode===androidCodi)
      socketAngular.emit("VerifiedCorrectly", true);
    } else {
      socketAngular.emit("VerifiedCorrectly", false);
    }
  });
});


io.on("connection", (socket) => {
  socketAngular = socket;
  socketAngular.emit("hello", "world");
  //  socket.emit("VerifiedCorrectly", true);

  socketAngular.on("RequestVideo", () => {
    socketAngular.emit("VideoList", videos);
  });

  //First angular client calls requestCodiVideo
  socketAngular.on("RequestVideoVerification", (args) => {
    let codi = generateRandomString();
    serverCode = codi;
    console.log(args);
    socketAngular.emit("CodiVideo", codi)

  });
});


function generateRandomString() {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let randomString = '';

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}


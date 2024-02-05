const express = require('express');
const {Server} = require("socket.io");
const port = 3000;

const io = new Server(8888);

const app = express();
const fs = require('fs');
const path = require('path');

const cors = require('cors');
const mysql = require('mysql2')

//App server can't listen to the same port of sockets

app.use(cors());

app.use(express.json());
app.use(express.static("assets"));
app.listen(port, () => {
  console.log(`El servidor està escoltant el port::${port}`);
});


let videos    = [];
let webAssets = [];
let images    = [];

let filesVid = fs.readdirSync(__dirname + "\\assets\\videos");
let filesWebAssets = fs.readdirSync(__dirname + "\\assets\\webAssets");
let filesMovieImages = fs.readdirSync(__dirname + "\\assets\\imgs");


// filesWebAssets.forEach(element => {
//   if (element.split('.')[1] === 'png'
//     || element.split('.')[1] === 'jpg'
//     || element.split('.')[1] === 'svg'
//     || element.split('.')[1] === 'webp')
//   {
//     webAssets.push({
//       title: element,
//       assetUrl: "webAssets/" + element
//     })
//   }
// });
//
// filesMovieImages.forEach(element => {
//   if (element.split('.')[1] === 'png'
//     || element.split('.')[1] === 'jpg')
//   {
//     images.push({
//       title: element,
//       imageUrl: "imgs/" + element
//     })
//   }
// });


filesVid.forEach(element => {
  if (element.split('.')[1] === 'mp4'
    || element.split('.')[1] === 'ogg') {

      videos.push({
        title: element,
        videoUrl: "videos/" + element,
        opened: false,
        verified: undefined,
      });
  }
});


let serverCode;

//Cannot nest socket.on!!!

io.on("connection", (socket) => {
  socket.join("verificationRoom");
  socket.emit("hello", "world");

  // socket.on("iniWebImages", () => {
  //   socket.emit("webImages", webAssets)
  // });

  socket.on("RequestVideo", () => {
    socket.emit("VideoList", videos);
  });

  socket.on("RequestVideoVerification", (args) => {
    let codi = generateRandomString();
    serverCode = codi;
    console.log(args);
    socket.emit("CodiVideo", codi);

    console.log("TEST! XD ISMA MADE BY MIHOYO RIOOT.  |  ", serverCode);
  });

  socket.on("EnviarCodiPeli", (androidCodi) => {
    console.log("Server code: " + serverCode);
    console.log("Android code: " + androidCodi);

    if (serverCode === androidCodi) {
      console.log("WORKS?" ,serverCode===androidCodi)
      io.to("verificationRoom").emit("VerifiedCorrectly", true);
    } else {
      io.to("verificationRoom").emit("VerifiedCorrectly", false);
    }
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



//BD connexió:
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'patata',
  database: 'stream_vi'
});






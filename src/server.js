const express = require('express');
const {Server} = require("socket.io");
const port = 3000;
const io = new Server(8888);
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

let files = fs.readdirSync(__dirname + "\\assets");

files.forEach(element => {
  if (element.split('.')[1] === 'mp4'
    || element.split('.')[1] === 'ogg') {

      videos.push({
        title: element,
        url: "assets/".concat(element),
        opened: false
      });
  }
})


//Cannot nest socket.on!!!

io.on("connection", (socket) => {
  socket.emit("hello", "world");

  socket.on("RequestVideo", () => {
    socket.emit("VideoList", videos);
  });

  let codi = generateRandomString();

  //First angular client calls requestCodiVideo
  socket.on("RequestVideoVerification", (args) => {
    console.log(args);
    socket.emit("CodiVideo", codi)

  });

  socket.on("howdy", (arg) => {
    console.log(arg);
  });

  socket.on("EnviarCodiPeli", (androidCodi) => {
    console.log("Server code: " + codi);
    console.log("Android code: " + androidCodi);
    if (codi === androidCodi) {
      console.log("WORKS?" ,codi===androidCodi)
      socket.emit("VerifiedCorrectly", "true");
    }
  });

  //socket.on("VideoArrayindex", (video) => {
  //     app.use('/', (req, res) => {
  //       res.sendFile(
  //         video.title, {
  //           root: path.join(__dirname + '/assets/')
  //         }
  //         // path.join(__dirname, '/assets/' + videos[position].title)
  //       );
  //     });
  //   });

})


function generateRandomString() {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let randomString = '';

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}


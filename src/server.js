const express = require('express');
const {Server} = require("socket.io");
const port = 3000;
const io = new Server(8888);
const app = express();
const fs = require('fs');

const cors = require('cors');

//App server can't listen to the same port of sockets

app.use(cors());

app.use(express.json());
app.listen(port, () => {
  console.log(`El servidor està escoltant el port::${port}`);
})
let videos = [];

let files = fs.readdirSync("C:\\IdeaProjects\\2nDAM\\VideoPlayerServer\\src\\assets");

files.forEach(element => {
  if (element.split('.')[1] === 'mp4'
    || element.split('.')[1] === 'ogg') {

      videos.push({
        title: element.split('.')[0].replace('_', " ").split('720p')[0],
        url: "assets/".concat(element),
        opened: false
      });
  }
})

// for (let i = 0; i < videos.length; i++) {
//   console.log("TESTESTTESTESTTESTESTTESTESTTESTESTTESTEST");
//   console.log(videos[i]);
// }

// files.forEach(element => {
//   if (element.split('.')[1] === 'mp4'
//     || element.split('.')[1] === 'ogg') {
//       console.log(element);
//   }
// })

io.on("connection", (socket) => {
  socket.emit("hello", "world");

  socket.on("RequestVideo", () => {
    socket.emit("VideoList", videos);
  })

  //First angular client calls requestCodiVideo
  socket.on("RequestVideoVerification", (args) => {
    console.log(args);

    let codi = generateRandomString();
    socket.emit("CodiVideo", codi)

    socket.on("EnviarCodiPeli", (androidCodi) => {
      console.log(androidCodi);
      if (codi === androidCodi)
        socket.emit("VeifiedCorrectly", true);
    })
  })

  socket.on("howdy", (arg) => {
    console.log(arg);
  })

  // socket.on("disconnect", (reason) => {
  //   console.log(`socket ${socket.id} disconnected due to ${reason}`);
  // })

  //crear array d'objectes
  //Object fields: title, url
  //format of the url is "assets/video.mp4"
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


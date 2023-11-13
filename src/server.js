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
        title: element,
        url: "assets/".concat(element)
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

  socket.on("RequestCodiVideo", (args) => {
    socket.emit("CodiVideo", "XDXDXDXD")
    console.log(args);
  })

  socket.on("EnviarCodiPeli", (args) => {
    console.log(args);
  })

  socket.on("howdy", (arg) => {
    console.log(arg);
  })

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  })

  //crear array d'objectes
  //Object fields: title, url
  //format of the url is "assets/video.mp4"
})

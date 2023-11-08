const express = require('express');
const {Server} = require("socket.io");
const port = 3000;
const io = new Server(8888);
const app = express();

const cors = require('cors');

//App server can't listen to the same port of sockets

app.use(cors());
app.use(express.json());
app.listen(port, () => {
  console.log(`El servidor està escoltant el port::${port}`);
})

io.on("connection", (socket) => {
  console.log("ngrrwfsngbuefsgjs<i")
  socket.emit("hello", "world");

  socket.on("RequestCodiPeli", (args) => {
    socket.emit("CodiPeli", "XDXDXDXD")
    console.log(args);
  })

  socket.on("howdy", (arg) => {
    console.log(arg);
  })

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  })
})

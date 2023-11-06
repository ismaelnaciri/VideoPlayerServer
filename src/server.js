const express = require('express');
const {Server} = require("socket.io");

const io = new Server(3000);

io.on("connection", (socket) => {
  console.log("ngrrwfsngbuefsgjs<i")
  socket.emit("hello", "world");

  socket.on("EnviarCodiPeli", (args) => {
    console.log(args);
  })

  socket.on("howdy", (arg) => {
    console.log(arg);
  })
})

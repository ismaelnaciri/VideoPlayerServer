const express = require('express');
const {Server} = require("socket.io");

const io = new Server

io.on("connection", (socket) => {
  socket.emit("hello", "world");

  socket.on("howdy", (arg) => {
    console.log(arg);
  })
})

const express = require('express');
const {Server} = require("socket.io");
const http = require('http');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const port = 3000;

const io = new Server(8888);

const app = express();
const fs = require('fs');
const path = require('path');

const cors = require('cors');

//App server can't listen to the same port of sockets

const configObj = JSON.parse(fs.readFileSync('ConnexioBD_MySQL', 'utf8'));

const connexioMySQL = mysql.createConnection({
  database: configObj.database,
  user: configObj.username,
  password: configObj.password,
  host: configObj.host,

});

// con.connect((err) => {
//   if (err) throw err;
//   console.log("Conected to MySql");
// });

const JWT_SECRET = "bobbyVideoSite";

app.use(cors());

app.use(express.json());
app.use(express.static("assets"));
app.listen(port, () => {
  console.log(`El servidor està escoltant el port::${port}`);
});

//Option 1 with express post
app.post('/api/auth', (req, res) => {
  if (req.body) {
    let user = req.body;
    console.log("user | ", user);
    let queryResult = '';

    if (queryResult.email === user.email && queryResult.password === user.password) {
      user["iat"] = new Date().getTime();
      user["exp"] = user["iat"] + 31556926;  //value of 1 year in epoch time
      let token = jwt.sign(user, JWT_SECRET);

      //Insert token to db

      res.status(200).send({
        code: 200,
        message: "Logged in correctly, sending jwt",
        token: token,
        user: user
      });
    } else {
      res.status(401).send({
        code: 401,
        message: "Wrong credentials. If the issue persists, please contact with support."
      })
    }
  } else {
    res.status(400).send({
      code: 400,
      message: "Post body cannot be empty!!"
    });
  }
});

// app.post('/api/register', (req, res) => {
//   if (req.body) {
//     let user = req.body;
//
//     let queryResult = '';
//     if (queryResult.email !== '') {
//       //make insert into database
//
//       user["iat"] = new Date().getTime();
//       user["exp"] = user["iat"] + 31556926;  //value of 1 year in epoch time
//       let token = jwt.sign(user, JWT_SECRET);
//
//       res.status(200).send({
//         code: 200,
//         message: "User created successfully!",
//         token: token
//       });
//     }
//   } else {
//     res.status(400).send({
//       code: 400,
//       message: "Post body cannot be empty!!!!!!!!"
//     });
//   }
// })


let videos = [];
let webAssets = [];
let images = [];

let filesVid = fs.readdirSync(__dirname + "\\assets\\videos");
let filesWebAssets = fs.readdirSync(__dirname + "\\assets\\webAssets");
let filesMovieImages = fs.readdirSync(__dirname + "\\assets\\imgs");


// const server = http.createServer((req, res) => {
//   const { headers, method, url } = req;
//   let body = [];
//
//   if (req.url === "/auth" && method === "POST") {
//     req
//       .on('error', err => {
//         console.log("Error | ", err);
//       })
//       .on('data', chunk => {
//         body.push(chunk);
//         console.log(body);
//
//         let user = body[0].json();
//         // user["exp"] = ;
//         if (user.email === "queryResult.email" && user.password === "queryResult.password") {
//           let token = jwt.sign(user, JWT_SECRET);
//
//           res.status(200).send({
//             signed_user: user,
//             token: token
//           })
//         }
//     })
//   }
// }).use(bodyParser.json())
//   .use(cors)
//   .listen(7777);

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

  //Option 2 sockets jwt
  // socket.on('userCredentials', (userCredentials) => {
  //   //Make bd query here
  //   let queryResult = '';
  //
  //   if (queryResult.email === userCredentials.email && queryResult.password === userCredentials.password) {
  //     userCredentials["iat"] = new Date().getTime();
  //     userCredentials["exp"] = userCredentials["iat"] + 31556926;  //value of 1 year in epoch time
  //     let token = jwt.sign(userCredentials, JWT_SECRET);
  //
  //     socket.emit({
  //       code: 200,
  //       message: "Logged in correctly, sending token.",
  //       token: token,
  //       user: user
  //     });
  //   } else {
  //     socket.emit({
  //       code: 401,
  //       message: "Wrong credentials. If the problem persists contact with support"
  //     });
  //   }
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
      console.log("WORKS?", serverCode === androidCodi)
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



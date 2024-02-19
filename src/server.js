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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors)
//App server can't listen to the same port of sockets

const configObj = JSON.parse(fs.readFileSync('ConnexioBD_MySQL', 'utf8'));

const connexioMySQL = mysql.createConnection({
  database : configObj.database,
  user : configObj.username,
  password : configObj.password,
  host : configObj.host,

});

app.post('/login', (req, res) => {
  console.log("login")
  const { email, passw } = req.body;

  console.log(email + " " + passw)

  const consulta = `SELECT * FROM user WHERE user = '${email}' AND password = '${passw}'`;

  connexioMySQL.query(consulta, (error, resultados) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error en la consulta SQL' });
      console.log("Error")
    } else {
      if (resultados.length > 0) {
        res.status(200).json({ success: true, message: 'Inicio de sesión correcto' });
        console.log("good")
        console.log(resultados)

      } else {
        res.status(401).json({ success: false, message: 'Incio de sessión incorrecto' });
        console.log("bad")

      }
    }
  });
});


// con.connect((err) => {
//   if (err) throw err;
//   console.log("Conected to MySql");
// });

app.use(cors());

app.use(express.json());
app.use(express.static("assets"));

// app.post('/api/aouth', (req, res) => {
//   if (req.body) {
//     let
//   }
// })
app.listen(port, () => {
  console.log(`El servidor està escoltant el port::${port}`);
});

const JWT_SECRET = "bobbyVideoSite"

let videos    = [];
let webAssets = [];
let images    = [];

let filesVid = fs.readdirSync(__dirname + "\\assets\\videos");
let filesWebAssets = fs.readdirSync(__dirname + "\\assets\\webAssets");
// let filesMovieImages = fs.readdirSync(__dirname + "\\assets\\imgs");


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



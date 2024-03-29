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
  port: configObj.port
});

let filesVid = fs.readdirSync(__dirname + "\\assets\\videos");

let videosTemp = [];
let i = 0;

filesVid.forEach(element => {
  if (element.split('.')[1] === 'mp4'
    || element.split('.')[1] === 'ogg') {

    videosTemp.push({
      title: element,
      videoUrl: "videos/" + element,
      opened: false,
      verified: undefined,
      premium: i % 2 === 0 // Si es par, es true, si es impar, es false
    });
    i += 1;
  }
});


const JWT_SECRET = "bobbyVideoSite";

app.use(cors());

app.use(express.json());
app.use(express.static("assets"));
app.listen(port, () => {
  console.log(`El servidor està escoltant el port::${port}`);
});

//Option 1 with express post
app.post('/api/auth', async (req, res) => {
  if (req.body) {
    const user = req.body;
    console.log(user.email + " " + user.password)

    const query = `SELECT *
                   FROM user
                   WHERE email = '${user.email}'
                     AND password = '${user.password}'`;

    connexioMySQL.query(query, (error, resultados) => {
      if (error) {
        res.status(500).send({
          success: false,
          message: 'Error en la consulta SQL'
        });

        console.log("Error whilst getting user")
      } else {
        if (resultados.length > 0) {
          user["iat"] = new Date().getTime();

          if (resultados[0].JsonWebToken !== '' && resultados[0].JsonWebToken !== null) {
            res.status(200).send({
              code: 200,
              message: "Logged in correctly, sending jwt",
              token: resultados[0].JsonWebToken,
              user: user
            });


          } else {
            let token = jwt.sign(user, JWT_SECRET, {
              expiresIn: '100 days'
            });
            //Insert token to db
            const query = `UPDATE user
                           SET JsonWebToken = ?
                           WHERE email = ?
                             AND password = ?`;
            const values = [token, user.email, user.password];

            connexioMySQL.query(query, values, (error, results, fields) => {
              if (error) {
                res.status(500).send({
                  code: 500,
                  message: error.message
                })
                console.error('Error al insertar el token:', error);
                return;
              }
              console.log('Token insertado correctamente en la base de datos.');
              res.status(200).send({
                code: 200,
                message: "Logged in correctly, sending jwt",
                token: token,
                user: user
              });
            })
          }

        } else {
          res.status(401).json({success: false, message: 'Inicio de sessión incorrecto'});
          console.log("bad")
        }
      }
    });

  } else {
    res.status(400).send({
      code: 400,
      message: "Post body cannot be empty!!"
    });
  }
});

let videosFinal = [];

let tokenTemp = "";

app.get('/api/videos', (req, res) => {
  let tokenHeader = req.headers["token"];
  tokenTemp = tokenHeader;
  console.log("headers  |  ", req.headers);
  console.log("TOKEN   |  ", tokenHeader);
  console.log()
  if (tokenHeader !== null && tokenHeader !== undefined && tokenHeader !== '') {

    const payload = jwt.verify(tokenHeader, JWT_SECRET);
    console.log("payload  |  ", payload);
    if (payload !== null && payload !== undefined && payload !== '') {

      const query = `SELECT *
                     FROM user
                     WHERE JsonWebToken = '${tokenHeader}'`;

      connexioMySQL.query(query, (error, result) => {
        if (error) {
          res.status(500).send({
            code: 500,
            message: error.message
          })
        } else {
          if (result.length > 0) {
            videosFinal = [];
            //Returns expiration time of token in epoch time
            console.log("query result |  ", result);
            let jwtExpirationTime = jwt.verify(result[0].JsonWebToken, JWT_SECRET);
            console.log("jwt object from query   |   ", jwtExpirationTime);


            console.log("ROL   |   ", result[0].rol);

            console.log("TESTTESTTEST  |  ", jwtExpirationTime.exp > new Date().getTime() / 1000);
            if (result[0].rol === "premium" && jwtExpirationTime.exp > new Date().getTime() / 1000) {
              console.log("INSIDE good result")
              videosTemp.forEach(element => {
                videosFinal.push(element);
              })

              res.status(200).send({
                code: 200,
                message: "Premium Videos sent correctly!",
                videos: videosFinal
              })

              console.log("videos  |  ", videosFinal);
            } else if (result[0].rol === "standard" && jwtExpirationTime.exp > new Date().getTime() / 1000) {
              console.log("ENTER STANDARAD");
              videosTemp.forEach(element => {
                if (element.premium === false) {
                  videosFinal.push(element);
                }
              })

              console.log("videos standrard  |  ", videosFinal);

              res.status(200).send({
                code: 200,
                message: "Free Videos sent correctly!",
                videos: videosFinal
              })
            }
          } else {
            console.log("Empty result from query")
            res.status(403).send({
              code: 403,
              message: "Invalid token. Please contact support for further instructions."
            })
          }
        }
      })
    }
  }
});


let webAssets = [];
let images = [];

// let filesWebAssets = fs.readdirSync(__dirname + "\\assets\\webAssets");
// let filesMovieImages = fs.readdirSync(__dirname + "\\assets\\imgs");


let serverCode;

//Cannot nest socket.on!!!

io.on("connection", (socket) => {
  socket.join("verificationRoom");
  socket.emit("hello", "world");

  socket.on("RequestVideo", () => {
    const payload = jwt.verify(tokenTemp, JWT_SECRET);
    console.log("payload  |  ", payload);
    if (payload !== null && payload !== undefined && payload !== '') {
      socket.emit("VideoList", videosFinal);
    } else {
      console.log("ERROR  |  JWT not provided to socket event");
    }


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



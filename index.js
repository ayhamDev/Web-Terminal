const express = require("express");
const { readdir } = require("fs");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const ip = require("ip");
const { platform, userInfo, hostname } = require("os");
const shell = platform() === "win32" ? "powershell.exe" : "bash";
const { spawn } = require("child_process");
const { clear } = require("console");

let Users = [];

const PORT = process.env.PORT | 3223;

app.use("/public", express.static("public"));

app.get("/Terminal/*", (req, res) => {
  res.redirect("/Terminal");
});
app.get("/", (req, res) => {
  res.redirect("/Terminal");
});
app.get("/Terminal", (req, res) => {
  res.sendFile(process.cwd() + "/view/index.html");
});

server.listen(PORT, () => draw());

io.on("connection", (socket) => {
  Users.push({ id: socket.id, timeStamp: new Date() });
  draw();

  io.to(socket.id).emit("info", hostname(), process.cwd());

  socket.on("command", (data) => {
    const child = spawn("cd", [data.cwd, ";", data.command], {
      shell,
      env: process.env,
    });
    child.stdout.on("data", (data) => {
      io.to(socket.id).emit("stdout", data.toString());
    });

    child.stderr.on("data", (data) => {
      io.to(socket.id).emit("error", data.toString());
    });

    child.on("close", (code) => {
      io.to(socket.id).emit("close", code);
    });
    child.stdin.write("console.log(`fefe`);", (err) => console.log(err));
  });

  socket.on("disconnect", () => {
    Users = Users.filter((user) => user.id !== socket.id);
    draw();
  });
});

function draw() {
  clear();
  console.log(`Server is Listening on:
http://localhost:${PORT}
http://${hostname()}:${PORT}
http://${ip.address()}:${PORT}\n`);

  Users.length > 0 ? console.table(Users) : null;
}

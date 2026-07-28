import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { onEnterMafia } from "./services/onEnterMafia";
import { onCreateRoom } from "./services/onCreateRoom";
import { onJoinRoom } from "./services/onJoinRoom";
import { onFastJoinRoom } from "./services/onFastJoinRoom";
import { onExitRoom } from "./services/onExitRoom";
import { onSetReady } from "./services/onSetReady";
import { onUserInfo } from "./services/onUserInfo";
import { onDisconnect } from "./services/onDisconnect";
import { onGameStart } from "./services/onGameStart";
import { onVoteTo } from "./services/onVoteTo";
import { onVoteYesOrNo } from "./services/onVoteYesOrNo";
import { onSelectPlayer } from "./services/onSelectPlayer";
import { onUpdateRoomInfo } from "./services/onUpdateRoomInfo";

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
  },
});
const mafiaIo = io.of("/mafia");

app.get("/", (req, res) => {
  res.send("express 서버와 연결되어 있습니다.");
});

mafiaIo.on("connection", (socket) => {
  onEnterMafia(socket);

  onCreateRoom(socket);

  onJoinRoom(socket, mafiaIo);

  onFastJoinRoom(socket, mafiaIo);

  onExitRoom(socket, mafiaIo);

  onSetReady(socket, mafiaIo);

  onUserInfo(socket, mafiaIo);

  onUpdateRoomInfo(socket);

  onDisconnect(socket, mafiaIo);

  onGameStart(socket, mafiaIo);

  onVoteTo(socket);

  onVoteYesOrNo(socket);

  onSelectPlayer(socket);
});

server.keepAliveTimeout = 200_000;

server.listen(port, () => {
  console.log(`port(${port})으로 실행 중`);
});

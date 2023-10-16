import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const handleListen = () => console.log('Listening on http://localhost:3002');

const httpServer = http.createServer(app);

const wsServer = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

wsServer.on("connection", (socket) => {

    socket["nickname"] = "익명";

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on("enter_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome", socket.nickname);
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
    });

    socket.on("new_message", (msg, roomName) => {
        const currentTime = getCurrentTime();
        socket.to(roomName).emit("new_message", socket.nickname, msg, currentTime);
    });

    socket.on("nickname", nickname => (socket["nickname"] = nickname));

});

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

httpServer.listen(3002, handleListen); 
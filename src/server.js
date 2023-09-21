import express from "express";
import http from "http";
import {Server} from "socket.io";

const app = express();

const handleListen = () => console.log('Listening on http://localhost:3002');

const httpServer = http.createServer(app);

const wsServer = new Server(httpServer);

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
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    });

    socket.on("nickname", nickname => (socket["nickname"] = nickname));

});

httpServer.listen(3002, handleListen); 
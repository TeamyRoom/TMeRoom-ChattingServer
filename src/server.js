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

var members = new Map();

wsServer.on("connection", (socket) => {

    socket["nickname"] = "익명";
    socket["roomname"] = "임시";

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    socket.on("enter_room", (roomName) => {
        socket.join(roomName);
        socket["roomname"] =  roomName;
        if(!members.has(roomName)) {
            let memberList = [];
            memberList.push(socket.nickname);
            members.set(socket.roomname, memberList);
        }
        else {
            members.get(socket.roomname).push(socket.nickname);
        }
        socket.emit("members", members.get(socket.roomname));
        socket.to(socket.roomname).emit("welcome", socket.nickname, members.get(socket.roomname));
    });

    socket.on("disconnecting", () => {
        for(let i = 0; i < members.get(socket.roomname).length; i++) {
            if(members.get(socket.roomname)[i] === socket.nickname) {
                members.get(socket.roomname).splice(i, 1);
                break;
            }
        }
        if(members.get(socket.roomname) === 0) members.delete(socket.roomname);
        socket.to(socket.roomname).emit("bye", socket.nickname, members.get(socket.roomname));
    });

    socket.on("new_message", (msg) => {
        const currentTime = getCurrentTime();
        socket.to(socket.roomname).emit("new_message", socket.nickname, msg, currentTime);
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
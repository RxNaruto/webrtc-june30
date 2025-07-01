"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 3004 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        if (message.type === 'sender') {
            senderSocket = ws;
            console.log('sender joined');
        }
        else if (message.type === 'receiver') {
            receiverSocket = ws;
            console.log('receiver joined');
        }
        else if (message.target === 'receiver') {
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify(message));
        }
        else if (message.target === 'sender') {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify(message));
        }
    });
});

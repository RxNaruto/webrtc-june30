import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 3004 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data: any) {
        const message = JSON.parse(data);

        if (message.type === 'sender') {
            senderSocket = ws;
            console.log('sender joined');
        } else if (message.type === 'receiver') {
            receiverSocket = ws;
            console.log('receiver joined');
        } else if (message.target === 'receiver') {
            receiverSocket?.send(JSON.stringify(message));
        } else if (message.target === 'sender') {
            senderSocket?.send(JSON.stringify(message));
        }
    });
});

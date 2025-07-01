import { useEffect, useState } from "react";

export const Sender = () => {
    const [socket, setSocket] = useState<null | WebSocket>(null);
    const [peerConfig, setPeerConfig] = useState<any>(null);

    useEffect(() => {
        const socket = new WebSocket('wss://webrtc2way.rithkchaudharytechnologies.xyz/ws/');
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'sender' }));
        };
        setSocket(socket);

        (async () => {
            const response = await fetch("https://mycapstoneturnserver.metered.live/api/v1/turn/credentials?apiKey=49c30365ef3c75870c2e02da41af28ba0a40");
            const iceServers = await response.json();
            setPeerConfig({ iceServers });
        })();
    }, []);

    async function startSendingVideo() {
        if (!socket || !peerConfig) return;

        const peerConnection = new RTCPeerConnection(peerConfig);

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate, target: 'receiver' }));
            }
        };

        peerConnection.ontrack = (event) => {
            console.log('Received track from receiver!', event);
            const video = document.createElement('video');
            video.autoplay = true;
            video.playsInline = true;
            video.srcObject = event.streams[0];
            document.body.appendChild(video);
        };

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'createOffer') {
                await peerConnection.setRemoteDescription(data.sdp);

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.send(JSON.stringify({ type: 'createAnswer', sdp: peerConnection.localDescription, target: 'receiver' }));
            }
            else if (data.type === 'createAnswer') {
                await peerConnection.setRemoteDescription(data.sdp);
            }
            else if (data.type === 'iceCandidate') {
                await peerConnection.addIceCandidate(data.candidate);
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.send(JSON.stringify({ type: 'createOffer', sdp: peerConnection.localDescription, target: 'receiver' }));
    }

    return (
        <div onClick={startSendingVideo}>
            <button>Send Video</button>
        </div>
    );
};

// src/utils/rtc.js
export const createPeerConnection = ({ onTrack, onIceCandidate }) => {
    const config = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" } // Free Google STUN server
        ]
    };
    const pc = new RTCPeerConnection(config);

    pc.ontrack = onTrack;
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            onIceCandidate(event.candidate);
        }
    };
    return pc;
};
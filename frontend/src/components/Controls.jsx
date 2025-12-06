// src/components/Controls.jsx
import React from "react";

const Controls = ({ isAudioOn, isVideoOn, onToggleAudio, onToggleVideo, onLeave }) => {
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-3 bg-gray-800 p-3 rounded-full shadow-lg">
            <button onClick={onToggleAudio} className="px-3 py-2 rounded bg-gray-700 text-white">
                {isAudioOn ? "Mute" : "Unmute"}
            </button>
            <button onClick={onToggleVideo} className="px-3 py-2 rounded bg-gray-700 text-white">
                {isVideoOn ? "Stop Video" : "Start Video"}
            </button>
            <button onClick={onLeave} className="px-3 py-2 rounded bg-red-600 text-white">
                Leave
            </button>
        </div>
    );
};

export default Controls;

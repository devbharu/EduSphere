// src/components/VideoTile.jsx
import React, { useEffect, useRef } from "react";

const VideoTile = ({ stream, label, isLocal }) => {
    const ref = useRef();

    useEffect(() => {
        if (!ref.current) return;
        ref.current.srcObject = stream;
    }, [stream]);

    return (
        <div className="bg-gray-900 rounded-md overflow-hidden flex flex-col items-center justify-center p-1">
            <video
                ref={ref}
                autoPlay
                playsInline
                muted={!!isLocal}
                className="w-full h-40 object-cover bg-black"
            />
            <div className="w-full text-center text-sm text-white bg-black bg-opacity-40 py-1">
                {label}
            </div>
        </div>
    );
};


export default VideoTile;

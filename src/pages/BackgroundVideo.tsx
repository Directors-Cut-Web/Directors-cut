// src/components/BackgroundVideo.tsx

import React, { useRef, useEffect } from 'react'; // Import useRef and useEffect
import videoSrc from '../assets/directorscut.mp4';
import posterSrc from '../assets/futuristic-studio.jpg';

const BackgroundVideo = () => {
  // Create a ref to get direct access to the video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // This effect runs once after the component mounts
  useEffect(() => {
    // Set the playback speed to half (0.5)
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []); // The empty array ensures this effect only runs once

  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <video
        ref={videoRef} // Attach the ref to the video element
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
        className="w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
    </div>
  );
};

export default BackgroundVideo;
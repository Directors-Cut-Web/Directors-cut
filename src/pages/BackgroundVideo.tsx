// src/components/BackgroundVideo.tsx

import React from 'react';
// Import your video and the fallback image
import videoSrc from '../assets/directorscut.mp4';
import posterSrc from '../assets/futuristic-studio.jpg'; // The fallback image

const BackgroundVideo = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc} // Show this image while the video loads or if it fails
        className="w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Optional: Add a dark overlay for better text readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
    </div>
  );
};

export default BackgroundVideo;
// src/pages/Index.tsx

import BackgroundVideo from '../components/BackgroundVideo'; // 1. Import the component

// Let's assume your original IndexPage looked something like this:
/*
const IndexPage = () => {
  return (
    <div>
      <h1>Welcome to Director's Cut</h1>
      // ...other homepage content...
    </div>
  );
};
*/

// Now, update it to include the video background:
const IndexPage = () => {
  return (
    // 2. Add a relative container to hold the video and content
    <div className="relative w-full h-full">
      <BackgroundVideo />
      
      {/* 3. Your original homepage content goes here, inside a new container */}
      {/* This 'z-10' ensures your content sits ON TOP of the video */}
      <div className="relative z-10">
        <h1>Welcome to Director's Cut</h1>
        {/* ...all your other homepage content... */}
      </div>
    </div>
  );
};

export default IndexPage;
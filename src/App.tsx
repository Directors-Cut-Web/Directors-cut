import { Route, Routes } from 'react-router-dom';
import IndexPage from './pages/Index.tsx';
import StudioPage from './pages/StudioPage.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import BackgroundVideo from './components/BackgroundVideo.tsx'; // Import the new component

function App() {
  return (
    // Make this div 'relative' for the background video's positioning
    <div className="relative min-h-screen">
      {/* The video component sits here, behind everything else */}
      <BackgroundVideo />

      {/* The rest of your app structure stays the same */}
      <Header />
      <main className="relative z-10 pt-16 flex-grow">
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/studio" element={<StudioPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
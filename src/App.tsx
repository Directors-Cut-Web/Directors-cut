import { Route, Routes } from 'react-router-dom';
import IndexPage from './pages/Index.tsx';
import StudioPage from './pages/StudioPage.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 flex-grow">
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
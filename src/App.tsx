import { Route, Routes } from 'react-router-dom'
import IndexPage from './pages/Index' 
import StudioPage from './pages/StudioPage' 
// --- MODIFICATION: Import the new Runway form component ---
import RunwayGen4Form from './components/RunwayGen4Form'; // Assuming the path is src/components/

function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/studio" element={<StudioPage />} />
      
      {/* --- MODIFICATION: Added a temporary route for Runway ---
          This is a placeholder to make the component visible.
          We will integrate it into the StudioPage popup later.
      */}
      <Route 
        path="/studio/runway" 
        element={<RunwayGen4Form onPromptGenerated={(prompt) => console.log(prompt)} />} 
      />

    </Routes>
  )
}

export default App

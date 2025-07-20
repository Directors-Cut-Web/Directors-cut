import { Route, Routes } from 'react-router-dom'
// --- MODIFICATION: Updated paths to use the '@' alias for reliability ---
import IndexPage from '@/pages/Index' 
import StudioPage from '@/pages/StudioPage' 
import RunwayGen4Form from '@/components/RunwayGen4Form';

function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/studio" element={<StudioPage />} />
      
      {/* This is a temporary route to make the component visible.
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

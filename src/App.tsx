import { Route, Routes } from 'react-router-dom'
import IndexPage from '@/pages/Index.tsx' 
import StudioPage from '@/pages/StudioPage.tsx' 

function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/studio" element={<StudioPage />} />
    </Routes>
  )
}

export default App

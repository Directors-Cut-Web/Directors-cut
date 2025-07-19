import { Route, Routes } from 'react-router-dom'
import IndexPage from './pages/Index' // Or whatever you named your homepage component
import StudioPage from './pages/StudioPage' // Or whatever you named your studio page component

function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/studio" element={<StudioPage />} />
      {/* Add other routes for /about, /guides, etc. here */}
    </Routes>
  )
}

export default App
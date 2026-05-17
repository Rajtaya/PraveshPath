import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProfileWizard from './pages/ProfileWizard'
import Results from './pages/Results'
import Browse from './pages/Browse'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<ProfileWizard />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/browse" element={<Browse />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileWizard from './pages/ProfileWizard'
import Results from './pages/Results'
import Browse from './pages/Browse'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/browse" element={<Browse />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfileWizard />} />
              <Route path="/results" element={<Results />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App

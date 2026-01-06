import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom'
import Login from './components/Login'
import ProfileSetup from './components/ProfileSetup'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import Recommendations from './components/Recommendations'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) {
      navigate('/login')
    }
  }, [userId, navigate])

  if (!userId) {
    return null
  }

  return <>{children}</>
}

function App() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    setUserId(storedUserId)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setUserId(null)
  }

  return (
    <Router>
      <div className="App">
        {userId && (
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/dashboard" className="logo">
                <h1>SkillBridge</h1>
              </Link>
              <div className="nav-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/recommendations">Recommendations</Link>
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </nav>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profile/setup" element={<ProfileSetup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard userId={parseInt(userId || '1')} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Recommendations userId={parseInt(userId || '1')} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile userId={parseInt(userId || '1')} />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App


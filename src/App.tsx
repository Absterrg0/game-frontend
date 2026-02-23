import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import UserInformation from './pages/UserInformation'
import AuthCallback from './pages/AuthCallback'
import Profile from './pages/Profile'
import { useAuth } from './hooks/useAuth'

function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, isProfileComplete, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (!isProfileComplete) {
      navigate('/information', { replace: true })
      return
    }
    navigate('/profile', { replace: true })
  }, [loading, isAuthenticated, isProfileComplete, navigate])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return null
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/information" element={<UserInformation />} />
    </Routes>
  )
}

export default App

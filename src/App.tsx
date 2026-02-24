import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import UserInformation from './pages/UserInformation'
import AuthCallback from './pages/AuthCallback'
import Profile from './pages/Profile'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function Home() {
  const { isAuthenticated, isProfileComplete, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isProfileComplete) return <Navigate to="/information" replace />
  return <Navigate to="/profile" replace />
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/information" element={<UserInformation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App

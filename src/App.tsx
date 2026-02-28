import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { Toaster } from '@/components/ui/sonner'
import { MainLayout } from '@/layouts/MainLayout'

const Login = lazy(() => import('./pages/Login'))
const UserInformation = lazy(() => import('./pages/UserInformation'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const Settings = lazy(() => import('./pages/settings-page'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))

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
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<MainLayout />}>
            <Route path="/information" element={<UserInformation />} />
            <Route path="/profile" element={<Settings />} />
            <Route path="/tournaments" element={<PlaceholderPage />} />
            <Route path="/my-score" element={<PlaceholderPage />} />
            <Route path="/record-score" element={<PlaceholderPage />} />
            <Route path="/clubs" element={<PlaceholderPage />} />
            <Route path="/sponsors" element={<PlaceholderPage />} />
            <Route path="/about" element={<PlaceholderPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </AuthProvider>
  )
}

export default App

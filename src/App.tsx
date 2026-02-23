import { Link, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Login from './pages/Login'
import UserInformation from './pages/UserInformation'
import AuthCallback from './pages/AuthCallback'
import { useAuth } from './hooks/useAuth'

function Home() {
  const { t } = useTranslation()
  const { isAuthenticated, loading, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{t('common.welcome')}</h1>
      <div className="flex gap-4">
        {!loading && (
          isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-md border border-red-500 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              {t('common.logout')}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md bg-brand-primary px-4 py-2 text-white hover:opacity-90"
              >
                {t('common.login')}
              </Link>
              <Link
                to="/signup"
                className="rounded-md border border-brand-primary px-4 py-2 text-brand-primary hover:bg-brand-primary/10"
              >
                {t('common.signUp')}
              </Link>
            </>
          )
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/information" element={<UserInformation />} />
    </Routes>
  )
}

export default App

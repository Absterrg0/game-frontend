import { Link, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Login from './pages/Login'
import UserInformation from './pages/UserInformation'
import './App.css'

function Home() {
  const { t, i18n } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          onClick={() => i18n.changeLanguage('en')}
          className={`rounded px-3 py-1 text-sm ${i18n.language === 'en' ? 'bg-brand-primary text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => i18n.changeLanguage('de')}
          className={`rounded px-3 py-1 text-sm ${i18n.language === 'de' ? 'bg-brand-primary text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
        >
          DE
        </button>
      </div>
      <h1 className="text-2xl font-bold">{t('common.welcome')}</h1>
      <div className="flex gap-4">
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
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/information" element={<UserInformation />} />
    </Routes>
  )
}

export default App

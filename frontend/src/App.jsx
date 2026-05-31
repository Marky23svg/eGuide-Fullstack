import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import Login from './Pages/login'
import TermsOfService from './Pages/TermsOfService'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import Homepage from './Pages/Homepage'
import Documents from './Pages/Documents'
import Announcements from './Pages/Announcements'
import NotFound from './Pages/NotFound'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminAnnouncements from './Pages/Admin/AdminAnnouncements'
import AdminDocuments from './Pages/Admin/AdminDocuments'
import SessionExpiredModal from './components/SessionExpiredModal'

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000

function useSessionTimeout() {
  const navigate = useNavigate()
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionExpired, setSessionExpired] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setSessionExpired(true)
  }, [])

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  const handleDismiss = useCallback(() => {
    setSessionExpired(false)
    navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => window.addEventListener(event, resetTimer))

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        logout()
      }
    }, 60000)

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer))
      clearInterval(interval)
    }
  }, [lastActivity, logout, resetTimer])

  return { sessionExpired, handleDismiss }
}

function SessionManager({ children }) {
  const { sessionExpired, handleDismiss } = useSessionTimeout()
  return (
    <>
      {children}
      {sessionExpired && <SessionExpiredModal onDismiss={handleDismiss} />}
    </>
  )
}

// Admin only route
function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token) return <Navigate to="/" replace />
  if (user.role !== 'admin') return <Navigate to="/home" replace />
  return children
}

// Student only route
function StudentRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token) return <Navigate to="/" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

// Public route — redirects already-logged-in users to their dashboard
function PublicRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!token) return children
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <SessionManager>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Student */}
          <Route path="/home" element={<StudentRoute><Homepage /></StudentRoute>} />
          <Route path="/requirements" element={<StudentRoute><Documents /></StudentRoute>} />
          <Route path="/announcements" element={<StudentRoute><Announcements /></StudentRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
          <Route path="/admin/requirements" element={<AdminRoute><AdminDocuments /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionManager>
    </BrowserRouter>
  )
}

export default App

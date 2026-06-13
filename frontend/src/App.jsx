import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback, Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#fff' }}>
          <h2 style={{ color: 'red' }}>Runtime Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#666', fontSize: 12 }}>{this.state.error?.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
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
import { getToken, getUser, clearAuth } from './utils/authStorage'

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000

function useSessionTimeout() {
  const navigate = useNavigate()
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionExpired, setSessionExpired] = useState(false)

  const logout = useCallback(() => {
    clearAuth()
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
    const token = getToken()
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
function AdminRoute({ children }) {
  const token = getToken()
  const user = getUser()
  if (!token) return <Navigate to="/" replace />
  if (user.role !== 'admin') return <Navigate to="/home" replace />
  return <>{children}</>
}

function StudentRoute({ children }) {
  const token = getToken()
  const user = getUser()
  if (!token) return <Navigate to="/" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <>{children}</>
}

// Public route — redirects already-logged-in users to their dashboard
function PublicRoute({ children }) {
  const token = getToken()
  const user = getUser()
  if (!token) return <>{children}</>
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App

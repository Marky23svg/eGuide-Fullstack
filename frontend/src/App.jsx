import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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

// Simple protected route component
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" replace />
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

// Simple public route component (redirects if already logged in)
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
      <ScrollToTop />
      <Routes>
        {/* Public routes - redirect to home if already logged in */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        {/* Protected routes - require login */}
        <Route path="/home" element={
          <StudentRoute>
            <Homepage />
          </StudentRoute>
        } />
        <Route path="/requirements" element={
          <StudentRoute>
            <Documents />
          </StudentRoute>
        } />
        <Route path="/announcements" element={
          <StudentRoute>
            <Announcements />
          </StudentRoute>
        } />
        
        {/* Admin routes - admin only */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/announcements" element={
          <AdminRoute>
            <AdminAnnouncements />
          </AdminRoute>
        } />
        <Route path="/admin/requirements" element={
          <AdminRoute>
            <AdminDocuments />
          </AdminRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
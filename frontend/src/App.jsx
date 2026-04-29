import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/login'
import TermsOfService from './Pages/TermsOfService'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import Homepage from './Pages/Homepage'
import Requirements from './Pages/Requirements'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminAnnouncements from './Pages/Admin/AdminAnnouncements'
import AdminRequirements from './Pages/Admin/AdminRequirements'

// Simple protected route component
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" replace />
}

// Simple public route component (redirects if already logged in)
function PublicRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/home" replace /> : children
}

function App() {
  return (
    <BrowserRouter>
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
          <PrivateRoute>
            <Homepage />
          </PrivateRoute>
        } />
        <Route path="/requirements" element={
          <PrivateRoute>
            <Requirements />
          </PrivateRoute>
        } />
        
        {/* Admin routes - protected */}
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/announcements" element={
          <PrivateRoute>
            <AdminAnnouncements />
          </PrivateRoute>
        } />
        <Route path="/admin/requirements" element={
          <PrivateRoute>
            <AdminRequirements />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
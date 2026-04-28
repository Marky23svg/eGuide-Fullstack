import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/login'
import TermsOfService from './Pages/TermsOfService'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import Homepage from './Pages/Homepage'
import Requirements from './Pages/Requirements'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminAnnouncements from './Pages/Admin/AdminAnnouncements'
import AdminRequirements from './Pages/Admin/AdminRequirements'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/requirements" element={<AdminRequirements />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

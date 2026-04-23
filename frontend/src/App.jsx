import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Pages/login'
import TermsOfService from './Pages/TermsOfService'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import Homepage from './Pages/Homepage'
import Requirements from './Pages/Requirements'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

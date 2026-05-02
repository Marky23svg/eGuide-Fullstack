import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <p className="text-8xl font-black text-blue-600 mb-2">404</p>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">The page you're looking for doesn't exist or has been moved.</p>
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
      >
        ← Go Back
      </button>
    </div>
  )
}

export default NotFound

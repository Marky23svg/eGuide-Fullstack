import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { FaBullhorn, FaClipboardList, FaUsers } from 'react-icons/fa'
import API from '../../services/api'

function AdminDashboard() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ announcements: '...', requirements: '...', students: '...' })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [ann, req, users] = await Promise.all([
          API.get('/announcements'),
          API.get('/requirements'),
          API.get('/users/students'),
        ])
        setCounts({
          announcements: ann.count,
          requirements: req.count,
          students: users.count,
        })
      } catch {
        setCounts({ announcements: '—', requirements: '—', students: '—' })
      }
    }
    fetchCounts()
  }, [])

  const stats = [
    { label: 'Total Announcements', value: counts.announcements, icon: <FaBullhorn />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Requirements', value: counts.requirements, icon: <FaClipboardList />, color: 'bg-green-50 text-green-600' },
    { label: 'Total Students', value: counts.students, icon: <FaUsers />, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <AdminLayout activePage="Dashboard">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/announcements')} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            + New Announcement
          </button>
          <button onClick={() => navigate('/admin/requirements')} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition">
            + New Requirement
          </button>
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminDashboard

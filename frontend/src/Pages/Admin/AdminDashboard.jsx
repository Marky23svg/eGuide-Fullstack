import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { FaBullhorn, FaClipboardList, FaUsers } from 'react-icons/fa'
import { MdAccessTime, MdCheckCircle, MdAdd } from 'react-icons/md'
import API from '../../services/api'

function AdminDashboard() {
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ announcements: '...', requirements: '...', students: '...' })
  const [recentAnnouncements, setRecentAnnouncements] = useState([])
  const [recentDocs, setRecentDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ann, req, users] = await Promise.all([
          API.get('/announcements'),
          API.get('/requirements'),
          API.get('/users/students'),
        ])
        setCounts({
          announcements: ann.count ?? ann.data?.length ?? '—',
          requirements: req.total ?? req.count ?? req.data?.length ?? '—',
          students: users.count ?? '—',
        })
        setRecentAnnouncements((ann.data || []).slice(0, 3))
        setRecentDocs((req.data || []).slice(0, 3))
      } catch {
        setCounts({ announcements: '—', requirements: '—', students: '—' })
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const stats = [
    { label: 'Announcements', value: counts.announcements, icon: <FaBullhorn />, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: 'Documents', value: counts.requirements, icon: <FaClipboardList />, color: 'bg-green-50 text-green-600', border: 'border-green-100' },
    { label: 'Students', value: counts.students, icon: <FaUsers />, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  ]

  return (
    <AdminLayout activePage="Dashboard">

      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-gray-800">Welcome back, Admin</h2>
        <p className="text-sm text-gray-400 mt-0.5">Here's what's happening in your system today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-400">Total {stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MdAdd className="text-blue-600" size={18} />
          <h2 className="text-sm font-bold text-gray-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/admin/announcements')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            <FaBullhorn size={14} /> New Announcement
          </button>
          <button
            onClick={() => navigate('/admin/requirements')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition"
          >
            <FaClipboardList size={14} /> New Document
          </button>
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MdAccessTime className="text-blue-500" size={16} />
              <h2 className="text-sm font-bold text-gray-800">Recent Announcements</h2>
            </div>
            <button
              onClick={() => navigate('/admin/announcements')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <p className="text-xs text-gray-400 py-4 text-center">Loading...</p>
          ) : recentAnnouncements.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-gray-300 mb-3">No announcements yet</p>
              <button
                onClick={() => navigate('/admin/announcements')}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition"
              >
                + Add one now
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentAnnouncements.map(item => (
                <div key={item._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-sm"><FaBullhorn className='text-blue-600' size={11} /> </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(item.date_posted).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MdCheckCircle className="text-green-500" size={16} />
              <h2 className="text-sm font-bold text-gray-800">Recent Documents</h2>
            </div>
            <button
              onClick={() => navigate('/admin/requirements')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View all
            </button>
          </div>
          {loading ? (
            <p className="text-xs text-gray-400 py-4 text-center">Loading...</p>
          ) : recentDocs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-gray-300 mb-3">No documents yet</p>
              <button
                onClick={() => navigate('/admin/requirements')}
                className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg font-semibold hover:bg-green-100 transition"
              >
                + Add one now
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentDocs.map(item => (
                <div key={item._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50/50 transition">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 text-sm"> <FaClipboardList className='text-green-600' size={11} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(item.date_posted).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </AdminLayout>
  )
}

export default AdminDashboard

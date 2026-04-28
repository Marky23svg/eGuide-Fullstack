import AdminLayout from './AdminLayout'
import { FaBullhorn, FaClipboardList, FaUsers, FaEnvelope } from 'react-icons/fa'

function AdminDashboard() {
  const stats = [
    { label: 'Total Announcements', value: '4', icon: <FaBullhorn />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Requirements', value: '12', icon: <FaClipboardList />, color: 'bg-green-50 text-green-600' },
    { label: 'Total Students', value: '—', icon: <FaUsers />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Emails', value: '—', icon: <FaEnvelope />, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <AdminLayout activePage="Dashboard">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
          <a href="/admin/announcements" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            + New Announcement
          </a>
          <a href="/admin/requirements" className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition">
            + New Requirement
          </a>
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminDashboard

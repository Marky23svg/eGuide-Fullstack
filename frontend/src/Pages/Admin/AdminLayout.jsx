import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import icctLogo from '../../assets/Icctlogo.webp'
import {
  MdDashboard, MdCampaign, MdChecklist,
  MdChevronLeft, MdChevronRight,
  MdLogout, MdMenu, MdClose,
} from 'react-icons/md'

const NAV_ITEMS = [
  { label: 'Dashboard',      icon: MdDashboard,  path: '/admin' },
  { label: 'Announcements',  icon: MdCampaign,   path: '/admin/announcements' },
  { label: 'Documents',   icon: MdChecklist,  path: '/admin/requirements' },
]

function AdminLayout({ children, activePage }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed md:relative z-50 md:z-auto h-full bg-gray-900 flex flex-col shrink-0',
          'transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <img src={icctLogo} alt="ICCT" className="w-8 h-8 rounded-full shrink-0" />
          {sidebarOpen && (
            <div className="flex flex-col leading-none">
              <span
                className="text-white text-sm font-black tracking-widest"
                style={{ fontFamily: 'Impact, sans-serif' }}
              >
                ICCT
              </span>
              <span
                className="text-white/40 text-xs tracking-widest uppercase"
                style={{ fontFamily: 'Impact, sans-serif' }}
              >
                Admin
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              onClick={() => { navigate(path); closeMobile() }}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                activePage === label
                  ? 'bg-blue-600 text-white'
                  : 'text-white/50 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-white/10 flex flex-col gap-1">
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <MdLogout size={18} className="shrink-0" />
            {sidebarOpen && <span>Log Out</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/10 transition"
          >
            {sidebarOpen
              ? <MdChevronLeft size={18} className="shrink-0" />
              : <MdChevronRight size={18} className="shrink-0" />
            }
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-500 hover:text-gray-800 transition"
              onClick={() => setMobileOpen(true)}
            >
              <MdMenu size={22} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">{activePage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <p className="text-sm font-semibold text-gray-800">Admin</p>
              <p className="text-xs text-gray-400">admin@icct.edu.ph</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>

      </div>
    </div>
  )
}

export default AdminLayout

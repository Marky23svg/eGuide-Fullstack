import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import API from '../services/api'
import { MdSearch, MdSort } from 'react-icons/md'
import announcementBg from '../assets/announcementpage_bg.webp'

function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    API.get('/announcements')
      .then(res => setAnnouncements(Array.isArray(res) ? res : res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = announcements
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.date_posted) - new Date(a.date_posted)
      if (sort === 'oldest') return new Date(a.date_posted) - new Date(b.date_posted)
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'za') return b.title.localeCompare(a.title)
      return 0
    })

  // Resolve all action buttons for an announcement (supports both new actionButtons[] and legacy actionButton)
  const resolveButtons = (item) => {
    if (Array.isArray(item.actionButtons) && item.actionButtons.length > 0) return item.actionButtons
    if (item.actionButton?.label) return [{ ...item.actionButton, type: 'url' }]
    return []
  }

  const handleButton = (btn) => {
    if (btn.type === 'document' || btn.documentId) {
      // Close modal and navigate to documents page with highlight
      setSelected(null)
      navigate(`/requirements?highlight=${btn.documentId}`, { state: { highlightId: btn.documentId } })
    } else if (btn.url) {
      window.open(btn.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div data-nav="dark" className="relative pt-24 pb-10 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${announcementBg})` }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">eGuide ICCT</p>
          <h1 className="text-4xl font-black text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>Announcements</h1>
          <p className="text-white/100 text-sm mt-2">Stay updated with the latest news and announcements.</p>
        </div>
      </div>

      <div data-nav="light" className="max-w-6xl mx-auto px-8 pt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
        </div>
        <div className="relative">
          <MdSort className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select value={sort} onChange={e => setSort(e.target.value)} className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">{search ? `No announcements found for "${search}"` : 'No announcements yet.'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map(item => {
              const buttons = resolveButtons(item)
              return (
                <div key={item._id} onClick={() => setSelected(item)} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer">
                  {item.image ? <img src={item.image} alt={item.title} className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><span className="text-4xl">📢</span></div>}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    {item.category && <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{item.category}</span>}
                    <h3 className="text-sm font-black text-gray-800 leading-snug">{item.title}</h3>
                    <p className="text-xs text-gray-400">{new Date(item.date_posted).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.description || item.content}</p>
                    <div className="mt-auto pt-3">
                      <span className="text-xs font-bold text-blue-600 hover:underline">Read More →</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="relative shrink-0">
              {selected.image ? (
                <img src={selected.image} alt={selected.title} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center"><span className="text-5xl">📢</span></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-10 pointer-events-none">
                {selected.category && <span className="text-xs font-bold uppercase tracking-widest text-blue-300">{selected.category}</span>}
                <h3 className="text-xl font-black text-white leading-tight mt-1">{selected.title}</h3>
                <p className="text-white/50 text-xs mt-1">
                  {selected.date ? new Date(selected.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(selected.date_posted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {selected.image && (
                <button onClick={e => { e.stopPropagation(); setLightbox(selected.image) }} className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white text-xs font-semibold rounded-lg transition">⛶</button>
              )}
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm transition">✕</button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-5 p-6">
              {selected.description && <p className="text-gray-600 text-sm leading-relaxed">{selected.description}</p>}
              {selected.fullDetails && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Full Details</p>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selected.fullDetails}</p>
                </div>
              )}
              {!selected.description && !selected.fullDetails && selected.content && <p className="text-gray-600 text-sm leading-relaxed">{selected.content}</p>}

              {Array.isArray(selected.requirements) && selected.requirements.filter(r => r?.trim()).length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Requirements</p>
                    <ul className="flex flex-col gap-2">
                      {selected.requirements.filter(r => r?.trim()).map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />{req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* All action buttons */}
              {resolveButtons(selected).filter(b => b.label).length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="flex flex-col gap-2">
                    {resolveButtons(selected).filter(b => b.label).map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleButton(btn)}
                        className={`flex items-center justify-center gap-2 w-full py-3 text-sm font-bold rounded-xl transition ${btn.type === 'document' || btn.documentId ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        {btn.type === 'document' || btn.documentId ? '📄' : '🔗'} {btn.label} →
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/95" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size" className="max-w-full max-h-full object-contain p-4" />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center text-sm transition">✕</button>
        </div>
      )}
    </div>
  )
}

export default Announcements
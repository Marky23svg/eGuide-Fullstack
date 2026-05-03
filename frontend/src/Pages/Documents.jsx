import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DocumentCard from '../components/DocumentCard'
import requirementBg from '../assets/Requirement_bg.webp'
import API from '../services/api'
import { MdSearch, MdSort } from 'react-icons/md'

function Documents() {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    API.get('/requirements')
      .then(res => setRequirements(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = requirements
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.date_posted) - new Date(a.date_posted)
      if (sort === 'oldest') return new Date(a.date_posted) - new Date(b.date_posted)
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'za') return b.title.localeCompare(a.title)
      return 0
    })

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Header */}
      <div data-nav="dark" className="relative border-b border-gray-100 pt-24 pb-10 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${requirementBg})` }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">eGuide ICCT</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
            Documents
          </h1>
          <p className="text-white/50 text-sm mt-2">Track and manage your documents in one place.</p>
        </div>
      </div>

      {/* Search + Sort */}
      <div data-nav="light" className="max-w-6xl mx-auto px-8 pt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="relative">
          <MdSort className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            {search ? `No documents found for "${search}"` : 'No documents yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <DocumentCard
                key={item._id}
                title={item.title}
                requirements={item.requirements.split('\n').filter(s => s.trim())}
                steps={item.procedure.split('\n').filter(s => s.trim())}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Documents
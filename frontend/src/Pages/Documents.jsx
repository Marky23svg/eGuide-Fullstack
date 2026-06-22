import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DocumentCard from '../components/DocumentCard'
import requirementBg from '../assets/Requirement_bg.webp'
import API from '../services/api'
import { saved as savedApi } from '../services/api'
import { MdSearch, MdSort } from 'react-icons/md'
import { getUser } from '../utils/authStorage'

function Documents() {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [progressMap, setProgressMap] = useState({})
  const [serverProgress, setServerProgress] = useState({}) // requirementId → progress object
  const [highlightId, setHighlightId] = useState(null)
  const [highlightMessage, setHighlightMessage] = useState('')

  const getUserId = () => {
    const parsed = getUser()
    return parsed?.id || parsed?._id || null
  }
  const makeProgressKey = (title) => `doc_progress_${getUserId() || 'anon'}_${title}`

  const [searchParams] = useSearchParams()
  const location = useLocation()
  const cardRefs = useRef({})

  useEffect(() => {
    Promise.all([
      API.get('/requirements?limit=100'),
      savedApi.getAll().catch(() => ({ data: [] })), // graceful fallback if not logged in
    ]).then(([reqRes, savedRes]) => {
      const requirementsList = reqRes.data || reqRes || []
      setRequirements(requirementsList)

      // Build a map of requirementId → saved progress from the server
      const progMap = {}
      const savedList = savedRes.data || savedRes || []
      savedList.forEach(item => {
        const rid = item.requirement_id?._id || item.requirement_id
        if (rid && item.progress) progMap[rid.toString()] = item.progress
      })
      setServerProgress(progMap)

      // Seed progressMap for sorting (prefer server progress, fall back to localStorage)
      const map = {}
      requirementsList.forEach(item => {
        const serverProg = progMap[item._id]
        if (serverProg) {
          const stepLen = serverProg.steps?.length || 1
          map[item.title] = serverProg.steps?.filter(Boolean).length / stepLen
        } else {
          const steps = (item.procedure || '').split('\n').filter(s => s.trim())
          const ls = localStorage.getItem(makeProgressKey(item.title))
          if (ls && steps.length) {
            const { steps: s } = JSON.parse(ls)
            map[item.title] = s ? s.filter(Boolean).length / steps.length : 0
          } else {
            map[item.title] = 0
          }
        }
      })
      setProgressMap(map)
    })
    .catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  // After data loads, scroll to + highlight the card specified in ?highlight=<id>
  useEffect(() => {
    const queryId = searchParams.get('highlight')
    const stateId = location.state?.highlightId
    const id = queryId || stateId
    if (!id || loading) return

    setHighlightId(id)
    setHighlightMessage('Opened document from the chatbot')

    // Small delay to let the grid render
    const timer = setTimeout(() => {
      const el = cardRefs.current[id]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Remove highlight ring after 3s
      const clearTimer = setTimeout(() => setHighlightId(null), 3000)
      return () => clearTimeout(clearTimer)
    }, 200)

    const messageTimer = setTimeout(() => setHighlightMessage(''), 3000)

    return () => {
      clearTimeout(timer)
      clearTimeout(messageTimer)
    }
  }, [loading, searchParams, location.state])

  const handleProgressChange = (title, ratio) => {
    setProgressMap(prev => ({ ...prev, [title]: ratio }))
  }

  const getScore = (item) => {
    const saved = localStorage.getItem(makeProgressKey(item.title))
    if (!saved) return progressMap[item.title] ?? 0
    const { steps: s, reqs: r } = JSON.parse(saved)
    const stepLen = (item.procedure || '').split('\n').filter(x => x.trim()).length
    const reqLen = (item.requirements || '').split('\n').filter(x => x.trim()).length
    const stepRatio = s && stepLen ? s.filter(Boolean).length / stepLen : 0
    const reqRatio = r && reqLen ? r.filter(Boolean).length / reqLen : 0
    return stepRatio + reqRatio * 0.01
  }

  const filtered = requirements
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const scoreDiff = getScore(b) - getScore(a)
      if (scoreDiff !== 0) return scoreDiff
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
      <div data-nav="dark" className="relative pt-24 pb-10 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${requirementBg})` }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">eGuide ICCT</p>
          <h1 className="text-4xl font-black text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
            Documents
          </h1>
          <p className="text-white/100 text-sm mt-2 text-shadow-lg/30">Track and manage your documents in one place.</p>
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

      {highlightMessage && (
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm shadow-sm">
            {highlightMessage}
          </div>
        </div>
      )}

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
              <div
                key={item._id}
                ref={el => { cardRefs.current[item._id] = el }}
                className={`rounded-2xl transition-all duration-300 ${
                  highlightId === item._id
                    ? 'ring-4 ring-blue-500 ring-offset-2 shadow-[0_0_24px_rgba(26,115,232,0.4)]'
                    : ''
                }`}
              >
                <DocumentCard
                  key={item._id}
                  requirementId={item._id}
                  title={item.title}
                  description={item.description || ''}
                  requirements={item.requirements.split('\n').filter(s => s.trim())}
                  steps={item.procedure.split('\n').filter(s => s.trim())}
                  initialProgress={serverProgress[item._id] || null}
                  onProgressChange={handleProgressChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Documents
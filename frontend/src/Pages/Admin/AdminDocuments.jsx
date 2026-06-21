import { useState, useEffect, useCallback, useRef } from 'react'
import AdminLayout from './AdminLayout'
import { MdClose, MdEdit, MdVisibility, MdAdd, MdSearch, MdDragIndicator, MdWarning, MdArticle, MdSwapVert, MdNotes, MdFormatListNumbered, MdRefresh, MdCheckCircle } from 'react-icons/md'
import API from '../../services/api'

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

const itemsToString = (items) => items.map(i =>
  i.type === 'note' ? `[note:${i.severity || 'normal'}] ${i.text}` : i.text
).join('\n')

const stringToItems = (str) =>
  str.split('\n').filter(s => s.trim()).map((text, id) => {
    const m = text.match(/^\[note:(strict|moderate|normal|plain)\] (.*)/)
    if (m) return { id: Date.now() + id, text: m[2], type: 'note', severity: m[1] }
    if (text.startsWith('[note] ')) return { id: Date.now() + id, text: text.slice(7), type: 'note', severity: 'normal' }
    return { id: Date.now() + id, text, type: 'item' }
  })

const NOTE_STYLES = {
  strict:   { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-600',    label: 'Strict' },
  moderate: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600', label: 'Moderate' },
  normal:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-600',   label: 'Normal' },
  plain:    { bg: '',             border: '',                   text: 'text-gray-600',   label: 'Plain' },
}

// ── Draggable Item List ───────────────────────────────────────────────────────

function ItemList({ items, onChange }) {
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleDragStart = (e, index) => {
    dragItem.current = index
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragEnter = (_, index) => { dragOverItem.current = index }
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    const copy = [...items]
    const dragged = copy.splice(dragItem.current, 1)[0]
    copy.splice(dragOverItem.current, 0, dragged)
    dragItem.current = null
    dragOverItem.current = null
    onChange(copy)
  }

  const remove = (id) => onChange(items.filter(i => i.id !== id))
  const update = (id, field, value) => onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  const toggleType = (id) => onChange(items.map(i => i.id === id
    ? { ...i, type: i.type === 'note' ? 'item' : 'note', severity: i.severity || 'normal' } : i))

  let docCounter = 0

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => {
        if (item.type === 'item') docCounter++
        const num = docCounter
        const ns = item.type === 'note' ? NOTE_STYLES[item.severity || 'normal'] : null
        const isPlain = item.type === 'note' && item.severity === 'plain'
        return (
          <div
            key={item.id}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(null, index)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            className={`rounded-xl p-2 flex flex-col gap-1.5 group cursor-grab active:cursor-grabbing ${
              ns && !isPlain ? `border ${ns.bg} ${ns.border}` : 'border border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <MdDragIndicator size={16} className="text-gray-300 shrink-0 group-hover:text-gray-400 transition" />
              <span className={`text-sm shrink-0 w-4 text-right font-bold ${ns ? ns.text : 'text-gray-400'}`}>
                {item.type === 'note' ? '•' : `${num}.`}
              </span>
              <input
                type="text"
                value={item.text}
                onChange={e => update(item.id, 'text', e.target.value)}
                className={`flex-1 text-sm px-2 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  ns && !isPlain ? `${ns.bg} ${ns.border} ${ns.text} font-bold` : 'border-gray-200 text-gray-700'
                }`}
              />
              <button
                onClick={() => toggleType(item.id)}
                title={item.type === 'note' ? 'Switch to item' : 'Switch to note'}
                className="shrink-0 text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition"
              >
                {item.type === 'note' ? <MdFormatListNumbered size={14} /> : <MdNotes size={14} />}
              </button>
              <button onClick={() => remove(item.id)} className="shrink-0 text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                <MdClose size={14} />
              </button>
            </div>
            {item.type === 'note' && (
              <div className="flex gap-1.5 pl-8">
                {Object.entries(NOTE_STYLES).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => update(item.id, 'severity', key)}
                    className={`text-xs px-2 py-0.5 rounded-lg border transition font-medium ${
                      (item.severity || 'normal') === key
                        ? `${s.bg} ${s.border} ${s.text}`
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Add Item Row ──────────────────────────────────────────────────────────────

function AddItemRow({ onAdd, typeLabel, noteLabel }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState(null)

  const commit = () => {
    if (!text.trim()) return
    onAdd({ text: text.trim(), type })
    setText(''); setType(null); setOpen(false)
  }
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit() } }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition w-full justify-center">
      <MdAdd size={15} /> Add +
    </button>
  )
  if (!type) return (
    <div className="flex gap-2">
      <button onClick={() => setType('note')} className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition flex items-center justify-center gap-1.5"><MdNotes size={13} /> Note</button>
      <button onClick={() => setType('item')} className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition flex items-center justify-center gap-1.5">
        {typeLabel === 'document' ? <MdArticle size={13} /> : <MdFormatListNumbered size={13} />}
        {typeLabel === 'document' ? ' Document' : ' Step'}
      </button>
      <button onClick={() => setOpen(false)} className="px-2 text-gray-400 hover:text-gray-600 transition"><MdClose size={16} /></button>
    </div>
  )
  return (
    <div className="flex gap-2 items-start">
      <span className="mt-2.5 text-xs shrink-0">{type === 'note' ? '•' : '#'}</span>
      <input
        autoFocus type="text" value={text}
        onChange={e => setText(e.target.value)} onKeyDown={handleKey}
        placeholder={type === 'note' ? noteLabel : typeLabel === 'document' ? 'e.g. Transcript of Records' : 'e.g. Go to the registrar'}
        className={`${inputCls} flex-1`}
      />
      <button onClick={commit} className="shrink-0 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition">Add</button>
      <button onClick={() => { setType(null); setText('') }} className="shrink-0 mt-2 text-gray-400 hover:text-gray-600 transition"><MdClose size={16} /></button>
    </div>
  )
}

// ── Preview ───────────────────────────────────────────────────────────────────

function PreviewPanel({ title, description, docItems, procItems }) {
  const [checked, setChecked] = useState({})
  const toggle = (key) => setChecked(p => ({ ...p, [key]: !p[key] }))
  let docNum = 0, procNum = 0

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">This is how the document will appear to students.</p>
      <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 pt-6 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Documents</p>
          <h3 className="text-lg font-black text-gray-800">{title || <span className="text-gray-300">No title</span>}</h3>
          {description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>}
        </div>
        <div className="px-6 py-5 flex flex-col gap-6">
          {docItems.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What you need</p>
              <ul className="flex flex-col gap-2">
                {docItems.map((item, i) => {
                  if (item.type === 'note') {
                    const ns = NOTE_STYLES[item.severity || 'normal']
                    return <li key={i} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${item.severity === 'plain' ? 'bg-gray-50 border-transparent' : `${ns.bg} ${ns.border}`}`}>
                      <div className={`shrink-0 w-2 h-2 rounded-full ${item.severity === 'plain' ? 'bg-gray-400' : ns.text.replace('text-','bg-')}`} />
                      <p className={`text-sm font-bold ${ns.text}`}>{item.text}</p>
                    </li>
                  }
                  docNum++
                  const key = `doc-${i}`
                  return <li key={i} className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all ${checked[key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}>
                    <div className="flex items-center gap-3 flex-1"><span className="text-xs font-bold text-gray-400">{docNum}.</span><p className={`text-sm ${checked[key] ? 'line-through text-gray-300' : 'text-gray-600'}`}>{item.text}</p></div>
                    <button onClick={() => toggle(key)} className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition ${checked[key] ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-500 shadow-sm'}`}>{checked[key] ? '✓ Done' : 'Mark Done'}</button>
                  </li>
                })}
              </ul>
            </div>
          )}
          {procItems.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Procedure</p>
              <ol className="flex flex-col gap-2">
                {procItems.map((item, i) => {
                  if (item.type === 'note') {
                    const ns = NOTE_STYLES[item.severity || 'normal']
                    return <li key={i} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${item.severity === 'plain' ? 'bg-gray-50 border-transparent' : `${ns.bg} ${ns.border}`}`}>
                      <div className={`shrink-0 mt-1.5 w-2 h-2 rounded-full ${item.severity === 'plain' ? 'bg-gray-400' : ns.text.replace('text-','bg-')}`} />
                      <p className={`text-sm font-bold ${ns.text}`}>{item.text}</p>
                    </li>
                  }
                  procNum++
                  const key = `proc-${i}`
                  return <li key={i} onClick={() => toggle(key)} className={`flex items-start gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${checked[key] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:border-blue-100'}`}>
                    <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${checked[key] ? 'bg-blue-500 border-blue-500' : 'border-gray-200 bg-white'}`}>{checked[key] && <span className="text-white text-xs font-black">✓</span>}</div>
                    <div className="flex items-start gap-2 flex-1"><span className={`shrink-0 text-xs font-black ${checked[key] ? 'text-blue-400' : 'text-gray-400'}`}>{procNum}.</span><p className={`text-sm ${checked[key] ? 'line-through text-gray-300' : 'text-gray-600'}`}>{item.text}</p></div>
                  </li>
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-bold text-gray-800 mb-2">Delete Requirement?</h3>
        <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function AdminDocuments() {
  const [requirements, setRequirements] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [docItems, setDocItems] = useState([])
  const [procItems, setProcItems] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const fetchRequirements = useCallback(async () => {
    try {
      const res = await API.get('/requirements?limit=100')
      setRequirements(Array.isArray(res) ? res : (res.data ?? []))
    } catch { setError('Failed to load requirements') }
  }, [])

  useEffect(() => { fetchRequirements() }, [fetchRequirements])

  const openAdd = () => { setTitle(''); setDescription(''); setDocItems([]); setProcItems([]); setEditingId(null); setError(''); setPreviewMode(false); setShowModal(true) }
  const openEdit = (item) => { setTitle(item.title); setDescription(item.description || ''); setDocItems(stringToItems(item.requirements)); setProcItems(stringToItems(item.procedure)); setEditingId(item._id); setError(''); setPreviewMode(false); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setError('') }
  const addDocItem = (item) => setDocItems(prev => [...prev, { ...item, id: Date.now() }])
  const addProcItem = (item) => setProcItems(prev => [...prev, { ...item, id: Date.now() }])

  const handleSave = async () => {
    if (!title.trim() || docItems.length === 0 || procItems.length === 0) {
      setError('Title, at least one document, and one procedure step are required'); return
    }
    setLoading(true); setError('')
    const payload = { title, description, requirements: itemsToString(docItems), procedure: itemsToString(procItems) }
    try {
      if (editingId) { await API.put(`/requirements/${editingId}`, payload) }
      else { await API.post('/requirements', payload) }
      await fetchRequirements(); closeModal()
    } catch (err) { setError(err.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    try { await API.delete(`/requirements/${id}`); setRequirements(prev => prev.filter(r => r._id !== id)) }
    finally { setDeleteConfirm(null) }
  }

  return (
    <AdminLayout activePage="Documents">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{requirements.length} documents</p>
        <button onClick={openAdd} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition">+ Add Document</button>
      </div>
      <div className="relative mb-4">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
      </div>

      {(() => {
        const filtered = requirements.filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
        return (
          <div className="flex flex-col gap-4">
            {requirements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 text-center text-sm text-gray-300">No documents yet</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 text-center text-sm text-gray-300">No documents found for "{search}"</div>
            ) : filtered.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 truncate">{item.title}</h3>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</p>}
                    <p className="text-xs text-gray-300 mt-0.5">{new Date(item.date_posted).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button onClick={() => openEdit(item)} className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">Edit</button>
                    <button onClick={() => setDeleteConfirm(item._id)} className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 transition">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">{editingId ? 'Edit Document' : 'Add Document'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition"><MdClose size={20} /></button>
            </div>
            <div className="flex border-b border-gray-100">
              {[{ label: 'Edit', icon: MdEdit, active: !previewMode, onClick: () => setPreviewMode(false) },
                { label: 'Preview', icon: MdVisibility, active: previewMode, onClick: () => setPreviewMode(true) }
              ].map(({ label, icon: Icon, active, onClick }) => (
                <button key={label} onClick={onClick} className={['flex items-center gap-1.5 px-6 py-3 text-sm font-semibold border-b-2 transition', active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'].join(' ')}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {!previewMode ? (
              <div className="px-6 py-5 flex flex-col gap-5">
                {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Transcript of Records (TOR)" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description <span className="text-gray-300 font-normal">(shown below title on the card)</span></label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. A consolidated record of a student's academic performance..." rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                    Documents
                    <span className="text-gray-300 font-normal text-xs">— drag <MdDragIndicator size={11} className="inline" /> to reorder</span>
                  </label>
                  <ItemList items={docItems} onChange={setDocItems} />
                  <div className="mt-2"><AddItemRow onAdd={addDocItem} typeLabel="document" noteLabel="e.g. Make sure documents are photocopied" /></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                    Procedure
                    <span className="text-gray-300 font-normal text-xs">— drag <MdDragIndicator size={11} className="inline" /> to reorder</span>
                  </label>
                  <ItemList items={procItems} onChange={setProcItems} />
                  <div className="mt-2"><AddItemRow onAdd={addProcItem} typeLabel="procedure" noteLabel="e.g. Bring original and photocopy" /></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPreviewMode(true)} className="flex-1 py-2.5 border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"><MdVisibility size={16} /> Preview</button>
                  <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-50">{loading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Document'}</button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-5 flex flex-col gap-4">
                <PreviewPanel title={title} description={description} docItems={docItems} procItems={procItems} />
                <div className="flex gap-3">
                  <button onClick={() => setPreviewMode(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"><MdEdit size={16} /> Back to Edit</button>
                  <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-50">{loading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Document'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && <ConfirmModal onConfirm={() => handleDelete(deleteConfirm)} onCancel={() => setDeleteConfirm(null)} />}
    </AdminLayout>
  )
}

export default AdminDocuments
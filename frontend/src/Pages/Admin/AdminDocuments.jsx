import { useState, useEffect, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import { MdClose, MdChevronRight, MdExpandMore, MdEdit, MdVisibility, MdAdd } from 'react-icons/md'
import API from '../../services/api'

// ── helpers ──────────────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

/** Convert structured items array → newline string for backend */
const itemsToString = (items) => items.map(i => i.text).join('\n')

/** Convert newline string → structured items array */
const stringToItems = (str, defaultType) =>
  str.split('\n').filter(s => s.trim()).map((text, id) => ({ id, text, type: defaultType }))

// ── AddItemRow ────────────────────────────────────────────────────────────────

function AddItemRow({ onAdd, typeLabel, noteLabel }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState(null)

  const commit = () => {
    if (!text.trim()) return
    onAdd({ text: text.trim(), type })
    setText('')
    setType(null)
    setOpen(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit() }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition w-full justify-center"
      >
        <MdAdd size={15} /> Add +
      </button>
    )
  }

  if (!type) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setType('note')}
          className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition"
        >
          📝 Note
        </button>
        <button
          onClick={() => setType('item')}
          className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition"
        >
          {typeLabel === 'document' ? '📄' : '🔢'} {typeLabel === 'document' ? 'Document' : 'Procedure'}
        </button>
        <button onClick={() => setOpen(false)} className="px-2 text-gray-400 hover:text-gray-600 transition">
          <MdClose size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-start">
      <span className="mt-2.5 text-xs shrink-0">
        {type === 'note' ? '•' : '#'}
      </span>
      <input
        autoFocus
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={type === 'note' ? noteLabel : typeLabel === 'document' ? 'e.g. Transcript of Records' : 'e.g. Go to the registrar'}
        className={`${inputCls} flex-1`}
      />
      <button
        onClick={commit}
        className="shrink-0 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
      >
        Add
      </button>
      <button onClick={() => { setType(null); setText('') }} className="shrink-0 mt-2 text-gray-400 hover:text-gray-600 transition">
        <MdClose size={16} />
      </button>
    </div>
  )
}

// ── ItemList ──────────────────────────────────────────────────────────────────

function ItemList({ items, onChange }) {
  const remove = (id) => onChange(items.filter(i => i.id !== id))
  const update = (id, text) => onChange(items.map(i => i.id === id ? { ...i, text } : i))

  let docCounter = 0

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => {
        if (item.type === 'item') docCounter++
        const num = docCounter
        return (
          <div key={item.id} className="flex items-center gap-2 group">
            <span className="text-xs text-gray-400 shrink-0 w-4 text-right">
              {item.type === 'note' ? '•' : `${num}.`}
            </span>
            <input
              type="text"
              value={item.text}
              onChange={e => update(item.id, e.target.value)}
              className={`${inputCls} flex-1 py-1.5 ${item.type === 'note' ? 'text-amber-700 bg-amber-50 border-amber-200' : ''}`}
            />
            <button
              onClick={() => remove(item.id)}
              className="shrink-0 text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
            >
              <MdClose size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Preview ───────────────────────────────────────────────────────────────────

function PreviewPanel({ title, docItems, procItems }) {
  const [checked, setChecked] = useState({})
  const toggle = (key) => setChecked(p => ({ ...p, [key]: !p[key] }))

  let docNum = 0
  let procNum = 0

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
        This is how the document will appear to students.
      </p>

      <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Card header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 pt-6 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Documents</p>
          <h3 className="text-lg font-black text-gray-800">{title || <span className="text-gray-300">No title</span>}</h3>
          <div className="mt-3 w-full h-2 bg-white/60 rounded-full overflow-hidden">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-400" />
          </div>
          <p className="text-xs mt-1 font-medium text-blue-400">0 of {procItems.filter(i => i.type === 'item').length} steps done</p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">
          {/* What you need */}
          {docItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">What you need</p>
                <span className="text-xs text-gray-400">0/{docItems.filter(i => i.type === 'item').length} collected</span>
              </div>
              <ul className="flex flex-col gap-2">
                {docItems.map((item, i) => {
                  if (item.type === 'note') {
                    return (
                      <li key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                        <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                        <p className="text-xs text-amber-700">{item.text}</p>
                      </li>
                    )
                  }
                  docNum++
                  const key = `doc-${i}`
                  return (
                    <li
                      key={i}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all ${checked[key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`shrink-0 w-2 h-2 rounded-full ${checked[key] ? 'bg-green-400' : 'bg-blue-400'}`} />
                        <p className={`text-sm truncate ${checked[key] ? 'line-through text-gray-300' : 'text-gray-600'}`}>{item.text}</p>
                      </div>
                      <button
                        onClick={() => toggle(key)}
                        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition ${checked[key] ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500 shadow-sm'}`}
                      >
                        {checked[key] ? '✓ Done' : 'Mark Done'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {docItems.length > 0 && procItems.length > 0 && <div className="border-t border-gray-100" />}

          {/* Procedure */}
          {procItems.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Procedure</p>
              <ol className="flex flex-col gap-2">
                {procItems.map((item, i) => {
                  if (item.type === 'note') {
                    return (
                      <li key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                        <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                        <p className="text-xs text-amber-700">{item.text}</p>
                      </li>
                    )
                  }
                  procNum++
                  const key = `proc-${i}`
                  return (
                    <li
                      key={i}
                      onClick={() => toggle(key)}
                      className={`flex items-start gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer ${checked[key] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent hover:border-blue-100 hover:bg-blue-50/50'}`}
                    >
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${checked[key] ? 'bg-green-500 border-green-500' : 'border-gray-200 bg-white'}`}>
                        {checked[key] && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <div className="flex items-start gap-2 flex-1">
                        <span className={`shrink-0 text-xs font-black ${checked[key] ? 'text-green-400' : 'text-blue-400'}`}>{procNum}.</span>
                        <p className={`text-sm leading-relaxed ${checked[key] ? 'line-through text-gray-300' : 'text-gray-600'}`}>{item.text}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────

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

const EMPTY_ITEMS = []

function AdminDocuments() {
  const [requirements, setRequirements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [docItems, setDocItems] = useState(EMPTY_ITEMS)
  const [procItems, setProcItems] = useState(EMPTY_ITEMS)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const fetchRequirements = useCallback(async () => {
    try {
      const res = await API.get('/requirements')
      setRequirements(res.data)
    } catch {
      setError('Failed to load requirements')
    }
  }, [])

  useEffect(() => { fetchRequirements() }, [fetchRequirements])

  const openAdd = () => {
    setTitle('')
    setDocItems([])
    setProcItems([])
    setEditingId(null)
    setError('')
    setPreviewMode(false)
    setShowModal(true)
  }

  const openEdit = (item) => {
    setTitle(item.title)
    setDocItems(stringToItems(item.requirements, 'item'))
    setProcItems(stringToItems(item.procedure, 'item'))
    setEditingId(item._id)
    setError('')
    setPreviewMode(false)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setError('') }

  const addDocItem = (item) => setDocItems(prev => [...prev, { ...item, id: Date.now() }])
  const addProcItem = (item) => setProcItems(prev => [...prev, { ...item, id: Date.now() }])

  const handleSave = async () => {
    if (!title.trim() || docItems.length === 0 || procItems.length === 0) {
      setError('Title, at least one document, and one procedure step are required')
      return
    }
    setLoading(true)
    setError('')
    const payload = {
      title,
      requirements: itemsToString(docItems),
      procedure: itemsToString(procItems),
    }
    try {
      if (editingId) {
        await API.put(`/requirements/${editingId}`, payload)
      } else {
        await API.post('/requirements', payload)
      }
      await fetchRequirements()
      closeModal()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/requirements/${id}`)
      setRequirements(prev => prev.filter(r => r._id !== id))
    } finally {
      setDeleteConfirm(null)
    }
  }

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  return (
    <AdminLayout activePage="Documents">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{requirements.length} documents</p>
        <button onClick={openAdd} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition">
          + Add Document
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {requirements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 text-center text-sm text-gray-300">
            No documents yet
          </div>
        ) : requirements.map((item) => {
          const isExpanded = expandedId === item._id
          return (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => toggleExpand(item._id)} className="text-gray-400 hover:text-gray-600 transition shrink-0">
                    {isExpanded ? <MdExpandMore size={20} /> : <MdChevronRight size={20} />}
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 truncate">{item.title}</h3>
                    <p className="text-xs text-gray-400">{new Date(item.date_posted).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button onClick={() => openEdit(item)} className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">Edit</button>
                  <button onClick={() => setDeleteConfirm(item._id)} className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 transition">Delete</button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-5 border-t border-gray-50 grid sm:grid-cols-2 gap-6 pt-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Documents</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{item.requirements}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Procedure</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{item.procedure}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">{editingId ? 'Edit Document' : 'Add Document'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition"><MdClose size={20} /></button>
            </div>

            {/* Edit / Preview tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { label: 'Edit', icon: MdEdit, active: !previewMode, onClick: () => setPreviewMode(false) },
                { label: 'Preview', icon: MdVisibility, active: previewMode, onClick: () => setPreviewMode(true) },
              ].map(({ label, icon: Icon, active, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={[
                    'flex items-center gap-1.5 px-6 py-3 text-sm font-semibold border-b-2 transition',
                    active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600',
                  ].join(' ')}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {!previewMode ? (
              <div className="px-6 py-5 flex flex-col gap-5">
                {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Transcript of Records (TOR)"
                    className={inputCls}
                  />
                </div>

                {/* Documents section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Documents</label>
                  <ItemList items={docItems} onChange={setDocItems} />
                  <div className="mt-2">
                    <AddItemRow
                      onAdd={addDocItem}
                      typeLabel="document"
                      noteLabel="e.g. Make sure documents are photocopied"
                    />
                  </div>
                </div>

                {/* Procedure section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Procedure</label>
                  <ItemList items={procItems} onChange={setProcItems} />
                  <div className="mt-2">
                    <AddItemRow
                      onAdd={addProcItem}
                      typeLabel="procedure"
                      noteLabel="e.g. Bring original and photocopy"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewMode(true)}
                    className="flex-1 py-2.5 border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <MdVisibility size={16} /> Preview
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Document'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-5 flex flex-col gap-4">
                <PreviewPanel title={title} docItems={docItems} procItems={procItems} />
                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <MdEdit size={16} /> Back to Edit
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Document'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmModal
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

    </AdminLayout>
  )
}

export default AdminDocuments

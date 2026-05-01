import { useState, useEffect, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import { MdClose, MdChevronRight, MdExpandMore } from 'react-icons/md'
import API from '../../services/api'

const EMPTY_FORM = { title: '', requirements: '', procedure: '' }
const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const textareaCls = `${inputCls} resize-none`

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

function AdminRequirements() {
  const [requirements, setRequirements] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setForm({ title: item.title, requirements: item.requirements, procedure: item.procedure })
    setEditingId(item._id)
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setError('')
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.requirements.trim() || !form.procedure.trim()) {
      setError('All fields are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (editingId) {
        await API.put(`/requirements/${editingId}`, form)
      } else {
        await API.post('/requirements', form)
      }
      await fetchRequirements()
      closeModal()
    } catch (err) {
      setError(err.message || 'Failed to save requirement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/requirements/${id}`)
      setRequirements(prev => prev.filter(r => r._id !== id))
      setDeleteConfirm(null)
    } catch {
      setDeleteConfirm(null)
    }
  }

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  return (
    <AdminLayout activePage="Requirements">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{requirements.length} requirements</p>
        <button onClick={openAdd} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition">
          + Add Requirement
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {requirements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 text-center text-sm text-gray-300">
            No requirements yet
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
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Requirements</p>
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
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">{editingId ? 'Edit Requirement' : 'Add Requirement'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition"><MdClose size={20} /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Transcript of Records (TOR)"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                  placeholder="Describe what this requirement is about..."
                  rows={4}
                  className={textareaCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Procedure</label>
                <textarea
                  value={form.procedure}
                  onChange={e => setForm(f => ({ ...f, procedure: e.target.value }))}
                  placeholder="Step 1: ...&#10;Step 2: ...&#10;Step 3: ..."
                  rows={6}
                  className={textareaCls}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Requirement'}
                </button>
              </div>
            </div>
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

export default AdminRequirements

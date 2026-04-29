import { useState, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import { MdClose, MdChevronRight, MdExpandMore } from 'react-icons/md'

const INITIAL_REQUIREMENTS = []

const EMPTY_FORM = { title: '', requirements: '', steps: '' }

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const textareaCls = `${inputCls} resize-none`

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminRequirements() {
  const [requirements, setRequirements] = useState(INITIAL_REQUIREMENTS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const setField = useCallback((key, value) => {
    setForm(f => ({ ...f, [key]: value }))
  }, [])

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }, [])

  const openEdit = useCallback((item) => {
    setForm({
      title: item.title,
      requirements: item.requirements.join('\n'),
      steps: item.steps.join('\n'),
    })
    setEditingId(item.id)
    setShowModal(true)
  }, [])

  const handleSave = useCallback(() => {
    const item = {
      id: editingId ?? Date.now(),
      title: form.title,
      requirements: form.requirements.split('\n').filter(s => s.trim()),
      steps: form.steps.split('\n').filter(s => s.trim()),
    }
    setRequirements(prev =>
      editingId ? prev.map(r => r.id === editingId ? item : r) : [...prev, item]
    )
    setShowModal(false)
  }, [editingId, form])

  const handleDelete = useCallback((id) => {
    setRequirements(prev => prev.filter(r => r.id !== id))
    setDeleteConfirm(null)
  }, [])

  const toggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  const reqCount = form.requirements.split('\n').filter(s => s.trim()).length
  const stepCount = form.steps.split('\n').filter(s => s.trim()).length

  return (
    <AdminLayout activePage="Requirements">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{requirements.length} requirements</p>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition"
        >
          + Add Requirement
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {requirements.map((item) => {
          const isExpanded = expandedId === item.id
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Row header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-gray-400 hover:text-gray-600 transition shrink-0"
                  >
                    {isExpanded
                      ? <MdExpandMore size={20} />
                      : <MdChevronRight size={20} />
                    }
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 truncate">{item.title}</h3>
                    <p className="text-xs text-gray-400">
                      {item.requirements.length} requirements · {item.steps.length} procedures
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-6 pb-5 border-t border-gray-50 grid sm:grid-cols-2 gap-6 pt-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What you need</p>
                    <ul className="flex flex-col gap-2">
                      {item.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Procedures</p>
                    <ol className="flex flex-col gap-2">
                      {item.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

            </div>
          )
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Requirement' : 'Add Requirement'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <MdClose size={20} />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <FormField label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  placeholder="e.g. Transcript of Records (TOR)"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Requirements (one per line)" hint={`${reqCount} item${reqCount !== 1 ? 's' : ''}`}>
                <textarea
                  value={form.requirements}
                  onChange={e => setField('requirements', e.target.value)}
                  placeholder={'Original PSA Birth Certificate\nValid school ID\nOfficial Receipt'}
                  rows={5}
                  className={textareaCls}
                />
              </FormField>

              <FormField label="Procedures (one per line)" hint={`${stepCount} step${stepCount !== 1 ? 's' : ''}`}>
                <textarea
                  value={form.steps}
                  onChange={e => setField('steps', e.target.value)}
                  placeholder={'Step 1\nStep 2\nStep 3'}
                  rows={8}
                  className={textareaCls}
                />
              </FormField>

              <button
                onClick={handleSave}
                className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition"
              >
                {editingId ? 'Save Changes' : 'Add Requirement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete Requirement?"
          message="This action cannot be undone."
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

    </AdminLayout>
  )
}

export default AdminRequirements

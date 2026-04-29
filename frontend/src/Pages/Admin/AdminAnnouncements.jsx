import { useState, useRef, useCallback } from 'react'
import AdminLayout from './AdminLayout'
import { MdImage, MdUpload, MdClose, MdVisibility, MdEdit, MdCheckCircle, MdMail } from 'react-icons/md'

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Enrollment for 2nd Semester',
    category: 'Enrollment',
    date: 'June 1, 2025',
    description: 'Enrollment for the second semester will begin on June 10.',
    fullDetails: 'Full details here...',
    requirements: ['Previous semester grades', 'Clearance form'],
    image: '',
    actionButton: { label: 'Register via Google Form', url: 'https://forms.google.com' },
    emailNotification: true,
  },
  {
    id: 2,
    title: 'Midterm Examination Schedule',
    category: 'Examination',
    date: 'May 28, 2025',
    description: 'The midterm examination schedule has been officially released.',
    fullDetails: 'Full details here...',
    requirements: ['School ID', 'Exam permit'],
    image: '',
    actionButton: null,
    emailNotification: false,
  },
]

const EMPTY_FORM = {
  title: '',
  category: '',
  date: '',
  description: '',
  fullDetails: '',
  requirements: '',
  image: '',
  actionButtonLabel: '',
  actionButtonUrl: '',
  emailNotification: false,
}

// ── Reusable sub-components ──────────────────────────────────────────────────

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const textareaCls = `${inputCls} resize-none`

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${checked ? 'left-5' : 'left-0.5'}`}
      />
    </button>
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

// ── Main component ───────────────────────────────────────────────────────────

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [emailSent, setEmailSent] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const fileInputRef = useRef(null)

  const setField = useCallback((key, value) => {
    setForm(f => ({ ...f, [key]: value }))
  }, [])

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setPreviewMode(false)
    setShowModal(true)
  }, [])

  const openEdit = useCallback((item) => {
    setForm({
      title: item.title,
      category: item.category,
      date: item.date,
      description: item.description,
      fullDetails: item.fullDetails,
      requirements: item.requirements.join('\n'),
      image: item.image,
      actionButtonLabel: item.actionButton?.label ?? '',
      actionButtonUrl: item.actionButton?.url ?? '',
      emailNotification: item.emailNotification,
    })
    setEditingId(item.id)
    setPreviewMode(false)
    setShowModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setPreviewMode(false)
  }, [])

  const handleSave = useCallback(() => {
    const item = {
      id: editingId ?? Date.now(),
      title: form.title,
      category: form.category,
      date: form.date,
      description: form.description,
      fullDetails: form.fullDetails,
      requirements: form.requirements.split('\n').filter(r => r.trim()),
      image: form.image,
      actionButton: form.actionButtonLabel
        ? { label: form.actionButtonLabel, url: form.actionButtonUrl }
        : null,
      emailNotification: form.emailNotification,
    }

    setAnnouncements(prev =>
      editingId ? prev.map(a => a.id === editingId ? item : a) : [...prev, item]
    )

    if (!editingId && form.emailNotification) {
      setEmailSent(form.title)
      setTimeout(() => setEmailSent(null), 3000)
    }

    closeModal()
  }, [editingId, form, closeModal])

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    setField('image', URL.createObjectURL(file))
  }, [setField])

  const handleDelete = useCallback((id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    setDeleteConfirm(null)
  }, [])

  const stopPropagation = useCallback((e) => e.stopPropagation(), [])
  const triggerFileInput = useCallback(() => fileInputRef.current.click(), [])

  const previewRequirements = form.requirements.split('\n').filter(r => r.trim())

  return (
    <AdminLayout activePage="Announcements">

      {/* Toast */}
      {emailSent && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2">
          <MdMail size={16} />
          Email notification sent for <strong>{emailSent}</strong>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{announcements.length} announcements</p>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          + Add Announcement
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Category', 'Date', 'Email', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {announcements.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{item.date}</td>
                  <td className="px-6 py-4">
                    {item.emailNotification
                      ? <span className="flex items-center gap-1 text-green-500 text-xs font-semibold"><MdCheckCircle size={14} /> Enabled</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={stopPropagation}
          >
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">
                {editingId ? 'Edit Announcement' : 'Add Announcement'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <MdClose size={20} />
              </button>
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
              <div className="px-6 py-5 flex flex-col gap-4">
                <FormField label="Title">
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    placeholder="Announcement title"
                    className={inputCls}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Category">
                    <input
                      type="text"
                      value={form.category}
                      onChange={e => setField('category', e.target.value)}
                      placeholder="e.g. Enrollment"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField label="Date">
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setField('date', e.target.value)}
                      className={inputCls}
                    />
                  </FormField>
                </div>

                <FormField label="Image">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.image}
                      onChange={e => setField('image', e.target.value)}
                      placeholder="Paste image URL or upload →"
                      className={`${inputCls} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition shrink-0"
                    >
                      <MdUpload size={16} /> Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  {form.image && (
                    <div className="relative mt-2 w-full h-36 rounded-xl overflow-hidden border border-gray-100">
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setField('image', '')}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition"
                      >
                        <MdClose size={14} />
                      </button>
                    </div>
                  )}
                </FormField>

                <FormField label="Short Description">
                  <textarea
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    placeholder="Short description..."
                    rows={2}
                    className={textareaCls}
                  />
                </FormField>

                <FormField label="Full Details">
                  <textarea
                    value={form.fullDetails}
                    onChange={e => setField('fullDetails', e.target.value)}
                    placeholder="Full announcement details..."
                    rows={3}
                    className={textareaCls}
                  />
                </FormField>

                <FormField label="Requirements (one per line)">
                  <textarea
                    value={form.requirements}
                    onChange={e => setField('requirements', e.target.value)}
                    placeholder={'School ID\nExam permit\n...'}
                    rows={3}
                    className={textareaCls}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Action Button Label">
                    <input
                      type="text"
                      value={form.actionButtonLabel}
                      onChange={e => setField('actionButtonLabel', e.target.value)}
                      placeholder="e.g. Register via Google Form"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField label="Action Button URL">
                    <input
                      type="text"
                      value={form.actionButtonUrl}
                      onChange={e => setField('actionButtonUrl', e.target.value)}
                      placeholder="https://..."
                      className={inputCls}
                    />
                  </FormField>
                </div>

                {/* Email notification toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Email Notification</p>
                    <p className="text-xs text-gray-400">Send email to all students when posted</p>
                  </div>
                  <Toggle
                    checked={form.emailNotification}
                    onChange={() => setField('emailNotification', !form.emailNotification)}
                  />
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
                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
                  >
                    {editingId ? 'Save Changes' : 'Publish'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-5 flex flex-col gap-4">
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  This is how the announcement will appear to students.
                </p>

                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  {form.image ? (
                    <img src={form.image} alt="" className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                      <MdImage size={36} className="text-gray-300" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {form.category && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                          {form.category}
                        </span>
                      )}
                      {form.date && <span className="text-xs text-gray-400">{form.date}</span>}
                    </div>
                    <h3 className="text-base font-black text-gray-800">
                      {form.title || <span className="text-gray-300">No title</span>}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {form.description || <span className="text-gray-300">No description</span>}
                    </p>
                    {form.fullDetails && (
                      <p className="text-sm text-gray-400 border-t border-gray-50 pt-3">{form.fullDetails}</p>
                    )}
                    {previewRequirements.length > 0 && (
                      <div className="border-t border-gray-50 pt-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Requirements</p>
                        <ul className="flex flex-col gap-1">
                          {previewRequirements.map((r, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {form.actionButtonLabel && (
                      <div className="pt-1">
                        <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl">
                          {form.actionButtonLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <MdEdit size={16} /> Back to Edit
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
                  >
                    {editingId ? 'Save Changes' : 'Publish'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete Announcement?"
          message="This action cannot be undone."
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

    </AdminLayout>
  )
}

export default AdminAnnouncements

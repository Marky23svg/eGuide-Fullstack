import { useState, useRef, useCallback, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import {
  MdImage, MdUpload, MdClose, MdVisibility, MdEdit, MdMail, MdSearch, MdAdd,
  MdInsertLink, MdArticle, MdCampaign
} from 'react-icons/md'
import { announcements as announcementsAPI, uploadImage } from '../../services/api'
import API from '../../services/api'

const EMPTY_FORM = {
  title: '',
  category: '',
  date: '',
  description: '',
  fullDetails: '',
  requirements: '',
  image: '',
  emailNotification: false,
  actionButtons: [],
}

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
    <button type="button" onClick={onChange} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${checked ? 'left-5' : 'left-0.5'}`} />
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
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Action Buttons Editor ─────────────────────────────────────────────────────
// Key fix: all mutations go through a single onChange call with the full updated array.
// Never call updateButton twice — always merge into one atomic update to avoid stale state.

function ActionButtonsEditor({ buttons, onChange, documents }) {
  const addButton = () => {
    onChange([...buttons, { label: '', url: '', documentId: '', documentTitle: '', type: 'url' }])
  }

  const removeButton = (i) => {
    onChange(buttons.filter((_, idx) => idx !== i))
  }

  // Single-field update
  const updateField = (i, field, value) => {
    onChange(buttons.map((b, idx) => idx === i ? { ...b, [field]: value } : b))
  }

  // Switch type — resets url/documentId
  const switchType = (i, type) => {
    onChange(buttons.map((b, idx) => idx === i
      ? { ...b, type, url: '', documentId: '', documentTitle: '' }
      : b
    ))
  }

  // Document select — merge both fields atomically in ONE onChange call
  const selectDocument = (i, docId) => {
    const doc = documents.find(d => d._id === docId)
    onChange(buttons.map((b, idx) => idx === i
      ? { ...b, documentId: docId, documentTitle: doc?.title || '' }
      : b
    ))
  }

  return (
    <div className="flex flex-col gap-3">
      {buttons.map((btn, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Button {i + 1}</span>
            <button onClick={() => removeButton(i)} className="text-gray-300 hover:text-red-400 transition">
              <MdClose size={15} />
            </button>
          </div>

          {/* Label */}
          <input
            type="text"
            value={btn.label}
            onChange={e => updateField(i, 'label', e.target.value)}
            placeholder="Button label e.g. Go to Enrollment Procedure"
            className={inputCls}
          />

          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => switchType(i, 'url')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 ${btn.type !== 'document' ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
            >
              <MdInsertLink size={14} /> External URL
            </button>
            <button
              onClick={() => switchType(i, 'document')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1.5 ${btn.type === 'document' ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
            >
              <MdArticle size={14} /> Document Link
            </button>
          </div>

          {/* Input depending on type */}
          {btn.type === 'document' ? (
            <select
              value={btn.documentId}
              onChange={e => selectDocument(i, e.target.value)}
              className={inputCls}
            >
              <option value="">— Select a document —</option>
              {documents.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.title}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={btn.url}
              onChange={e => updateField(i, 'url', e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          )}
        </div>
      ))}

      <button
        onClick={addButton}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition w-full justify-center"
      >
        <MdAdd size={15} /> Add Button
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [emailSent, setEmailSent] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    announcementsAPI.getAll()
      .then(res => setAnnouncements(Array.isArray(res) ? res : (res.data ?? [])))
      .catch(console.error)
    API.get('/requirements?limit=100')
      .then(res => setDocuments(res.data || res || []))
      .catch(() => {})
  }, [])

  const setField = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), [])

  const toFormButtons = (item) => {
    if (Array.isArray(item.actionButtons) && item.actionButtons.length > 0) {
      return item.actionButtons.map(b => ({
        label: b.label || '',
        url: b.url || '',
        documentId: b.documentId || '',
        documentTitle: b.documentTitle || '',
        type: b.documentId ? 'document' : 'url',
      }))
    }
    if (item.actionButton?.label) {
      return [{ label: item.actionButton.label, url: item.actionButton.url || '', documentId: '', documentTitle: '', type: 'url' }]
    }
    return []
  }

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM); setEditingId(null); setPreviewMode(false); setSaveError(null); setShowModal(true)
  }, [])

  const openEdit = useCallback((item) => {
    setForm({
      title: item.title || '',
      category: item.category || '',
      date: item.date || '',
      description: item.description || item.content || '',
      fullDetails: item.fullDetails || '',
      requirements: Array.isArray(item.requirements) ? item.requirements.join('\n') : '',
      image: item.image || '',
      emailNotification: item.emailNotification || false,
      actionButtons: toFormButtons(item),
    })
    setEditingId(item._id); setPreviewMode(false); setSaveError(null); setShowModal(true)
  }, [])

  const closeModal = useCallback(() => { setShowModal(false); setPreviewMode(false); setSaveError(null) }, [])

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) return
    setSaving(true)
    setSaveError(null)
    const cleanButtons = form.actionButtons.filter(b => b.label.trim())
    const payload = {
      title: form.title,
      content: form.description || form.fullDetails || form.title,
      category: form.category,
      date: form.date,
      description: form.description,
      fullDetails: form.fullDetails,
      requirements: form.requirements.split('\n').filter(r => r.trim()),
      image: form.image,
      // Send the full array — server now saves it
      actionButtons: cleanButtons,
      // Legacy single-button for backward compat
      actionButton: cleanButtons.length > 0 && cleanButtons[0].type !== 'document'
        ? { label: cleanButtons[0].label, url: cleanButtons[0].url }
        : { label: '', url: '' },
      emailNotification: form.emailNotification,
    }
    let succeeded = false
    try {
      if (editingId) {
        const res = await announcementsAPI.update(editingId, payload)
        if (res.success) {
          setAnnouncements(prev => prev.map(a => a._id === editingId ? res.data : a))
          succeeded = true
        } else {
          setSaveError(res.message || 'Update failed.')
        }
      } else {
        const res = await announcementsAPI.create(payload)
        if (res.success) {
          setAnnouncements(prev => [res.data, ...prev])
          if (form.emailNotification) { setEmailSent(form.title); setTimeout(() => setEmailSent(null), 3000) }
          succeeded = true
        } else {
          setSaveError(res.message || 'Create failed.')
        }
      }
    } catch (error) {
      console.error('Save failed:', error)
      setSaveError(error?.message || 'Something went wrong while saving. Check the console for details.')
    } finally {
      setSaving(false)
    }
    if (succeeded) closeModal()
  }, [editingId, form, closeModal])

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try { const url = await uploadImage(file); setField('image', url) }
    catch (err) { console.error('Upload failed:', err) }
    finally { setUploading(false) }
  }, [setField])

  const handleDelete = useCallback(async (id) => {
    try { await announcementsAPI.delete(id); setAnnouncements(prev => prev.filter(a => a._id !== id)) }
    catch (err) { console.error('Delete failed:', err) }
    setDeleteConfirm(null)
  }, [])

  const previewRequirements = form.requirements.split('\n').filter(r => r.trim())
  const filteredAnnouncements = announcements.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout activePage="Announcements">
      {emailSent && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2">
          <MdMail size={16} /> Email notification sent for <strong>{emailSent}</strong>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">{announcements.length} announcements</p>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition">
          + Add Announcement
        </button>
      </div>

      <div className="relative mb-4">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Title', 'Content', 'Buttons', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAnnouncements.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-300">
                  {search ? `No announcements found for "${search}"` : 'No announcements yet'}
                </td></tr>
              ) : filteredAnnouncements.map(item => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800 max-w-[200px] truncate">{item.title}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">{item.content}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {item.actionButtons?.length || (item.actionButton?.label ? 1 : 0)} button(s)
                  </td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {item.date_posted ? new Date(item.date_posted).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">Edit</button>
                      <button onClick={() => setDeleteConfirm(item._id)} className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">{editingId ? 'Edit Announcement' : 'Add Announcement'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition"><MdClose size={20} /></button>
            </div>

            <div className="flex border-b border-gray-100">
              {[{ label: 'Edit', icon: MdEdit, active: !previewMode, onClick: () => setPreviewMode(false) },
                { label: 'Preview', icon: MdVisibility, active: previewMode, onClick: () => setPreviewMode(true) }
              ].map(({ label, icon: Icon, active, onClick }) => (
                <button key={label} onClick={onClick}
                  className={['flex items-center gap-1.5 px-6 py-3 text-sm font-semibold border-b-2 transition',
                    active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'].join(' ')}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {!previewMode ? (
              <div className="px-6 py-5 flex flex-col gap-4">
                <FormField label="Title">
                  <input type="text" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Announcement title" className={inputCls} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Category">
                    <input type="text" value={form.category} onChange={e => setField('category', e.target.value)} placeholder="e.g. Enrollment" className={inputCls} />
                  </FormField>
                  <FormField label="Date">
                    <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} className={inputCls} />
                  </FormField>
                </div>
                <FormField label="Image">
                  <div className="flex gap-2">
                    <input type="text" value={form.image} onChange={e => setField('image', e.target.value)} placeholder="Paste image URL or upload →" className={`${inputCls} flex-1`} />
                    <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition shrink-0 disabled:opacity-50">
                      {uploading ? 'Uploading...' : <><MdUpload size={16} /> Upload</>}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </div>
                  {form.image && (
                    <div className="relative mt-2 w-full h-36 rounded-xl overflow-hidden border border-gray-100">
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      <button onClick={() => setField('image', '')}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition">
                        <MdClose size={14} />
                      </button>
                    </div>
                  )}
                </FormField>
                <FormField label="Short Description">
                  <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Short description..." rows={2} className={textareaCls} />
                </FormField>
                <FormField label="Full Details">
                  <textarea value={form.fullDetails} onChange={e => setField('fullDetails', e.target.value)} placeholder="Full announcement details..." rows={3} className={textareaCls} />
                </FormField>
                <FormField label="Requirements (one per line)">
                  <textarea value={form.requirements} onChange={e => setField('requirements', e.target.value)} placeholder={'School ID\nExam permit\n...'} rows={3} className={textareaCls} />
                </FormField>
                <FormField label="Action Buttons">
                  <ActionButtonsEditor
                    buttons={form.actionButtons}
                    onChange={v => setField('actionButtons', v)}
                    documents={documents}
                  />
                </FormField>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Email Notification</p>
                    <p className="text-xs text-gray-400">Send email to all students when posted</p>
                  </div>
                  <Toggle checked={form.emailNotification} onChange={() => setField('emailNotification', !form.emailNotification)} />
                </div>
                {saveError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{saveError}</p>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setPreviewMode(true)}
                    className="flex-1 py-2.5 border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2">
                    <MdVisibility size={16} /> Preview
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-5 flex flex-col gap-4">
                <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  This is how the announcement will appear to students.
                </p>
                <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  {form.image
                    ? <img src={form.image} alt="" className="w-full h-44 object-cover" />
                    : <div className="w-full h-44 bg-gray-100 flex items-center justify-center"><MdCampaign size={36} className="text-gray-300" /></div>}
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {form.category && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">{form.category}</span>}
                      {form.date && <span className="text-xs text-gray-400">{form.date}</span>}
                    </div>
                    <h3 className="text-base font-black text-gray-800">{form.title || <span className="text-gray-300">No title</span>}</h3>
                    <p className="text-sm text-gray-500">{form.description || <span className="text-gray-300">No description</span>}</p>
                    {form.fullDetails && <p className="text-sm text-gray-400 border-t border-gray-50 pt-3">{form.fullDetails}</p>}
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
                    {form.actionButtons.filter(b => b.label.trim()).length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        {form.actionButtons.filter(b => b.label.trim()).map((btn, i) => (
                          <span key={i} className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl ${btn.type === 'document' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {btn.type === 'document' ? <MdArticle size={15} /> : <MdInsertLink size={15} />} {btn.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {saveError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{saveError}</p>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setPreviewMode(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <MdEdit size={16} /> Back to Edit
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                    {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
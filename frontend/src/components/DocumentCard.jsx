import { useState } from 'react'
import { jsPDF } from 'jspdf'

// ── PDF generator ─────────────────────────────────────────────────────────────
const downloadPDF = (title, requirements, steps) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pageW - margin * 2
  let y = 0

  const checkPage = (needed = 10) => {
    if (y + needed > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  // ── Header bar ──
  doc.setFillColor(26, 86, 219) // blue-600
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('eGuide ICCT', margin, 12)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Document Procedure Guide', margin, 20)

  // ── Title ──
  y = 40
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(17, 24, 39)
  const titleLines = doc.splitTextToSize(title, contentW)
  doc.text(titleLines, margin, y)
  y += titleLines.length * 8 + 4

  // ── Divider ──
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ── Requirements section ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(26, 86, 219)
  doc.text('WHAT YOU NEED', margin, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(55, 65, 81)

  requirements.forEach((req) => {
    checkPage(8)
    const lines = doc.splitTextToSize(`• ${req}`, contentW - 4)
    doc.text(lines, margin + 2, y)
    y += lines.length * 6 + 2
  })

  y += 4
  checkPage(10)

  // ── Divider ──
  doc.setDrawColor(229, 231, 235)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // ── Procedure section ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(26, 86, 219)
  doc.text('PROCEDURE', margin, y)
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(55, 65, 81)

  steps.forEach((step, i) => {
    checkPage(10)
    // Step number circle area
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(margin, y - 4, 7, 7, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(26, 86, 219)
    doc.text(String(i + 1), margin + 2.5, y + 0.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    const lines = doc.splitTextToSize(step, contentW - 12)
    doc.text(lines, margin + 10, y)
    y += lines.length * 6 + 4
  })

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`eGuide ICCT  ·  Page ${p} of ${totalPages}`, margin, pageH - 8)
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageW - margin, pageH - 8, { align: 'right' })
  }

  doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}_procedure.pdf`)
}

function DocumentCard({ title, requirements, steps, onProgressChange }) {
  const storageKey = `doc_progress_${title}`

  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved).steps : steps.map(() => false)
  })
  const [reqChecked, setReqChecked] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved).reqs : requirements.map(() => false)
  })

  const completedCount = checked.filter(Boolean).length
  const reqCompletedCount = reqChecked.filter(Boolean).length
  const allDone = reqCompletedCount === requirements.length && completedCount === steps.length
  const reqPct = requirements.length ? (reqCompletedCount / requirements.length) * 100 : 0
  const stepPct = steps.length ? (completedCount / steps.length) * 100 : 0

  const save = (newSteps, newReqs) => {
    localStorage.setItem(storageKey, JSON.stringify({ steps: newSteps, reqs: newReqs }))
    onProgressChange?.(title, newSteps.filter(Boolean).length / steps.length)
  }

  const toggleStep = (i) => {
    const updated = checked.map((v, idx) => idx === i ? !v : v)
    setChecked(updated)
    save(updated, reqChecked)
  }

  const toggleReq = (i) => {
    const updated = reqChecked.map((v, idx) => idx === i ? !v : v)
    setReqChecked(updated)
    save(checked, updated)
  }

  const handleRetake = () => {
    const emptySteps = steps.map(() => false)
    const emptyReqs = requirements.map(() => false)
    setChecked(emptySteps)
    setReqChecked(emptyReqs)
    localStorage.removeItem(storageKey)
    onProgressChange?.(title, 0)
  }

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setOpen(true)}
        className={`rounded-2xl border flex flex-col overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.13)] ${
          allDone
            ? 'bg-green-50 border-green-200'
            : 'bg-white border-gray-100'
        }`}
      >
        {/* Title area */}
        <div className="px-5 pt-6 pb-4">
          <h3 className={`text-xl font-black leading-snug ${allDone ? 'text-green-700' : 'text-gray-800'}`}>
            {title}
          </h3>
          {allDone && (
            <span className="inline-flex items-center gap-1 mt-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              ✓ Complete
            </span>
          )}
        </div>

        {/* Progress bars */}
        <div className="mt-auto px-5 pb-5 pt-3 border-t border-gray-100 flex flex-col gap-3">
          {/* What you need bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className={allDone ? 'text-green-600' : 'text-gray-500'}>What you need</span>
              <span className={allDone ? 'text-green-600' : 'text-gray-400'}>{reqCompletedCount}/{requirements.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : reqPct > 0 ? 'bg-green-500' : 'bg-gray-200'}`}
                style={{ width: `${reqPct}%` }}
              />
            </div>
          </div>

          {/* Steps bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className={allDone ? 'text-green-600' : 'text-gray-500'}>Steps</span>
              <span className={allDone ? 'text-green-600' : 'text-gray-400'}>{completedCount}/{steps.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : stepPct > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                style={{ width: `${stepPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white w-full max-w-lg mx-4 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className={`px-6 pt-6 pb-5 ${allDone ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${allDone ? 'text-green-500' : 'text-blue-500'}`}>
                    Documents
                  </p>
                  <h3 className="text-xl font-black text-gray-800 leading-snug">{title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {allDone && (
                    <button
                      onClick={handleRetake}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-orange-500 hover:bg-orange-50 transition shadow-sm"
                    >
                      ↺ Reset
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal progress bars */}
              <div className="mt-4 flex flex-col gap-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className={allDone ? 'text-green-500' : 'text-gray-500'}>What you need</span>
                    <span className={allDone ? 'text-green-500' : 'text-gray-400'}>{reqCompletedCount}/{requirements.length}</span>
                  </div>
                  <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-green-500' : reqPct > 0 ? 'bg-green-500' : 'bg-gray-200'}`}
                      style={{ width: `${reqPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className={allDone ? 'text-green-500' : 'text-gray-500'}>Steps</span>
                    <span className={allDone ? 'text-green-500' : 'text-gray-400'}>{completedCount}/{steps.length}</span>
                  </div>
                  <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-green-500' : stepPct > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                      style={{ width: `${stepPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 py-5 flex flex-col gap-6">

              {/* What you need */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">What you need</p>
                  <span className="text-xs text-gray-400 font-medium">{reqCompletedCount}/{requirements.length} collected</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {requirements.map((req, i) => (
                    <li
                      key={i}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 ${
                        reqChecked[i]
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-transparent hover:border-green-100 hover:bg-green-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`shrink-0 w-2 h-2 rounded-full ${reqChecked[i] ? 'bg-green-400' : 'bg-gray-300'}`} />
                        <p className={`text-sm leading-relaxed truncate ${reqChecked[i] ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                          {req}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleReq(i)}
                        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                          reqChecked[i]
                            ? 'bg-green-500 text-white shadow-[0_2px_8px_rgba(34,197,94,0.4)]'
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-500 shadow-sm'
                        }`}
                      >
                        {reqChecked[i] ? '✓ Done' : 'Mark Done'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100" />

              {/* Procedure */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Procedure</p>
                <ol className="flex flex-col gap-2">
                  {steps.map((step, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        checked[i]
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-transparent hover:border-blue-100 hover:bg-blue-50/50'
                      }`}
                      onClick={() => toggleStep(i)}
                    >
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        checked[i] ? 'bg-blue-500 border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.4)]' : 'border-gray-200 bg-white'
                      }`}>
                        {checked[i] && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <div className="flex items-start gap-2 flex-1">
                        <span className={`shrink-0 text-xs font-black ${checked[i] ? 'text-blue-400' : 'text-gray-400'}`}>
                          {i + 1}.
                        </span>
                        <p className={`text-sm leading-relaxed ${checked[i] ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                          {step}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); downloadPDF(title, requirements, steps) }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
              >
                ↓ Download PDF
              </button>
              {allDone ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-lg">🎉</span>
                  <p className="text-sm font-bold text-green-600">All done! You're ready.</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-right">
                  {reqCompletedCount}/{requirements.length} items · {completedCount}/{steps.length} steps
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DocumentCard

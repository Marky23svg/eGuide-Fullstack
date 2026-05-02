import { useState } from 'react'

function DocumentCard({ title, requirements, steps }) {
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
  const allDone = completedCount === steps.length
  const progress = Math.round((completedCount / steps.length) * 100)

  const toggleStep = (i) => {
    const updated = checked.map((v, idx) => idx === i ? !v : v)
    setChecked(updated)
    localStorage.setItem(storageKey, JSON.stringify({ steps: updated, reqs: reqChecked }))
  }

  const toggleReq = (i) => {
    const updated = reqChecked.map((v, idx) => idx === i ? !v : v)
    setReqChecked(updated)
    localStorage.setItem(storageKey, JSON.stringify({ steps: checked, reqs: updated }))
  }

  const handleRetake = () => {
    setChecked(steps.map(() => false))
    setReqChecked(requirements.map(() => false))
    localStorage.removeItem(storageKey)
  }

  return (
    <>
      {/* Grid Card */}
      <div
        onClick={() => setOpen(true)}
        className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-gray-100 flex flex-col overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow"
      >
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-800 leading-snug flex-1">{title}</h3>
          {allDone ? (
            <span className="shrink-0 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              ✓ Complete
            </span>
          ) : (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {steps.length - completedCount} incomplete
              </span>
              <span className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                ✓ {completedCount} completed
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto px-5 pb-5 pt-3 border-t border-gray-50">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{completedCount} of {steps.length} completed</p>
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
            {/* Gradient header */}
            <div className={`px-6 pt-6 pb-5 ${allDone ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${allDone ? 'text-green-500' : 'text-blue-500'}`}>
                    Documents
                  </p>
                  <h3 className="text-lg font-black text-gray-800 leading-snug">{title}</h3>
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

              {/* Progress bar in header */}
              <div className="mt-4">
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-400'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 font-medium ${allDone ? 'text-green-500' : 'text-blue-400'}`}>
                  {completedCount} of {steps.length} steps done
                </p>
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
                          : 'bg-gray-50 border-transparent hover:border-blue-100 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`shrink-0 w-2 h-2 rounded-full ${reqChecked[i] ? 'bg-green-400' : 'bg-blue-400'}`} />
                        <p className={`text-sm leading-relaxed truncate ${reqChecked[i] ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                          {req}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleReq(i)}
                        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                          reqChecked[i]
                            ? 'bg-green-500 text-white shadow-[0_2px_8px_rgba(34,197,94,0.4)]'
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500 shadow-sm'
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
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-transparent hover:border-blue-100 hover:bg-blue-50/50'
                      }`}
                      onClick={() => toggleStep(i)}
                    >
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        checked[i] ? 'bg-green-500 border-green-500 shadow-[0_2px_8px_rgba(34,197,94,0.4)]' : 'border-gray-200 bg-white'
                      }`}>
                        {checked[i] && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <div className="flex items-start gap-2 flex-1">
                        <span className={`shrink-0 text-xs font-black ${checked[i] ? 'text-green-400' : 'text-blue-400'}`}>
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
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              {allDone ? (
                <div className="flex items-center justify-center gap-2 py-1">
                  <span className="text-green-500 text-lg">🎉</span>
                  <p className="text-sm font-bold text-green-600">All steps completed!</p>
                </div>
              ) : (
                <div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{completedCount} of {steps.length} steps completed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DocumentCard

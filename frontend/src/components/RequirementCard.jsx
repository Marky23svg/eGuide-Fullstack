import { useState } from 'react'

function RequirementCard({ title, incomplete, steps }) {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(
    steps.map((_, i) => i < steps.length - incomplete)
  )

  const completedCount = checked.filter(Boolean).length
  const allDone = completedCount === steps.length

  const toggleStep = (index) => {
    const updated = [...checked]
    updated[index] = !updated[index]
    setChecked(updated)
  }

  const handleRetake = () => {
    setChecked(steps.map(() => false))
  }

  return (
    <>
      {/* Grid card */}
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
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{completedCount} of {steps.length} completed</p>
        </div>
      </div>

      {/* Floating modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3 border-b border-gray-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Requirements</p>
                <h3 className="text-lg font-black text-gray-800 leading-snug">{title}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Retake button — only shows when all done */}
                {allDone && (
                  <button
                    onClick={handleRetake}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-500 hover:bg-orange-100 transition"
                  >
                    ↺ Retake
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 py-5 flex flex-col gap-6">

              {/* Requirements — unordered list with mark as done */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What you need</p>
                <ul className="flex flex-col gap-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${checked[i] ? 'bg-green-500' : 'bg-blue-400'}`} />
                        <p className={`text-sm leading-relaxed ${checked[i] ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                          {step}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleStep(i)}
                        className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                          checked[i]
                            ? 'bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-400'
                            : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {checked[i] ? 'Undo' : 'Mark done'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100" />

              {/* Procedure — ordered list with checkboxes */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Procedure</p>
                <ol className="flex flex-col gap-3">
                  {steps.map((step, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl transition cursor-pointer ${
                        checked[i] ? 'bg-green-50' : 'bg-gray-50 hover:bg-blue-50'
                      }`}
                      onClick={() => toggleStep(i)}
                    >
                      {/* Checkbox */}
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        checked[i] ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'
                      }`}>
                        {checked[i] && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      {/* Step number + text */}
                      <div className="flex items-start gap-2 flex-1">
                        <span className={`shrink-0 text-xs font-bold ${checked[i] ? 'text-green-400' : 'text-blue-400'}`}>
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

            {/* Modal footer — progress */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${(completedCount / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{completedCount} of {steps.length} completed</p>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default RequirementCard

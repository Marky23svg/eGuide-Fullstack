import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import requirementBg from '../assets/Requirement_bg.png'

// Mock data — replace with API data later
const requirementCards = [
  { id: 1, title: 'Transcript of Records (TOR)', incomplete: 4, steps: ['Fill out the request form at the Registrar\'s Office', 'Submit a valid school ID or any government-issued ID', 'Pay the processing fee at the cashier', 'Present the official receipt to the Registrar', 'Wait for the evaluation of your academic records', 'Claim the TOR after 5-7 working days', 'Have the TOR signed by the Registrar', 'Request for dry seal if needed', 'Receive the final TOR in a sealed envelope'] },
  { id: 2, title: 'Certificate of Enrollment (COE)', incomplete: 2, steps: ['Proceed to the Registrar\'s Office', 'Fill out the COE request form', 'Present your school ID', 'Pay the processing fee at the cashier', 'Submit the official receipt', 'Wait for 1-2 working days', 'Claim the COE at the Registrar\'s window', 'Check the details for accuracy', 'Have it signed and stamped by the Registrar'] },
  { id: 3, title: 'Diploma / Certificate of Graduation', incomplete: 0, steps: ['Apply for graduation at the Registrar\'s Office', 'Submit clearance from all departments', 'Pay the graduation fee at the cashier', 'Submit 4 pcs 2x2 ID photos', 'Attend the graduation rehearsal', 'Confirm your name spelling on the diploma', 'Submit the accomplished graduation form', 'Attend the graduation ceremony', 'Claim the diploma after the ceremony'] },
  { id: 4, title: 'Good Moral Certificate', incomplete: 1, steps: ['Request the form from the Guidance Office', 'Fill out the Good Moral request form', 'Submit a recommendation letter if required', 'Present your school ID', 'Pay the processing fee', 'Wait for the Guidance Counselor\'s evaluation', 'Claim after 2-3 working days', 'Have it signed by the Guidance Counselor', 'Have it countersigned by the School Director'] },
  { id: 5, title: 'Transcript of Records (TOR)', incomplete: 3, steps: ['Fill out the request form at the Registrar\'s Office', 'Submit a valid school ID or any government-issued ID', 'Pay the processing fee at the cashier', 'Present the official receipt to the Registrar', 'Wait for the evaluation of your academic records', 'Claim the TOR after 5-7 working days', 'Have the TOR signed by the Registrar', 'Request for dry seal if needed', 'Receive the final TOR in a sealed envelope'] },
  { id: 6, title: 'Certificate of Enrollment (COE)', incomplete: 0, steps: ['Proceed to the Registrar\'s Office', 'Fill out the COE request form', 'Present your school ID', 'Pay the processing fee at the cashier', 'Submit the official receipt', 'Wait for 1-2 working days', 'Claim the COE at the Registrar\'s window', 'Check the details for accuracy', 'Have it signed and stamped by the Registrar'] },
  { id: 7, title: 'Diploma / Certificate of Graduation', incomplete: 2, steps: ['Apply for graduation at the Registrar\'s Office', 'Submit clearance from all departments', 'Pay the graduation fee at the cashier', 'Submit 4 pcs 2x2 ID photos', 'Attend the graduation rehearsal', 'Confirm your name spelling on the diploma', 'Submit the accomplished graduation form', 'Attend the graduation ceremony', 'Claim the diploma after the ceremony'] },
  { id: 8, title: 'Good Moral Certificate', incomplete: 0, steps: ['Request the form from the Guidance Office', 'Fill out the Good Moral request form', 'Submit a recommendation letter if required', 'Present your school ID', 'Pay the processing fee', 'Wait for the Guidance Counselor\'s evaluation', 'Claim after 2-3 working days', 'Have it signed by the Guidance Counselor', 'Have it countersigned by the School Director'] },
  { id: 9, title: 'Transcript of Records (TOR)', incomplete: 1, steps: ['Fill out the request form at the Registrar\'s Office', 'Submit a valid school ID or any government-issued ID', 'Pay the processing fee at the cashier', 'Present the official receipt to the Registrar', 'Wait for the evaluation of your academic records', 'Claim the TOR after 5-7 working days', 'Have the TOR signed by the Registrar', 'Request for dry seal if needed', 'Receive the final TOR in a sealed envelope'] },
  { id: 10, title: 'Certificate of Enrollment (COE)', incomplete: 4, steps: ['Proceed to the Registrar\'s Office', 'Fill out the COE request form', 'Present your school ID', 'Pay the processing fee at the cashier', 'Submit the official receipt', 'Wait for 1-2 working days', 'Claim the COE at the Registrar\'s window', 'Check the details for accuracy', 'Have it signed and stamped by the Registrar'] },
  { id: 11, title: 'Diploma / Certificate of Graduation', incomplete: 0, steps: ['Apply for graduation at the Registrar\'s Office', 'Submit clearance from all departments', 'Pay the graduation fee at the cashier', 'Submit 4 pcs 2x2 ID photos', 'Attend the graduation rehearsal', 'Confirm your name spelling on the diploma', 'Submit the accomplished graduation form', 'Attend the graduation ceremony', 'Claim the diploma after the ceremony'] },
  { id: 12, title: 'Good Moral Certificate', incomplete: 2, steps: ['Request the form from the Guidance Office', 'Fill out the Good Moral request form', 'Submit a recommendation letter if required', 'Present your school ID', 'Pay the processing fee', 'Wait for the Guidance Counselor\'s evaluation', 'Claim after 2-3 working days', 'Have it signed by the Guidance Counselor', 'Have it countersigned by the School Director'] },
]

function Requirements() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="relative border-b border-gray-100 pt-24 pb-10 px-8 overflow-hidden">
        {/* Background image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${requirementBg})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        {/* Fading bottom */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">eGuide ICCT</p>
          <h1
            className="text-4xl font-black text-white uppercase"
            style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}
          >
            Requirements
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Track and manage your document requirements in one place.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {requirementCards.map((card) => (
          <div
            key={card.id}
            className="relative bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden"
          >
            {/* Incomplete badge — top right */}
            {card.incomplete > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {card.incomplete} incomplete
              </div>
            )}

            {/* All done badge */}
            {card.incomplete === 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10">
                <span>✓</span> Complete
              </div>
            )}

            {/* Card header */}
            <div
              className="flex items-center justify-between px-6 py-5 cursor-pointer select-none"
              onClick={() => setExpanded(expanded === card.id ? null : card.id)}
            >
              <div className="flex items-center gap-3 pr-24">
                {/* Step count pill */}
                <span className="shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                  {card.steps.length}
                </span>
                <h3 className="text-sm font-bold text-gray-800">{card.title}</h3>
              </div>

              {/* Expand arrow */}
              <span
                className={`text-gray-400 transition-transform duration-300 ${
                  expanded === card.id ? 'rotate-180' : ''
                }`}
              >
                ▾
              </span>
            </div>

            {/* Progress bar */}
            <div className="px-6 pb-3">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    card.incomplete === 0 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${((card.steps.length - card.incomplete) / card.steps.length) * 100}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {card.steps.length - card.incomplete} of {card.steps.length} steps completed
              </p>
            </div>

            {/* Steps — expandable */}
            <div
              className={`overflow-hidden transition-all duration-500 ${
                expanded === card.id ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 flex flex-col gap-2 border-t border-gray-50 pt-4">
                {card.steps.map((step, i) => {
                  const isComplete = i < card.steps.length - card.incomplete
                  return (
                    <div key={i} className="flex items-start gap-3">
                      {/* Step indicator */}
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isComplete
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isComplete ? '✓' : i + 1}
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        isComplete ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {step}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}

export default Requirements

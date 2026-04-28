import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RequirementCard from '../components/RequirementCard'
import requirementBg from '../assets/Requirement_bg.png'

const requirementCards = [
  { id: 1, title: 'Transcript of Records (TOR)', incomplete: 4, requirements: ['Original PSA Birth Certificate', 'Valid school ID or government-issued ID', 'Official Receipt of payment', 'Accomplished request form'], steps: ['Fill out the request form at the Registrar\'s Office', 'Submit a valid school ID or any government-issued ID', 'Pay the processing fee at the cashier', 'Present the official receipt to the Registrar', 'Wait for the evaluation of your academic records', 'Claim the TOR after 5-7 working days', 'Have the TOR signed by the Registrar', 'Request for dry seal if needed', 'Receive the final TOR in a sealed envelope'] },
  { id: 2, title: 'Certificate of Enrollment (COE)', incomplete: 2, requirements: ['Valid school ID', 'Accomplished COE request form', 'Official Receipt of payment'], steps: ['Proceed to the Registrar\'s Office', 'Fill out the COE request form', 'Present your school ID', 'Pay the processing fee at the cashier', 'Submit the official receipt', 'Wait for 1-2 working days', 'Claim the COE at the Registrar\'s window', 'Check the details for accuracy', 'Have it signed and stamped by the Registrar'] },
  { id: 3, title: 'Diploma / Certificate of Graduation', incomplete: 0, requirements: ['Clearance from all departments', '4 pcs 2x2 ID photos', 'Official Receipt of graduation fee', 'Accomplished graduation form'], steps: ['Apply for graduation at the Registrar\'s Office', 'Submit clearance from all departments', 'Pay the graduation fee at the cashier', 'Submit 4 pcs 2x2 ID photos', 'Attend the graduation rehearsal', 'Confirm your name spelling on the diploma', 'Submit the accomplished graduation form', 'Attend the graduation ceremony', 'Claim the diploma after the ceremony'] },
  { id: 4, title: 'Good Moral Certificate', incomplete: 1, requirements: ['Valid school ID', 'Recommendation letter (if required)', 'Official Receipt of payment'], steps: ['Request the form from the Guidance Office', 'Fill out the Good Moral request form', 'Submit a recommendation letter if required', 'Present your school ID', 'Pay the processing fee', 'Wait for the Guidance Counselor\'s evaluation', 'Claim after 2-3 working days', 'Have it signed by the Guidance Counselor', 'Have it countersigned by the School Director'] },
  { id: 5, title: 'Transcript of Records (TOR)', incomplete: 3, requirements: ['Original PSA Birth Certificate', 'Valid school ID or government-issued ID', 'Official Receipt of payment', 'Accomplished request form'], steps: ['Fill out the request form at the Registrar\'s Office', 'Submit a valid school ID or any government-issued ID', 'Pay the processing fee at the cashier', 'Present the official receipt to the Registrar', 'Wait for the evaluation of your academic records', 'Claim the TOR after 5-7 working days', 'Have the TOR signed by the Registrar', 'Request for dry seal if needed', 'Receive the final TOR in a sealed envelope'] },
  { id: 6, title: 'Certificate of Enrollment (COE)', incomplete: 0, requirements: ['Valid school ID', 'Accomplished COE request form', 'Official Receipt of payment'], steps: ['Proceed to the Registrar\'s Office', 'Fill out the COE request form', 'Present your school ID', 'Pay the processing fee at the cashier', 'Submit the official receipt', 'Wait for 1-2 working days', 'Claim the COE at the Registrar\'s window', 'Check the details for accuracy', 'Have it signed and stamped by the Registrar'] },
  { id: 7, title: 'Diploma / Certificate of Graduation', incomplete: 2, requirements: ['Clearance from all departments', '4 pcs 2x2 ID photos', 'Official Receipt of graduation fee', 'Accomplished graduation form'], steps: ['Apply for graduation at the Registrar\'s Office', 'Submit clearance from all departments', 'Pay the graduation fee at the cashier', 'Submit 4 pcs 2x2 ID photos', 'Attend the graduation rehearsal', 'Confirm your name spelling on the diploma', 'Submit the accomplished graduation form', 'Attend the graduation ceremony', 'Claim the diploma after the ceremony'] },
  { id: 8, title: 'Good Moral Certificate', incomplete: 0, requirements: ['Valid school ID', 'Recommendation letter (if required)', 'Official Receipt of payment'], steps: ['Request the form from the Guidance Office', 'Fill out the Good Moral request form', 'Submit a recommendation letter if required', 'Present your school ID', 'Pay the processing fee', 'Wait for the Guidance Counselor\'s evaluation', 'Claim after 2-3 working days', 'Have it signed by the Guidance Counselor', 'Have it countersigned by the School Director'] },
  { id: 9, title: 'Transcript of Records (TOR)', incomplete: 1, requirements: ['Original PSA Birth Certificate', 'Valid school ID or government-issued ID', 'Official Receipt of payment', 'Accomplished request form'], steps: ['Fill out the request form at the Registrar\'s Office', 'Submit a valid school ID or any government-issued ID', 'Pay the processing fee at the cashier', 'Present the official receipt to the Registrar', 'Wait for the evaluation of your academic records', 'Claim the TOR after 5-7 working days', 'Have the TOR signed by the Registrar', 'Request for dry seal if needed', 'Receive the final TOR in a sealed envelope'] },
  { id: 10, title: 'Certificate of Enrollment (COE)', incomplete: 4, requirements: ['Valid school ID', 'Accomplished COE request form', 'Official Receipt of payment'], steps: ['Proceed to the Registrar\'s Office', 'Fill out the COE request form', 'Present your school ID', 'Pay the processing fee at the cashier', 'Submit the official receipt', 'Wait for 1-2 working days', 'Claim the COE at the Registrar\'s window', 'Check the details for accuracy', 'Have it signed and stamped by the Registrar'] },
  { id: 11, title: 'Diploma / Certificate of Graduation', incomplete: 0, requirements: ['Clearance from all departments', '4 pcs 2x2 ID photos', 'Official Receipt of graduation fee', 'Accomplished graduation form'], steps: ['Apply for graduation at the Registrar\'s Office', 'Submit clearance from all departments', 'Pay the graduation fee at the cashier', 'Submit 4 pcs 2x2 ID photos', 'Attend the graduation rehearsal', 'Confirm your name spelling on the diploma', 'Submit the accomplished graduation form', 'Attend the graduation ceremony', 'Claim the diploma after the ceremony'] },
  { id: 12, title: 'Good Moral Certificate', incomplete: 2, requirements: ['Valid school ID', 'Recommendation letter (if required)', 'Official Receipt of payment'], steps: ['Request the form from the Guidance Office', 'Fill out the Good Moral request form', 'Submit a recommendation letter if required', 'Present your school ID', 'Pay the processing fee', 'Wait for the Guidance Counselor\'s evaluation', 'Claim after 2-3 working days', 'Have it signed by the Guidance Counselor', 'Have it countersigned by the School Director'] },
]

function Requirements() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="relative border-b border-gray-100 pt-24 pb-10 px-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${requirementBg})` }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">eGuide ICCT</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
            Requirements
          </h1>
          <p className="text-white/50 text-sm mt-2">Track and manage your document requirements in one place.</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {requirementCards.map((card) => (
          <RequirementCard
            key={card.id}
            title={card.title}
            incomplete={card.incomplete}
            requirements={card.requirements}
            steps={card.steps}
          />
        ))}
      </div>

      <Footer />
    </div>
  )
}

export default Requirements

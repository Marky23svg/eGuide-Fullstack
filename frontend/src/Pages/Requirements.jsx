import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RequirementCard from '../components/RequirementCard'
import requirementBg from '../assets/Requirement_bg.png'

// Replace with API data when backend is ready
const requirementCards = []

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
      <div className="max-w-6xl mx-auto px-8 py-12">
        {requirementCards.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No requirements yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Requirements

import { useNavigate } from 'react-router-dom'

function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">

        <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
        <p className="text-xs text-gray-400 mb-6">Last updated: June 2025</p>

        <div className="flex flex-col gap-5 text-sm text-gray-600">

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">1. Acceptance of Terms</h2>
            <p>By accessing and using eGuide ICCT, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">2. Use of the Platform</h2>
            <p>eGuide ICCT is intended for students and faculty of ICCT Colleges. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">3. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">4. Prohibited Activities</h2>
            <p>You may not use eGuide ICCT to share false information, harass other users, or attempt to gain unauthorized access to any part of the system.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">5. Termination</h2>
            <p>We reserve the right to suspend or terminate your account if you violate these terms without prior notice.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">6. Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. Continued use of the platform after changes means you accept the new terms.</p>
          </section>

        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-8 text-sm text-blue-500 hover:underline cursor-pointer"
        >
          ← Back
        </button>

      </div>
    </div>
  )
}

export default TermsOfService

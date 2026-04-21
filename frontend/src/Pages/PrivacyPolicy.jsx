import { useNavigate } from 'react-router-dom'

function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">

        <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mb-6">Last updated: June 2025</p>

        <div className="flex flex-col gap-5 text-sm text-gray-600">

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">1. Information We Collect</h2>
            <p>We collect information you provide when registering, such as your full name, student number, and email address. We may also collect usage data to improve the platform.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">2. How We Use Your Information</h2>
            <p>Your information is used to manage your account, provide platform features, and communicate important updates related to eGuide ICCT.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">3. Data Sharing</h2>
            <p>We do not sell or share your personal information with third parties except as required by law or to operate the platform (e.g. email services).</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">4. Data Security</h2>
            <p>We take reasonable measures to protect your personal data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. Contact the platform administrator to make such requests.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">6. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes through the platform or via email.</p>
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

export default PrivacyPolicy

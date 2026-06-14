import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

function TermsOfService() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By registering and using eGuide ICCT, you ("Student") agree to be bound by these Terms of Service set forth by ICCT Colleges ("ICCT"). If you do not agree to these terms, please do not use the platform.`,
    },
    {
      title: '2. Purpose of the Platform',
      content: `eGuide ICCT is an academic document guide platform exclusively designed for students of ICCT Colleges. It provides step-by-step guidance for processing academic documents, tracks your document progress, and delivers institutional announcements.\n\nThis platform is not an official enrollment system, grading portal, or financial transaction platform.`,
    },
    {
      title: '3. Eligibility',
      content: `eGuide ICCT is intended for currently enrolled students of ICCT Colleges. By registering, you confirm that you are a legitimate student of ICCT Colleges and that the information you provide during registration is accurate and truthful.`,
    },
    {
      title: '4. Account Responsibility',
      content: `You are solely responsible for:\n\n• Keeping your login credentials (email and password) confidential\n• All activities that occur under your account\n• Logging out after each session, especially on shared devices\n\nICCT will not be held liable for any loss or damage resulting from your failure to protect your account credentials.`,
    },
    {
      title: '5. Acceptable Use',
      content: `You agree to use eGuide ICCT only for its intended purpose. You must not:\n\n• Attempt to gain unauthorized access to any part of the system\n• Share false, misleading, or harmful information\n• Use the platform for any commercial or unauthorized purpose\n• Attempt to reverse engineer or tamper with the platform`,
    },
    {
      title: '6. Content and Accuracy',
      content: `ICCT strives to keep document guides and announcements accurate and up to date. However, document requirements may change without prior notice. Always verify current requirements directly with the relevant ICCT office before processing any document.`,
    },
    {
      title: '7. Session and Security',
      content: `For your security, your session will automatically expire after 30 minutes of inactivity. You will be required to log in again. This is to protect your account on shared or public devices.`,
    },
    {
      title: '8. Account Suspension or Termination',
      content: `ICCT reserves the right to suspend or permanently terminate your account without prior notice if you are found to be in violation of these Terms of Service or if you are no longer an enrolled student of ICCT Colleges.`,
    },
    {
      title: '9. Changes to Terms',
      content: `ICCT may update these Terms of Service at any time. The updated version will be posted on this page with a revised date. Continued use of eGuide ICCT after any changes constitutes your acceptance of the new terms.`,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <motion.div
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <h1 className="text-2xl font-black text-gray-800 mb-1">Terms of Service</h1>
          <p className="text-xs text-gray-400 mb-1">Last updated: June 2025</p>
          <p className="text-xs text-blue-500 font-medium mb-6">eGuide ICCT — ICCT Colleges</p>
        </motion.div>

        <div className="flex flex-col gap-5 text-sm text-gray-600">
          {sections.map((s, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05, duration: 0.35 }}
            >
              <h2 className="font-bold text-gray-800 mb-2">{s.title}</h2>
              <p className="whitespace-pre-line leading-relaxed">{s.content}</p>
            </motion.section>
          ))}
        </div>

        <motion.button
          onClick={() => navigate(-1)}
          className="mt-8 text-sm text-blue-500 hover:underline cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          ← Back
        </motion.button>
      </motion.div>
    </div>
  )
}

export default TermsOfService

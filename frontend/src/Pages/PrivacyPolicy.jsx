import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

function PrivacyPolicy() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Who We Are and Who This Applies To',
      content: `"We" or "ICCT" refers to ICCT Colleges, the institution that owns and operates the eGuide ICCT platform.\n\n"You" or "Student" refers to any currently enrolled student of ICCT Colleges who registers and uses eGuide ICCT to access academic document guides, announcements, and related services.`,
    },
    {
      title: '2. Information We Collect',
      content: `When you register on eGuide ICCT, we collect the following:\n\n• Full name\n• Email address (used for account verification and OTP)\n• Password (stored in encrypted form)\n\nWe do not collect your student ID, grades, or any sensitive academic records through this platform.`,
    },
    {
      title: '3. How We Use Your Information',
      content: `ICCT uses your information solely to:\n\n• Create and manage your eGuide account\n• Send One-Time Passwords (OTP) for account verification and password reset\n• Notify you of important platform updates or announcements\n• Track your document progress locally on your device (stored in your browser, not our servers)`,
    },
    {
      title: '4. Data Sharing',
      content: `ICCT does not sell, trade, or share your personal information with any third party for commercial purposes.\n\nYour data may only be accessed by authorized ICCT administrators for account management purposes, or as required by applicable Philippine law (e.g. Data Privacy Act of 2012, Republic Act 10173).`,
    },
    {
      title: '5. Data Security',
      content: `ICCT takes reasonable technical measures to protect your personal information, including:\n\n• Password encryption using industry-standard hashing\n• Token-based authentication (JWT) for secure sessions\n• Automatic session expiration after 30 minutes of inactivity\n\nWhile we implement these protections, no digital system can guarantee absolute security. You are responsible for keeping your login credentials confidential.`,
    },
    {
      title: '6. Student Rights',
      content: `As a student user of eGuide ICCT, you have the right to:\n\n• Access the personal information we hold about your account\n• Request correction of inaccurate information\n• Request deletion of your account and associated data\n• Withdraw consent to data processing at any time\n\nTo exercise any of these rights, contact the ICCT system administrator at iccteguide@gmail.com.`,
    },
    {
      title: '7. Cookies and Local Storage',
      content: `eGuide ICCT uses your browser's local storage to save your document progress (e.g. which steps you have completed). This data stays on your device and is not transmitted to our servers. Clearing your browser data will reset your progress.`,
    },
    {
      title: '8. Changes to This Policy',
      content: `ICCT may update this Privacy Policy to reflect changes in our platform or legal requirements. When we do, we will update the "Last updated" date above. Continued use of eGuide ICCT after changes are posted means you accept the updated policy.`,
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
          <h1 className="text-2xl font-black text-gray-800 mb-1">Privacy Policy</h1>
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
          transition={{ delay: 0.6 }}
        >
          ← Back
        </motion.button>
      </motion.div>
    </div>
  )
}

export default PrivacyPolicy

import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MdArrowBack } from 'react-icons/md'

function TermsOfService() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Your Agreement with Us',
      content: `These Terms of Service govern your access, registration, and use of the eGuide ICCT application. By creating an account or using the platform, you agree to these Terms of Service. If you do not agree, please do not use this application.`,
    },
    {
      title: '2. Scope of Service and Limitations',
      content: `The eGuide ICCT platform is developed as a capstone project and pilot informational system intended to support student guidance processes. It serves as an informational resource to help students navigate document workflows, track their personal progress, and view school-related announcements.\n\nImportant Limitations: This platform is completely separate from the school's official databases. It does not handle official academic enrollments, grade changes, course registrations, or payments. All official transactions remain under the sole authority of the respective ICCT administrative offices and must be completed directly through them.`,
    },
    {
      title: '3. Eligibility and Main Campus Pilot Scope',
      content: `This service is strictly for currently enrolled students of ICCT Colleges. During its initial testing and evaluation phase, the platform's deployment is focused primarily on the ICCT Main Campus as the pilot site.\n\nBy registering, you confirm that you are an active student, that all your registration details are true and accurate, and that you will update your profile if your information changes.`,
    },
    {
      title: '4. Keeping Your Account Secure',
      content: `When you register, you are responsible for maintaining the confidentiality of your account credentials, including your email and password.\n\nTo protect your account, you agree to:\n\n• Log out completely at the end of each session, especially when using shared, public, or school computer laboratories.\n• Immediately notify the system administrator if you suspect someone else has accessed your account.\n\nThe eGuide ICCT Development Group is not responsible for any data exposure or account issues resulting from a failure to keep your login details safe.`,
    },
    {
      title: '5. Acceptable Use',
      content: `You agree to use eGuide ICCT only for its intended informational and educational purpose. You must not:\n\n• Attempt to bypass system login security, test for vulnerabilities, or try to gain admin access.\n• Enter false, misleading, or malicious information when creating or updating your account.\n• Use the app for advertisements, selling goods, or any commercial purposes.\n• Try to copy, reverse engineer, or tamper with the application's code.`,
    },
    {
      title: '6. Guide Accuracy Disclaimer',
      content: `While we work hard to keep all document steps, checklists, and announcements accurate and up to date, school policies and document requirements can change without prior notice.\n\nThe application is provided on an as-is basis. Students are strongly advised to verify final document requirements directly with the appropriate school office before completing any official transactions.`,
    },
    {
      title: '7. Auto-Logout (Session Timeout)',
      content: `To protect your data on public and campus networks, the system handles sessions automatically. If you leave the application inactive for thirty minutes, you will be automatically logged out and must log in again to continue.`,
    },
    {
      title: '8. Account Suspension or Termination',
      content: `We reserve the right to restrict, suspend, or permanently close your account without prior notice if you violate these terms, lose your active student status, or if technical maintenance requires us to temporarily take the system offline.`,
    },
    {
      title: '9. Changes to These Terms',
      content: `We may update these Terms of Service from time to time. When we do, we will update the Last Updated date at the top of this page. By continuing to use the platform after updates are posted, you agree to the new terms.`,
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
          <p className="text-xs text-gray-400 mb-1">Last Updated: June 2026</p>
          <p className="text-xs text-blue-500 font-medium mb-6">eGuide ICCT — ICCT Colleges Foundation, Incorporated</p>
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

        <motion.div
          className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-1 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <p className="font-bold text-gray-700">Contact Information</p>
          <p>System Administrator: eGuide ICCT Development Group</p>
          <p>Email: <a href="mailto:iccteguide@gmail.com" className="text-blue-500 hover:underline">iccteguide@gmail.com</a></p>
          <p>Institution: ICCT Colleges Foundation, Incorporated – Main Campus</p>
        </motion.div>

        <motion.button
          onClick={() => navigate(-1)}
          className="mt-6 text-sm text-blue-500 hover:underline cursor-pointer flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <MdArrowBack size={14} /> Back
        </motion.button>
      </motion.div>
    </div>
  )
}

export default TermsOfService

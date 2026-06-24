import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MdArrowBack } from 'react-icons/md'

function PrivacyPolicy() {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Commitment to Your Privacy',
      content: `For purposes of this capstone project, the eGuide ICCT Development Group acts as the administrator responsible for handling personal information collected through the system in accordance with the principles of the Philippine Data Privacy Act of 2012. We are committed to protecting the privacy of our student users.\n\nThis Privacy Policy explains how the eGuide ICCT platform collects, uses, and safeguards your personal data. This policy applies to all currently enrolled students who register an account to access our document guides, progress checklists, and announcements.`,
    },
    {
      title: '2. Minimizing the Data We Collect',
      content: `To protect your privacy, the platform only collects the absolute minimum information needed to create and secure your user account:\n\n• Account Profiles: Your Full Name and Email Address, which are used to verify your identity and send secure One-Time Passwords (OTP).\n• Security Data: Securely hashed versions of your chosen password.\n\nWhat We Do Not Collect: The platform explicitly does not collect, store, or access sensitive official records like your Student ID number, official grading sheets, transcript of records, or any financial accounts.`,
    },
    {
      title: '3. Why We Process Your Data and User Consent',
      content: `By creating an account, users consent to the collection and processing of their personal data for the purposes stated in this Privacy Policy. We process your data exclusively to:\n\n• Validate your identity when creating an account and during secure password recoveries.\n• Send critical system updates and school-related announcements posted through the platform via email.\n• Support the functionality of your step-by-step progress checklists within the application.`,
    },
    {
      title: '4. Where Your Data is Stored (Server vs. Browser)',
      content: `To keep the application lightweight and private, the system splits where information is saved:\n\n• Account Info (Server): Your basic profile data (name, email, and securely hashed password) is saved securely on our central database server.\n• Your Progress Checklist (Your Device): To give you complete privacy, your step-by-step document checklist progress is saved locally on your own device using browser storage. This progress data is decentralized; it is never sent to or stored on the school servers. Clearing your browser cache or deleting application data will permanently reset your checklist.`,
    },
    {
      title: '5. Third-Party Sharing and Data Privacy Laws',
      content: `We do not sell, rent, trade, or share student personal data with outside companies for marketing or advertising. Access is strictly limited to authorized system administrators managing this capstone project.\n\nYour data will only be disclosed when required by applicable laws, lawful government requests, court orders, or other legal processes recognized under Philippine law.`,
    },
    {
      title: '6. Security Protections',
      content: `The platform uses technical and structural safeguards designed to protect your personal data from accidental loss, modification, or unauthorized access. These include:\n\n• Using secure password hashing algorithms to protect stored passwords.\n• Secure user authentication and session management mechanisms.\n• Automatic session expiration after thirty minutes of inactivity.\n\nWhile reasonable security measures are implemented, no digital system can guarantee absolute security. Users share the responsibility of keeping their login passwords secret.`,
    },
    {
      title: '7. Your Legal Rights as a Data Subject',
      content: `In accordance with the Data Privacy Act of 2012, you hold specific rights regarding the data you share with us:\n\n• The Right to Access: You can ask to review the profile information saved under your account.\n• The Right to Rectification: You can ask to correct or update inaccurate or incomplete registration details.\n• The Right to Erasure: You can request the permanent deletion of your account and your server-side profile data.\n• The Right to Withdraw Consent: You can stop our system from processing your data at any time by closing your account permanently.\n\nTo use any of these rights, please email the system administrator at the contact address provided below.`,
    },
    {
      title: '8. Policy Updates',
      content: `This Privacy Policy may be updated to reflect platform adjustments or changes in data protection laws. Any updates take effect immediately once posted, signaled by the revised date at the top of the page. Using the system after changes are posted means you acknowledge the updated privacy rules.`,
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

export default PrivacyPolicy

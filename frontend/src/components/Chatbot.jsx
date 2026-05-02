import React, { useState, useRef, useEffect } from 'react';
import { LuMessageCircle } from 'react-icons/lu';
import { RiSendPlaneFill } from 'react-icons/ri';
import { CgClose } from 'react-icons/cg';
import { FaCircle } from 'react-icons/fa';

const docs = [
  {
    id: 'sog',
    title: 'Summary of Grades (SOG)',
    requirements: ['Print receipt proof of payment (₱100)'],
    procedure: [
      'Email your appointment request to mganda@icct.edu.ph (include: full name, student number, course, year level, purpose).',
      'Wait for an email reply with your appointment.',
      'On the scheduled date, proceed to window 6-7.',
      'Bring payment receipt and line up at window 6-7.'
    ]
  },
  {
    id: 'tor',
    title: 'Transcript of Records (TOR)',
    requirements: [
      'Filled REQUEST Google Form (link provided via confirmation email)',
      'Payment of document fee at authorized payment centers',
      'Payment reference: student name and student ID with "RO" suffix (e.g., 201812345RO)',
      'Proof of payment attached to Google Form or emailed',
      'Original documents when claiming or for CAV'
    ],
    procedure: [
      'Fill out the REQUEST Google Form (link will be provided via email).',
      'Registrar will send a confirmation email with instructions and fees.',
      'Settle document fees using specified payment method and format the account number correctly.',
      'Submit proof of payment via the Google Form or email.',
      'Processing period: within 30–45 days from date of payment.',
      'To claim (or for CAV) go to Registrar Window 7 at Cainta Main Campus (Mon–Sat, 8am–4pm) and bring originals.'
    ]
  },
  {
    id: 'ojt',
    title: 'On-The-Job Training (OJT / SIP)',
    requirements: [
      'Complete SIP Pre-Registration Form (college-specific Google Form)',
      'Parent/guardian signature and photocopy of valid ID where required',
      'Latest prospectus / summary of grades or proof of payment',
      'SIP processing fee (₱650)',
      'No outstanding balance (if applicable)'
    ],
    procedure: [
      'Complete SIP Pre-Registration form via the provided Google Form.',
      'CDJP will email schedule for evaluation (2–3 working days after registration).',
      'Attend scheduled evaluation and present prospectus and latest SOG or proof of payment.',
      'Submit photocopy of evaluated prospectus to Dean/Academic Head for pre-approval.',
      'Once pre-approved, attend orientation scheduled by CDJP.',
      'Settle SIP processing fee at authorized payment centers (add code "SIP" to student number when paying).',
      'Portal Group will encode SIP subjects during enrollment period; then get TCS and pay enrollment fees.'
    ]
  },
  {
    id: 'form-137',
    title: 'Form 137 (Permanent Record)',
    requirements: [
      'Filled REQUEST Google Form (link provided via confirmation email)',
      'Payment at authorized payment centers',
      'Payment reference: student name and student ID with "RO" suffix',
      'Proof of payment attached to Google Form or emailed',
      'Original documents when claiming or for CAV'
    ],
    procedure: [
      'Fill out the REQUEST Google Form.',
      'Registrar sends confirmation email with instructions and fees.',
      'Settle document fees and submit proof of payment.',
      'Processing: within 30–45 days from date of payment.',
      'To claim or for CAV, go to Registrar Window 7 (Mon–Sat, 8am–4pm) with originals.'
    ]
  },
  {
    id: 'enrollment',
    title: 'Enrollment',
    requirements: [
      'Proof of payment for application fee (college freshmen: ₱220)',
      'SHS report card / JHS report card (originals as applicable)',
      'SHS Permanent Record (Form 137A/SF10) or ORF where applicable',
      'Certificate of Good Moral Character (original)',
      'Photocopies of PSA Birth Certificate',
      'Passport-sized photos (4 pcs, 2x2, white background)'
    ],
    procedure: [
      'Apply online via ICCT Online Application Portal and receive Application Number.',
      'Pay the application fee using your Application Number.',
      'Submit requirements to Admissions Office (Mon–Sat, 7:00 AM–7:00 PM).',
      'Receive Tentative Class Schedule (TCS) and pay downpayment or full payment as instructed.',
      'Activate your Student Portal and update password/security questions.',
      'Generate and download your Official Registration Form (ORF).',
      'Attend New Student Orientation.',
      'Get your Student ID from the Library/Admissions Office.'
    ]
  }
];

const DOC_KEYWORDS = {
  sog: ['summary of grades', 'sog', 'grades copy', 'grade slip'],
  tor: ['transcript', 'tor', 'records'],
  ojt: ['ojt', 'sip', 'on-the-job', 'internship', 'training'],
  'form-137': ['form 137', '137', 'permanent record'],
  enrollment: ['enrollment', 'enroll', 'enrolment', 'how to enroll', 'enrolling']
};

const detectDocFromInput = (text) => {
  const lower = text.toLowerCase();
  for (const [id, keywords] of Object.entries(DOC_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return docs.find((doc) => doc.id === id);
    }
  }
  return null;
};

const formatDocSummary = (doc) => {
  const requirements = doc.requirements.map((req) => `- ${req}`).join('\n');
  const procedure = doc.procedure.map((step, index) => `${index + 1}. ${step}`).join('\n');

  return `Here is the ${doc.title} information:\n\nRequirements:\n${requirements}\n\nProcedure:\n${procedure}`;
};

const getBotResponse = (text) => {
  const lower = text.toLowerCase();
  const doc = detectDocFromInput(text);
  if (doc) {
    return formatDocSummary(doc);
  }

  if (lower.includes('requirements')) {
    return 'Go to the Requirements page to browse academic requirements by document or process. Select a card to see the full requirements and procedure.';
  }

  if (lower.includes('announcement') || lower.includes('announcements')) {
    return 'Check the home page announcements section for the latest updates and important school notices.';
  }

  if (lower.includes('login') || lower.includes('portal') || lower.includes('access')) {
    return 'Use your student login credentials to access the portal. If you need help, go to the login page and follow the instructions for password reset or contact support.';
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'Hi there! Ask me about enrollment, documents, requirements, or how to use the eGuide platform.';
  }

  return 'I can help with enrollment, summary of grades, TOR, OJT, Form 137, and other requirement procedures. Ask me about a specific document or process.';
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Welcome to eGuide ICCT! How can I help you navigate your academic requirements today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { text: trimmed, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const botText = getBotResponse(trimmed);
      setMessages((prev) => [...prev, { text: botText, sender: 'bot' }]);
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#1a73e8] hover:bg-[#1557b0] flex items-center justify-center rounded-full shadow-2xl text-white text-3xl transition-transform duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <LuMessageCircle />
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] h-[520px] bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-[#1a73e8] to-[#0d47a1] text-white flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">eGuide Assistant</div>
              <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                <FaCircle className="text-green-400 text-[6px]" /> Always Online
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close chat">
              <CgClose className="text-xl" />
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 text-[11px] text-blue-700 dark:text-blue-300 text-center border-b border-blue-100 dark:border-blue-900/30">
            Ask about Enrollment, Requirements, or Portal Access.
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8f9fa] dark:bg-[#0a0a0a]">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#1a73e8] text-white rounded-tr-none'
                      : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-800 rounded-tl-none'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#0a0a0a] border-t dark:border-zinc-800">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 p-2 rounded-xl border border-transparent focus-within:border-blue-500 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about requirements..."
                className="flex-1 bg-transparent border-none text-sm px-2 outline-none text-zinc-800 dark:text-zinc-200"
                disabled={isLoading}
                aria-label="Chat input"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#1a73e8] text-white p-2 rounded-lg hover:bg-[#1557b0] disabled:opacity-50 transition-all"
                aria-label="Send message"
              >
                <RiSendPlaneFill />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2 italic">Powered by eGuide ICCT Intelligence</p>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

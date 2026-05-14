import React, { useState, useRef, useEffect } from 'react';
import { LuMessageCircle } from 'react-icons/lu';
import { RiSendPlaneFill } from 'react-icons/ri';
import { CgClose } from 'react-icons/cg';
import { FaCircle } from 'react-icons/fa';
import { requirements as requirementsApi, announcements as announcementsApi } from '../services/api';

const formatDocSummary = (doc) => {
  const reqs = Array.isArray(doc.requirements)
    ? doc.requirements.map((r) => `- ${r}`).join('\n')
    : doc.requirements;
  const steps = Array.isArray(doc.procedure)
    ? doc.procedure.map((s, i) => `${i + 1}. ${s}`).join('\n')
    : doc.procedure;
  return `Here is the ${doc.title} information:\n\nRequirements:\n${reqs}\n\nProcedure:\n${steps}`;
};

// Stop words that shouldn't count as meaningful matches
const STOP_WORDS = new Set(['of', 'the', 'a', 'an', 'to', 'for', 'and', 'or', 'in', 'on', 'at', 'how', 'get', 'i', 'my', 'is', 'what']);

const detectDoc = (text, docs) => {
  const inputWords = text.toLowerCase().split(/\s+/).filter((w) => !STOP_WORDS.has(w));
  if (inputWords.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const doc of docs) {
    const titleWords = doc.title.toLowerCase().split(/\s+/).filter((w) => !STOP_WORDS.has(w));
    // Count how many meaningful title words appear in the input
    const matches = titleWords.filter((word) => inputWords.some((iw) => iw.includes(word) || word.includes(iw)));
    const score = matches.length / titleWords.length;
    // Require at least 50% of meaningful title words to match
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestMatch = doc;
    }
  }

  return bestMatch;
};

const getBotResponse = (text, docs, announcements) => {
  const lower = text.toLowerCase();

  // Greetings
  if (/\b(hi|hello|hey)\b/.test(lower)) {
    return 'Hi there! Ask me about enrollment, documents, requirements, or the latest announcements.';
  }

  // Announcements intent
  if (lower.includes('announcement') || lower.includes('news') || lower.includes('update') || lower.includes('notice')) {
    if (announcements.length === 0) {
      return 'There are no announcements at the moment. Check back later.';
    }
    const latest = announcements.slice(0, 3);
    const list = latest.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
    return `Here are the latest announcements:\n\n${list}\n\nVisit the Announcements page for full details.`;
  }

  // Requirements list intent
  if (lower.includes('what documents') || lower.includes('list of requirements') || lower.includes('available requirements')) {
    if (docs.length === 0) return 'No requirements are available right now.';
    const list = docs.map((d, i) => `${i + 1}. ${d.title}`).join('\n');
    return `Here are the available documents/requirements:\n\n${list}\n\nAsk me about any specific one for details.`;
  }

  // Specific document match
  const doc = detectDoc(text, docs);
  if (doc) return formatDocSummary(doc);

  // Login / portal
  if (lower.includes('login') || lower.includes('portal') || lower.includes('access')) {
    return 'Use your student credentials to log in. If you forgot your password, use the "Forgot Password" option on the login page.';
  }

  // Fallback
  const docNames = docs.map((d) => d.title).join(', ');
  return `I can help with requirements and announcements. Available documents: ${docNames || 'none yet'}. Ask me about any of them.`;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Welcome to eGuide ICCT! How can I help you navigate your academic requirements today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef(null);
  const MESSAGE_LIMIT = 30;

  // Fetch live data when chatbot opens for the first time
  useEffect(() => {
    if (isOpen && !dataLoaded) {
      Promise.all([
        requirementsApi.getAll().catch(() => ({ data: [] })),
        announcementsApi.getAll().catch(() => ({ data: [] }))
      ]).then(([reqRes, annRes]) => {
        // Strip _id and internal fields — only keep what the chatbot needs to display
        const safeDocs = (reqRes.data || []).map(({ title, requirements, procedure }) => ({
          title,
          requirements,
          procedure,
        }));
        const safeAnnouncements = (annRes.data || []).map(({ title }) => ({ title }));
        setDocs(safeDocs);
        setAnnouncements(safeAnnouncements);
        setDataLoaded(true);
      });
    }
  }, [isOpen, dataLoaded]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Sanitize: strip HTML tags and limit length
    const trimmed = input.trim().replace(/<[^>]*>/g, '').slice(0, 300);
    if (!trimmed) return;

    // Rate limit: cap messages per session
    if (messageCount >= MESSAGE_LIMIT) {
      setMessages((prev) => [...prev, {
        text: 'You have reached the message limit for this session. Please refresh the page to continue.',
        sender: 'bot'
      }]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, { text: trimmed, sender: 'user' }]);
    setMessageCount((c) => c + 1);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const botText = getBotResponse(trimmed, docs, announcements);
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
            Ask about Enrollment, Requirements, or Announcements.
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8f9fa] dark:bg-[#0a0a0a]">
            {!dataLoaded && isOpen && (
              <div className="text-center text-xs text-gray-400 italic">Loading latest data...</div>
            )}
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

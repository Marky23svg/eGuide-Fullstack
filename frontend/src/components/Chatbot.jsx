import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiSendPlaneFill } from 'react-icons/ri';
import { CgClose } from 'react-icons/cg';
import { MdSearch, MdDescription, MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { chatbot as chatbotApi } from '../services/api';

// ── Component ─────────────────────────────────────────────────────────────────

const MESSAGE_LIMIT = 30;
const CARD_HEIGHT = 'min(520px, calc(85vh - 120px))';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: 'Welcome to eGuide ICCT! How can I help you navigate your academic requirements today?',
      sender: 'bot',
      requirementSources: [],
      correctedInterpretation: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim().replace(/<[^>]*>/g, '').slice(0, 300);

    if (!trimmed) return;

    if (messageCount >= MESSAGE_LIMIT) {
      setMessages((prev) => [
        ...prev,
        { text: 'You have reached the message limit for this session. Please refresh to continue.', sender: 'bot', requirementSources: [], correctedInterpretation: null },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, { text: trimmed, sender: 'user', requirementSources: [] }]);
    setMessageCount((c) => c + 1);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotApi.ask(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          text: response.answer || 'I could not find a useful answer for that query.',
          sender: 'bot',
          requirementSources: response.requirementSources || [],
          correctedInterpretation: response.correctedInterpretation || null,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'I am having trouble reaching the knowledge base right now. Please try again in a moment.',
          sender: 'bot',
          requirementSources: [],
          correctedInterpretation: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = (requirementId) => {
    setIsOpen(false);
    navigate(`/requirements?highlight=${requirementId}`, {
      state: { highlightId: requirementId },
      replace: false,
    });
  };

  return (
    <>
      {/* ── CLOSED: bouncing icon ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chatbot-icon"
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 },
            }}
            whileHover={{ scale: 1.1 }}
            style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <img src="/icon_chatbot.png" alt="Chat" style={{ width: '130px', height: '130px', objectFit: 'contain', display: 'block' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── OPEN: robot + flap + card ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbot-open"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 50,
              width: 'min(360px, calc(100vw - 32px))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Robot row */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              flexShrink: 0,
              position: 'relative',
              height: '100px',
            }}>
              <div style={{
                overflow: 'hidden',
                height: '100px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                position: 'absolute',
                top: '20px',
              }}>
                <motion.img
                  src="/body_top_peeking.png"
                  alt="Robot"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '110px', pointerEvents: 'none', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}
                />
              </div>
              <img
                src="/flap_top_peeking.png"
                alt="Robot hand"
                style={{
                  width: '70px',
                  position: 'absolute',
                  bottom: '-20px',
                  left: 'calc(40% + 20px)',
                  pointerEvents: 'none',
                  zIndex: 53,
                }}
              />
            </div>

            {/* Chat card */}
            <div
              style={{ width: '100%', height: CARD_HEIGHT, position: 'relative' }}
              className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-[#1a73e8] to-[#0d47a1] text-white flex items-center justify-between flex-shrink-0 rounded-t-2xl">
                <div>
                  <div className="text-sm font-bold">eGuide Assistant</div>
                  <div className="text-[10px] mt-1 flex items-center gap-1.5">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                      <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
                    </div>
                    <span className="text-green-300 font-medium drop-shadow-[0_0_3px_#22c55e]">Always Online</span>
                  </div>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/10" aria-label="Close chat">
                  <CgClose className="text-xl" />
                </button>
              </div>

              {/* Sub-header */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 text-[11px] text-blue-700 dark:text-blue-300 text-center border-b border-blue-100 dark:border-blue-900/30 flex-shrink-0">
                Ask about Document processes, announcements, and more!
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f8f9fa] dark:bg-[#0a0a0a]">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                    {/* "Did you mean?" correction pill — shown above the bubble */}
                    {msg.sender === 'bot' && msg.correctedInterpretation && (
                      <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] text-amber-700 max-w-[85%]">
                        <span><MdSearch size={13} /></span>
                        <span>
                          Did you mean: <span className="font-semibold">{msg.correctedInterpretation}</span>?
                        </span>
                      </div>
                    )}

                    {/* Bubble */}
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

                    {/* "View Document" buttons — only for bot messages with requirement sources */}
                    {msg.sender === 'bot' && msg.requirementSources?.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-2 max-w-[85%]">
                        {/* Deduplicate by title before rendering */}
                        {[...new Map(msg.requirementSources.map((s) => [s.title.trim().toLowerCase(), s])).values()].map((src) => (
                          <button
                            key={`${src.id}-${src.title}`}
                            type="button"
                            onClick={() => handleViewDocument(src.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                          >
                            <span><MdDescription size={14} /></span>
                            <span className="truncate">View: {src.title}</span>
                            <span className="ml-auto"><MdArrowForward size={14} /></span>
                          </button>
                        ))}
                      </div>
                    )}
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

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-gray-300 dark:border-zinc-800 flex-shrink-0 rounded-b-2xl">
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
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;

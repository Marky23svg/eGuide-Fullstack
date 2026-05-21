import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import icctLogo from '../assets/Icctlogo.webp'
import { MdMenu, MdClose } from 'react-icons/md'
import { FiLogOut } from 'react-icons/fi'

// ─── STYLES ──────────────────────────────────────────────────
const NAV_TEXT_STYLE = {
  color:      '#ffffff',
  fontWeight: '700',
  textShadow: '0 1px 12px rgba(0,0,0,0.7), 0 0px 3px rgba(0,0,0,0.55)',
  transition: 'opacity 0.2s ease',
}

const NAV_SUBTEXT_STYLE = {
  color:      'rgba(255,255,255,0.75)',
  fontWeight: '600',
  textShadow: '0 1px 8px rgba(0,0,0,0.6)',
}

const CARD_TRANSITION = [
  'width 0.3s cubic-bezier(0.4,0,0.2,1)',
  'height 0.3s cubic-bezier(0.4,0,0.2,1)',
  'border-radius 0.3s ease',
  'background 0.2s ease',
  'box-shadow 0.3s ease',
].join(', ')

// Separate Mobile Menu Panel Component
function MobileMenuPanel({ isOpen, onClose, navigate, userName, userEmail, userInitial, handleLogout }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay - higher z-index */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Menu panel - very high z-index to be above chatbot */}
          <motion.div
            className="fixed top-0 right-0 h-full w-72 z-[70] md:hidden overflow-y-auto"
            style={{
              backgroundColor: '#0f0f23',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex flex-col min-h-full" style={{ backgroundColor: '#16213e' }}>
              {/* Header row with profile and X button side by side */}
              <motion.div
                className="flex items-center justify-between px-5 pt-5 pb-4"
                style={{ backgroundColor: '#16213e' }}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{userName}</p>
                    <p className="text-gray-400 text-xs truncate">{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white transition-colors shrink-0"
                  aria-label="Close menu"
                >
                  <MdClose size={24} />
                </button>
              </motion.div>

              {/* Navigation links - below the profile row */}
              <div className="flex-1 px-5 pt-2" style={{ backgroundColor: '#16213e' }}>
                <motion.div
                  className="flex flex-col gap-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.15,
                      },
                    },
                  }}
                >
                  {[
                    { label: 'Home', path: '/home' },
                    { label: 'Announcement', path: '/announcements' },
                    { label: 'Documents', path: '/requirements' },
                  ].map(({ label, path }) => (
                    <motion.div
                      key={path}
                      variants={{
                        hidden: { y: -20, opacity: 0 },
                        visible: { y: 0, opacity: 1 },
                      }}
                      transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <button
                        onClick={() => {
                          navigate(path)
                          onClose()
                        }}
                        className="w-full text-left text-white/90 hover:text-white text-base font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200"
                      >
                        {label}
                      </button>
                    </motion.div>
                  ))}
                  
                  {/* Logout button */}
                  <motion.div
                    variants={{
                      hidden: { y: -20, opacity: 0 },
                      visible: { y: 0, opacity: 1 },
                    }}
                    transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <button
                      onClick={() => {
                        handleLogout()
                        onClose()
                      }}
                      className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 text-base font-semibold py-3 px-4 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                    >
                      <FiLogOut size={18} /> Log Out
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isFixed, setIsFixed] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const [isDark, setIsDark] = useState(location.pathname === '/home')
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const hideTimer = useRef(null)
  const scrolledRef = useRef(false)
  const profileRef = useRef(null)
  const profileOpenRef = useRef(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const closeMobile = useCallback(() => setMobileMenuOpen(false), [])
  const openMobile = useCallback(() => setMobileMenuOpen(true), [])

  useEffect(() => { profileOpenRef.current = profileOpen }, [profileOpen])

  // Close mobile menu on scroll
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleScroll = () => setMobileMenuOpen(false)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  useEffect(() => {
    const isHeroPage = location.pathname === '/home'
    setIsFixed(false)
    setNavVisible(true)
    setIsDark(isHeroPage)
    setMobileMenuOpen(false)
    if (!isHeroPage) return
    setTimeout(() => {
      let dark = true
      document.querySelectorAll('[data-nav="light"]').forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= 80 && r.bottom >= 80) dark = false
      })
      setIsDark(dark)
    }, 50)
  }, [location.pathname])

  useEffect(() => {
    const checkDark = () => {
      let dark = true
      document.querySelectorAll('[data-nav="light"]').forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= 80 && r.bottom >= 80) dark = false
      })
      setIsDark(dark)
    }

    const handleScroll = () => {
      const past = window.scrollY > 64
      scrolledRef.current = past
      setIsFixed(past)
      setNavVisible(!past)

      if (window.location.pathname === '/home') {
        let dark = true
        document.querySelectorAll('[data-nav="light"]').forEach((s) => {
          const r = s.getBoundingClientRect()
          if (r.top <= 80 && r.bottom >= 80) dark = false
        })
        document.querySelectorAll('[data-nav="dark"]').forEach((s) => {
          const r = s.getBoundingClientRect()
          if (r.top <= 80 && r.bottom >= 80) dark = true
        })
        setIsDark(dark)
      } else {
        const header = document.querySelector('[data-nav="dark"]')
        const headerBottom = header ? header.getBoundingClientRect().bottom : 200
        setIsDark(headerBottom > 80)
      }
    }

    const handleMouseMove = (e) => {
      if (!scrolledRef.current) return
      if (e.clientY < 80) {
        clearTimeout(hideTimer.current)
        setNavVisible(true)
      } else {
        if (profileOpenRef.current) return
        clearTimeout(hideTimer.current)
        hideTimer.current = setTimeout(() => setNavVisible(false), 500)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    setTimeout(checkDark, 50)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const cardStyle = {
    top: '15px',
    right: '16px',
    width: profileOpen ? '228px' : '40px',
    height: profileOpen ? '112px' : '40px',
    borderRadius: profileOpen ? '20px' : '50%',
    background: profileOpen ? 'rgba(255,255,255,0.94)' : 'rgba(37,99,235,0.95)',
    backdropFilter: profileOpen ? 'blur(20px) saturate(180%)' : 'none',
    boxShadow: profileOpen 
      ? '0 8px 32px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)' 
      : '0 2px 14px rgba(37,99,235,0.45)',
    overflow: 'hidden',
    cursor: profileOpen ? 'default' : 'pointer',
    zIndex: 200,
    direction: 'rtl',
    transition: CARD_TRANSITION,
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = user.name || 'Guest'
  const userEmail = user.email || 'guest@icct.edu.ph'
  const userInitial = (userName.charAt(0) || 'U').toUpperCase()

  const NavContent = () => (
    <nav className="w-full overflow-hidden md:overflow-visible">
      {/* Top bar */}
      <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="hidden md:flex items-center gap-10">
          <NavLinks navigate={navigate} />
          <div className="w-12 h-10 shrink-0" />
        </div>
        {/* Menu Button - only visible on mobile - triggers the separate menu panel */}
        <button
          className="md:hidden p-2"
          style={{ color: '#fff', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}
          onClick={openMobile}
          aria-label="Open menu"
        >
          <MdMenu size={24} />
        </button>
      </div>
    </nav>
  )

  return (
    <>
      {/* Separate Mobile Menu Panel - not inside navbar */}
      <MobileMenuPanel 
        isOpen={mobileMenuOpen}
        onClose={closeMobile}
        navigate={navigate}
        userName={userName}
        userEmail={userEmail}
        userInitial={userInitial}
        handleLogout={handleLogout}
      />

      {/* Absolute Navbar (Static at top) — hidden on mobile once scrolled */}
      <div 
        className="absolute top-0 left-0 w-full z-40 md:block hidden"
        style={{
          background: 'transparent',
          opacity: isFixed ? 0 : 1,
          pointerEvents: isFixed ? 'none' : 'auto',
        }}
      >
        <NavContent />
      </div>

      {/* Fixed Navbar — desktop: hover to show, mobile: always visible */}
      <div 
        className="fixed top-0 left-0 w-full z-40 bg-gray-950"
        style={{
          transform: (isFixed && navVisible) ? 'translateY(0)' : 'translateY(-120%)',
          opacity: (isFixed && navVisible) ? 1 : 0,
          pointerEvents: (isFixed && navVisible) ? 'auto' : 'none',
          transition: (isFixed && navVisible)
            ? 'transform 250ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease'
            : 'transform 400ms cubic-bezier(0.4,0,0.2,1), opacity 550ms ease',
        }}
        // desktop only — mobile uses the one below
      >
        <div className="hidden md:block"><NavContent /></div>
      </div>

      {/* Mobile-only static navbar — always fixed at top */}
      <div className="fixed top-0 left-0 w-full z-40 bg-gray-950 md:hidden">
        <NavContent />
      </div>

      {/* Profile card — desktop only */}
      <div ref={profileRef}>
        {!isFixed && (
          <div
            onClick={() => !profileOpen && setProfileOpen(true)}
            style={{ 
              position: 'absolute', 
              ...cardStyle,
              opacity: 1,
              transition: CARD_TRANSITION,
            }}
            className="hidden md:block"
          >
            <CardContent profileOpen={profileOpen} onLogout={handleLogout} onClose={() => setProfileOpen(false)} />
          </div>
        )}
        {isFixed && (
          <div
            onClick={() => !profileOpen && setProfileOpen(true)}
            style={{
              position: 'fixed',
              ...cardStyle,
              transform: navVisible ? 'translateY(0)' : 'translateY(-300%)',
              opacity: navVisible ? 1 : 0,
              pointerEvents: navVisible ? 'auto' : 'none',
              transition: `${CARD_TRANSITION}, ${
                navVisible 
                  ? 'transform 300ms ease, opacity 250ms ease' 
                  : 'transform 600ms ease, opacity 550ms ease'
              }`,
            }}
            className="hidden md:block"
          >
            <CardContent profileOpen={profileOpen} onLogout={handleLogout} onClose={() => setProfileOpen(false)} />
          </div>
        )}
      </div>
    </>
  )
}

function CardContent({ profileOpen, onLogout, onClose }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = user.name || 'Guest'
  const userEmail = user.email || 'guest@icct.edu.ph'
  const userInitial = (userName.charAt(0) || 'U').toUpperCase()

  return (
    <>
      <div
        style={{
          position:       'absolute',
          top:            profileOpen ? '12px' : '0px',
          left:           profileOpen ? '12px' : '0px',
          width:          '40px',
          height:         '40px',
          borderRadius:   '50%',
          background:     profileOpen ? 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' : 'transparent',
          color:          '#fff',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontWeight:     '700',
          fontSize:       '15px',
          letterSpacing:  '0.03em',
          transform:      profileOpen ? 'rotate(-360deg)' : 'rotate(0deg)',
          transition:     'top 0.42s cubic-bezier(0.4,0,0.2,1), left 0.42s cubic-bezier(0.4,0,0.2,1), background 0.2s ease, transform 0.4s ease',
          zIndex:         2,
          userSelect:     'none',
        }}
      >
        {userInitial}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        style={{
          position:       'absolute',
          top:            '10px',
          right:          '10px',
          width:          '22px',
          height:         '22px',
          borderRadius:   '50%',
          background:     'rgba(0,0,0,0.07)',
          border:         'none',
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '9px',
          color:          '#6b7280',
          opacity:        profileOpen ? 1 : 0,
          pointerEvents:  profileOpen ? 'auto' : 'none',
          transition:     'opacity 0.2s ease 0.15s',
          zIndex:         3,
        }}
        aria-label="Close"
      >
        ✕
      </button>

      <div
        style={{
          position:   'absolute',
          top:        '14px',
          left:       '60px',
          right:      '32px',
          direction:  'ltr',
          textAlign:  'left',
          opacity:    profileOpen ? 1 : 0,
          transform:  profileOpen ? 'translateX(0)' : 'translateX(20px)',
          transition: profileOpen ? 'opacity 0.2s ease 0.2s' : 'opacity 0.05s ease',
          pointerEvents: 'none',
        }}
      >
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
          {userName}
        </p>
        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {userEmail}
        </p>
      </div>

      <div
        style={{
          position:      'absolute',
          bottom:        0,
          left:          0,
          right:         0,
          direction:     'ltr',
          borderTop:     '1px solid rgba(0,0,0,0.07)',
          opacity:       profileOpen ? 1 : 0,
          transition:    profileOpen ? 'opacity 0.2s ease 0.25s' : 'opacity 0.05s ease',
          pointerEvents: profileOpen ? 'auto' : 'none',
        }}
      >
        <button
          onClick={onLogout}
          style={{
            width:          '100%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '5px',
            padding:        '9px 16px',
            fontSize:       '11px',
            fontWeight:     '600',
            color:          '#f87171',
            background:     'transparent',
            border:         'none',
            cursor:         'pointer',
            letterSpacing:  '0.05em',
            transition:     'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent';           e.currentTarget.style.color = '#f87171' }}
        >
          <FiLogOut size={11} /> LOG OUT
        </button>
      </div>
    </>
  )
}

function NavLogo() {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={icctLogo} 
        alt="ICCT Logo" 
        className="h-12 w-12 rounded-full object-cover border-2 border-white/30" 
        style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.3))' }}
      />
      <div className="flex flex-col leading-none">
        <span
          style={{
            ...NAV_TEXT_STYLE,
            fontFamily:    'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
            fontSize:      '1.6rem',
            letterSpacing: '0.08em',
            lineHeight:    1,
          }}
        >
          ICCT
        </span>
        <span
          style={{
            ...NAV_SUBTEXT_STYLE,
            fontFamily:    'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
            fontSize:      '0.8rem',
            letterSpacing: '0.05em',
            lineHeight:    1,
            textTransform: 'uppercase',
          }}
        >
          COLLEGES
        </span>
      </div>
    </div>
  )
}

function NavLinks({ navigate, onNavigate }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
      {[
        { label: 'Home',         path: '/home' },
        { label: 'Announcement', path: '/announcements' },
        { label: 'Documents',    path: '/requirements' },
      ].map(({ label, path }) => (
        <span
          key={path}
          onClick={() => { navigate(path); onNavigate?.() }}
          style={{
            ...NAV_TEXT_STYLE,
            fontSize:      '0.7rem',
            letterSpacing: '0.2em',
            cursor:        'pointer',
            textTransform: 'uppercase',
          }}
          className="hover:opacity-70 transition-opacity"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export default Navbar
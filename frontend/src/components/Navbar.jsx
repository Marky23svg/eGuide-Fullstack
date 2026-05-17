import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import icctLogo from '../assets/Icctlogo.webp'
import { MdMenu, MdClose } from 'react-icons/md'
import { FiLogOut } from 'react-icons/fi'

// ─── STYLES FROM NAVBAR2 ──────────────────────────────────────────────────
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

// Keeping the original pill transition timing configuration untouched
const CARD_TRANSITION = [
  'width 0.3s cubic-bezier(0.4,0,0.2,1)',
  'height 0.3s cubic-bezier(0.4,0,0.2,1)',
  'border-radius 0.3s ease',
  'background 0.2s ease',
  'box-shadow 0.3s ease',
].join(', ')

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

  // Design from Navbar2 profiles card configuration
  const cardStyle = {
    top: '10px',
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
        <button
          className="md:hidden p-2"
          style={{ color: '#fff', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>

      {/* Mobile expandable */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            className="md:hidden overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              className="px-6 pb-5 flex flex-col gap-4 border-t border-white/10"
              initial={{ y: -12 }}
              animate={{ y: 0 }}
              exit={{ y: -12 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* User info */}
              <div className="flex items-center gap-3 pt-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {userInitial}
                </div>
                <div>
                  <p style={{ ...NAV_TEXT_STYLE, fontSize: '14px' }}>{userName}</p>
                  <p style={{ ...NAV_SUBTEXT_STYLE, fontSize: '12px' }}>{userEmail}</p>
                </div>
              </div>

              <NavLinks navigate={navigate} onNavigate={closeMobile} />

              <div className="border-t border-white/10 pt-3">
                <button
                  onClick={() => { handleLogout(); closeMobile() }}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm py-2"
                >
                  <FiLogOut size={16} /> Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )

  return (
    <>
      {/* Absolute Navbar (Static at top) */}
      <div 
        className="absolute top-0 left-0 w-full z-50"
        style={{
          background: 'transparent',
          opacity: isFixed ? 0 : 1,
          pointerEvents: isFixed ? 'none' : 'auto',
          transition: 'opacity 250ms ease',
        }}
      >
        <NavContent />
      </div>

      {/* Fixed Navbar (Slides down perfectly when header is passed) */}
      <div 
        className="fixed top-0 left-0 w-full z-50"
        style={{
          background: 'transparent',
          transform: (isFixed && navVisible) ? 'translateY(0)' : 'translateY(-120%)',
          opacity: (isFixed && navVisible) ? 1 : 0,
          pointerEvents: (isFixed && navVisible) ? 'auto' : 'none',
          transition: (isFixed && navVisible)
            ? 'transform 320ms cubic-bezier(0.4,0,0.2,1), opacity 250ms ease'
            : 'transform 550ms cubic-bezier(0.4,0,0.2,1), opacity 550ms ease',
        }}
      >
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
              opacity: navVisible ? 1 : 0, // Adds smooth fade effect synchronized to look-away state
              pointerEvents: navVisible ? 'auto' : 'none',
              // Integrates the exact same opacity ease-timings used by the navigation bar wrapper
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
            fontSize:      '1.5rem',
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
            fontSize:      '0.7rem',
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
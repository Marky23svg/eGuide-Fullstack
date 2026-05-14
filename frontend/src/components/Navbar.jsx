import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import icctLogo from '../assets/Icctlogo.webp'
import { MdMenu, MdClose } from 'react-icons/md'
import { FiLogOut } from 'react-icons/fi'

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

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const subTextColor = isDark ? 'text-white/60' : 'text-gray-500'

  const cardStyle = {
    top: '8px',
    right: '16px',
    width: profileOpen ? '260px' : '44px',
    height: profileOpen ? '100px' : '44px',
    borderRadius: profileOpen ? '16px' : '50%',
    background: profileOpen ? 'white' : 'transparent',
    boxShadow: profileOpen ? '0 8px 40px rgba(0,0,0,0.15)' : 'none',
    overflow: 'hidden',
    cursor: profileOpen ? 'default' : 'pointer',
    zIndex: 200,
    direction: 'rtl',
    transition: CARD_TRANSITION,
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = user.name || 'Guest'
  const userEmail = user.email || 'guest@icct.edu.ph'
  const userInitial = userName.charAt(0) || 'U'

  // Shared nav background
  const navBg = isDark
    ? 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3))'
    : 'rgba(255,255,255,0.95)'
  const fixedNavBg = isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.98)'

  // The expanding navbar content — top bar + collapsible section
  const NavContent = ({ bg, isFixedNav }) => (
    <nav
      className="w-full overflow-hidden md:overflow-visible"
      style={{
        background: bg,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        ...(isFixedNav && {
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: navVisible ? 1 : 0,
          transition: navVisible
            ? 'opacity 300ms ease, transform 300ms ease'
            : 'opacity 600ms ease, transform 600ms ease',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }),
      }}
    >
      {/* Top bar — always visible */}
      <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
        <NavLogo textColor={textColor} subTextColor={subTextColor} />
        <div className="hidden md:flex items-center gap-10">
          <NavLinks textColor={textColor} navigate={navigate} />
          <div className="w-10 h-10" />
        </div>
        <button
          className={`md:hidden p-2 ${textColor}`}
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>

      {/* Expandable section — grows the navbar height on mobile */}
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
              className={`px-6 pb-5 flex flex-col gap-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}
              initial={{ y: -12 }}
              animate={{ y: 0 }}
              exit={{ y: -12 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
          {/* User info */}
          <div className="flex items-center gap-3 pt-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {userInitial}
            </div>
            <div>
              <p className={`${textColor} text-sm font-semibold`}>{userName}</p>
              <p className={`${subTextColor} text-xs`}>{userEmail}</p>
            </div>
          </div>

          {/* Nav links */}
          <NavLinks textColor={textColor} navigate={navigate} onNavigate={closeMobile} />

          {/* Actions */}
          <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-100'} pt-3 flex flex-col gap-1`}>
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
      {/* Absolute navbar — visible before scroll */}
      {!isFixed && (
        <div className="absolute top-0 left-0 w-full z-50">
          <NavContent bg={navBg} isFixedNav={false} />
        </div>
      )}

      {/* Fixed navbar — slides in on hover after scroll */}
      {isFixed && (
        <div className="fixed top-0 left-0 w-full z-50">
          <NavContent bg={fixedNavBg} isFixedNav={true} />
        </div>
      )}

      {/* Profile card — desktop only */}
      <div ref={profileRef}>
        {!isFixed && (
          <div
            onClick={() => !profileOpen && setProfileOpen(true)}
            style={{ position: 'absolute', ...cardStyle }}
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
              pointerEvents: navVisible ? 'auto' : 'none',
              transition: `${CARD_TRANSITION}, ${navVisible ? 'transform 300ms ease' : 'transform 900ms ease'}`,
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
  const userInitial = userName.charAt(0) || 'U'

  return (
    <>
      <div
        style={{
          position: 'relative', top: '4px',
          right: profileOpen ? '210px' : '2px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: profileOpen ? '#111827' : '#2563eb',
          color: 'white', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 'bold', fontSize: '14px',
          transform: profileOpen ? 'rotate(-360deg)' : 'rotate(0deg)',
          transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.4s ease, background 0.2s ease',
          zIndex: 2,
        }}
      >
        {userInitial}
      </div>
      {/* X close button — only visible when open */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: profileOpen ? 1 : 0,
          pointerEvents: profileOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease 0.15s',
          zIndex: 3,
          color: '#9ca3af',
        }}
        aria-label="Close"
      >
        ✕
      </button>
      <div
        style={{
          position: 'absolute', top: '8px', left: '55px', 
          direction: 'ltr', textAlign: 'left',
          padding: '2px',
          opacity: profileOpen ? 1 : 0,
          transform: profileOpen ? 'translateX(0)' : 'translateX(20px)',
          transition: profileOpen ? 'opacity 0.2s ease 0.2s' : 'opacity 0.05s ease',
          width:'100%',
          height:'50px',
        }}
      >
        <p className="text-sm font-bold text-gray-800 leading-tight whitespace-nowrap">{userName}</p>

        <p className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{userEmail}</p>
      </div>
      <div
        style={{
          position: 'absolute', bottom: 10, left: 0, right: 0,
          direction: 'ltr', borderTop: '1px solid #f3f4f6',
          opacity: profileOpen ? 1 : 0,
          transition: profileOpen ? 'opacity 0.2s ease 0.25s' : 'opacity 0.05s ease',
        }}
      >
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-1 text-xs text-red-400 hover:bg-red-50 transition"
        >
          <FiLogOut size={11} /> Log Out
        </button>
      </div>
    </>
  )
}

function NavLogo({ textColor, subTextColor }) {
  return (
    <div className="flex items-center gap-3">
      <img src={icctLogo} alt="ICCT Logo" className="h-12 w-12 rounded-full object-cover border-2 border-white/30" />
      <div className="flex flex-col leading-none">
        <span
          className={`text-2xl block ${textColor}`}
          style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.08em', lineHeight: 1 }}
        >
          ICCT
        </span>
        <span
          className={`text-xs uppercase block ${subTextColor}`}
          style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.05em', lineHeight: 1 }}
        >
          COLLEGES
        </span>
      </div>
    </div>
  )
}

function NavLinks({ textColor, navigate, onNavigate }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
      <span
        onClick={() => { navigate('/home'); onNavigate?.() }}
        className={`text-xs uppercase hover:opacity-70 transition cursor-pointer ${textColor}`}
        style={{ letterSpacing: '0.2em' }}
      >
        Home
      </span>
      <span
        onClick={() => { navigate('/announcements'); onNavigate?.() }}
        className={`text-xs uppercase hover:opacity-70 transition cursor-pointer ${textColor}`}
        style={{ letterSpacing: '0.2em' }}
      >
        Announcement
      </span>
      <span
        onClick={() => { navigate('/requirements'); onNavigate?.() }}
        className={`text-xs uppercase hover:opacity-70 transition cursor-pointer ${textColor}`}
        style={{ letterSpacing: '0.2em' }}
      >
        Documents
      </span>
    </div>
  )
}

export default Navbar

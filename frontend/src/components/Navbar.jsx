import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import icctLogo from '../assets/Icctlogo.png'

function Navbar() {
  const navigate = useNavigate()

  const [isFixed, setIsFixed] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const hideTimer = useRef(null)
  const scrolledRef = useRef(false)
  const profileRef = useRef(null)
  const profileOpenRef = useRef(false)

  useEffect(() => {
    profileOpenRef.current = profileOpen
  }, [profileOpen])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 64) {
        scrolledRef.current = true
        setIsFixed(true)
        setNavVisible(false)
      } else {
        scrolledRef.current = false
        setIsFixed(false)
        setNavVisible(true)
      }

      const lightSections = document.querySelectorAll('[data-nav="light"]')
      const darkSections = document.querySelectorAll('[data-nav="dark"]')
      let currentlyDark = true
      lightSections.forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= 80 && r.bottom >= 80) currentlyDark = false
      })
      darkSections.forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= 80 && r.bottom >= 80) currentlyDark = true
      })
      setIsDark(currentlyDark)
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

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const subTextColor = isDark ? 'text-white/60' : 'text-gray-500'
  const navBg = isDark ? 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)' : 'transparent'

  const baseCardStyle = {
    top: '8px',
    right: '32px',
    width: profileOpen ? '200px' : '44px',
    height: profileOpen ? '100px' : '44px',
    borderRadius: profileOpen ? '16px' : '50%',
    background: profileOpen ? 'white' : 'transparent',
    boxShadow: profileOpen ? '0 8px 40px rgba(0,0,0,0.15)' : 'none',
    overflow: 'hidden',
    cursor: profileOpen ? 'default' : 'pointer',
    zIndex: 200,
    // card grows to the left so icon on right stays visible
    direction: 'rtl',
    transition: [
      'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      'height 0.3s cubic-bezier(0.4,0,0.2,1)',
      'border-radius 0.3s ease',
      'background 0.2s ease',
      'box-shadow 0.3s ease',
    ].join(', '),
  }

  return (
    <>
      {/* Absolute navbar */}
      {!isFixed && (
        <div className="absolute top-0 left-0 w-full z-50">
          <nav className="w-full px-8 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}
          >
            <NavLogo textColor="text-white" subTextColor="text-white/60" />
            <div className="flex items-center gap-10">
              <NavLinks textColor="text-white" navigate={navigate} />
              <div className="w-10 h-10" />
            </div>
          </nav>
        </div>
      )}

      {/* Fixed navbar */}
      {isFixed && (
        <div className="fixed top-0 left-0 w-full z-50">
          <nav
            className={`w-full px-8 py-3 flex items-center justify-between ${navVisible ? '' : 'pointer-events-none'}`}
            style={{
              background: navBg,
              transition: navVisible ? 'opacity 300ms ease, transform 300ms ease' : 'opacity 600ms ease, transform 600ms ease',
              transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
              opacity: navVisible ? 1 : 0,
            }}
          >
            <NavLogo textColor={textColor} subTextColor={subTextColor} />
            <div className="flex items-center gap-10">
              <NavLinks textColor={textColor} navigate={navigate} />
              <div className="w-10 h-10" />
            </div>
          </nav>
        </div>
      )}

      {/* Profile card */}
      <div ref={profileRef}>

        {/* Variant 1 — absolute, scrolls with page, slides up when leaving */}
        {!isFixed && (
          <div
            onClick={() => !profileOpen && setProfileOpen(true)}
            style={{
              position: 'absolute',
              ...baseCardStyle,
              transition: [
                'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                'height 0.3s cubic-bezier(0.4,0,0.2,1)',
                'border-radius 0.3s ease',
                'background 0.2s ease',
                'box-shadow 0.3s ease',
              ].join(', '),
            }}
          >
            <CardContent profileOpen={profileOpen} navigate={navigate} />
          </div>
        )}

        {/* Variant 2 — fixed, slides down on hover exactly like navbar */}
        {isFixed && (
          <div
            onClick={() => !profileOpen && setProfileOpen(true)}
            style={{
              position: 'fixed',
              ...baseCardStyle,
              transform: navVisible ? 'translateY(0)' : 'translateY(-300%)',
              opacity: 1,
              pointerEvents: navVisible ? 'auto' : 'none',
              transition: [
                'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                'height 0.3s cubic-bezier(0.4,0,0.2,1)',
                'border-radius 0.3s ease',
                'background 0.2s ease',
                'box-shadow 0.3s ease',
                navVisible
                  ? 'transform 300ms ease'
                  : 'transform 900ms ease',
              ].join(', '),
            }}
          >
            <CardContent profileOpen={profileOpen} navigate={navigate} />
          </div>
        )}

      </div>
    </>
  )
}

function CardContent({ profileOpen, navigate }) {
  return (
    <>
      {/* Icon — slides from right to left when card opens */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: profileOpen ? '155px' : '2px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: profileOpen ? '#111827' : '#2563eb',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          transform: profileOpen ? 'rotate(-360deg)' : 'rotate(0deg)',
          transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.4s ease, background 0.2s ease',
          zIndex: 2,
        }}
      >
        P
      </div>

      {/* Name + email — slides in from left */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '10px',
          right: '10px',
          direction: 'ltr',
          textAlign: 'center',
          opacity: profileOpen ? 1 : 0,
          transform: profileOpen ? 'translateX(0)' : 'translateX(20px)',
          transition: profileOpen ? 'opacity 0.2s ease 0.2s' : 'opacity 0.05s ease',
        }}
      >
        <p className="text-sm font-bold text-gray-800 leading-tight whitespace-nowrap">Juan Dela Cruz</p>
        <p className="text-xs text-gray-400 whitespace-nowrap mt-0.5">juan@icct.edu.ph</p>
      </div>

      {/* Buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          direction: 'ltr',
          textAlign: 'center',
          borderTop: '1px solid #f3f4f6',
          opacity: profileOpen ? 1 : 0,
          transition: profileOpen ? 'opacity 0.2s ease 0.25s' : 'opacity 0.05s ease',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-4 py-1 text-xs text-gray-500 hover:bg-gray-50 transition text-left"
        >
          ⇄ Switch Account
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-4 py-1 text-xs text-red-400 hover:bg-red-50 transition text-left"
        >
          → Log Out
        </button>
      </div>
    </>
  )
}

function NavLogo({ textColor, subTextColor }) {
  return (
    <div className="flex items-center gap-3">
      <img src={icctLogo} alt="ICCT Logo" className="h-12 w-12 rounded-full object-cover border-2 border-white/30" />
      <div className="flex flex-col leading-none gap-0">
        <span className={`text-2xl block w-full ${textColor}`}
          style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.08em', lineHeight: '1' }}
        >
          ICCT
        </span>
        <span className={`text-xs uppercase block w-full ${subTextColor}`}
          style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.05em', lineHeight: '1' }}
        >
          COLLEGES
        </span>
      </div>
    </div>
  )
}

function NavLinks({ textColor, navigate }) {
  const isHomepage = window.location.pathname === '/home'

  return (
    <div className="flex items-center gap-10">
      <span
        onClick={() => isHomepage ? document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/home#announcements')}
        className={`text-xs uppercase hover:opacity-70 transition cursor-pointer ${textColor}`}
        style={{ letterSpacing: '0.2em' }}
      >
        Announcement
      </span>
      <span
        onClick={() => navigate('/requirements')}
        className={`text-xs uppercase hover:opacity-70 transition cursor-pointer ${textColor}`}
        style={{ letterSpacing: '0.2em' }}
      >
        Requirements
      </span>
    </div>
  )
}

export default Navbar

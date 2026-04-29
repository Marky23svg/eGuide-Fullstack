import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import icctLogo from '../assets/Icctlogo.png'

function Navbar() {
  const navigate = useNavigate()

  const [isFixed, setIsFixed] = useState(false)
  const [navVisible, setNavVisible] = useState(false)
  const [isDark, setIsDark] = useState(true) // true = white text, false = dark text
  const hideTimer = useRef(null)
  const scrolledRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 64) {
        scrolledRef.current = true
        setIsFixed(true)
        setNavVisible(false)
      } else {
        scrolledRef.current = false
        setIsFixed(false)
        setNavVisible(false)
      }

      // Detect which section is in view to switch navbar color
      const darkSections = document.querySelectorAll('[data-nav="dark"]')
      const lightSections = document.querySelectorAll('[data-nav="light"]')

      let currentlyDark = true

      lightSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 80 && rect.bottom >= 80) {
          currentlyDark = false
        }
      })

      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 80 && rect.bottom >= 80) {
          currentlyDark = true
        }
      })

      setIsDark(currentlyDark)
    }

    const handleMouseMove = (e) => {
      if (!scrolledRef.current) return
      if (e.clientY < 80) {
        clearTimeout(hideTimer.current)
        setNavVisible(true)
      } else {
        clearTimeout(hideTimer.current)
        hideTimer.current = setTimeout(() => setNavVisible(false), 500)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Text and bg colors based on section
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const subTextColor = isDark ? 'text-white/60' : 'text-gray-500'
  const avatarBg = isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
  const navBg = isDark
    ? 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)'
    : 'transparent'

  return (
    <>
      {/* Absolute navbar — scrolls with hero */}
      {!isFixed && (
        <div className="absolute top-0 left-0 w-full z-50">
          <nav
            className="w-full px-8 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}
          >
            <NavContent navigate={navigate} textColor="text-white" subTextColor="text-white/60" avatarBg="bg-white text-gray-900" />
          </nav>
        </div>
      )}

      {/* Fixed navbar — switches color based on section */}
      {isFixed && (
        <div className="fixed top-0 left-0 w-full z-50">
          <nav
            className={`w-full px-8 py-3 flex items-center justify-between ${
              navVisible ? '' : 'pointer-events-none'
            }`}
            style={{
              background: navBg,
              transition: navVisible
                ? 'opacity 300ms ease, transform 300ms ease'
                : 'opacity 600ms ease, transform 600ms ease',
              transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
              opacity: navVisible ? 1 : 0,
            }}
          >
            <NavContent
              navigate={navigate}
              textColor={textColor}
              subTextColor={subTextColor}
              avatarBg={avatarBg}
            />
          </nav>
        </div>
      )}
    </>
  )
}

function NavContent({ navigate, textColor, subTextColor, avatarBg }) {
  return (
    <>
      {/* Left — logo + ICCT COLLEGES */}
      <div className="flex items-center gap-3">
        <img
          src={icctLogo}
          alt="ICCT Logo"
          className="h-12 w-12 rounded-full object-cover border-2 border-white/30"
        />
        <div className="flex flex-col leading-none gap-0">
          <span
            className={`text-2xl block w-full ${textColor}`}
            style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.08em', lineHeight: '1' }}
          >
            ICCT
          </span>
          <span
            className={`text-xs uppercase block w-full ${subTextColor}`}
            style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.05em', lineHeight: '1' }}
          >
            COLLEGES
          </span>
        </div>
      </div>

      {/* Center-right — nav links */}
      <div className="flex items-center gap-10">
        <a
          href="#announcements"
          className={`text-xs uppercase hover:opacity-70 transition ${textColor}`}
          style={{ letterSpacing: '0.2em' }}
        >
          Announcement
        </a>
        <a
          href="#requirements"
          className={`text-xs uppercase hover:opacity-70 transition ${textColor}`}
          style={{ letterSpacing: '0.2em' }}
        >
          Requirements
        </a>

        {/* Profile avatar */}
        <button
          onClick={() => navigate('/')}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold hover:opacity-70 transition ${avatarBg}`}
        >
          P
        </button>
      </div>
    </>
  )
}

export default Navbar

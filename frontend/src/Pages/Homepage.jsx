import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import homepageBg from '../assets/Homepage.png'
import icctLogo from '../assets/Icctlogo.png'
import outerArrow from '../assets/OuterArrow.svg'
import innerArrow from '../assets/InnerArrow.svg'

function Homepage() {
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const hideTimer = useRef(null)
  const scrolledRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        scrolledRef.current = true
        setScrolled(true)
        setNavVisible(false)
      } else {
        scrolledRef.current = false
        setScrolled(false)
        setNavVisible(true)
      }
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

  return (
    <div className="bg-white">

      {/* ── NAVBAR ── */}
      <div className="fixed top-0 left-0 w-full z-50">
        <nav
          className={`w-full px-8 py-3 flex items-center justify-between ${
            navVisible
              ? ''
              : 'pointer-events-none'
          }`}
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
            transition: navVisible
              ? 'opacity 300ms ease, transform 300ms ease'
              : 'opacity 600ms ease, transform 600ms ease',
            transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: navVisible ? 1 : 0,
          }}
        >
          {/* Left — circular logo + ICCT COLLEGES text */}
          <div className="flex items-center gap-3">
            <img
              src={icctLogo}
              alt="ICCT Logo"
              className="h-12 w-12 rounded-full object-cover border-2 border-white/30"
            />
            <div className="flex flex-col leading-none gap-0">
              <span
                className="text-2xl text-white block w-full"
                style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.08em', lineHeight: '1' }}
              >
                ICCT
              </span>
              <span
                className="text-xs text-white/80 uppercase block w-full"
                style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.05em', lineHeight: '1' }}
              >
                COLLEGES
              </span>
            </div>
          </div>

          {/* Center-right — nav links */}
          <div className="flex items-center gap-10">
            <a
              href="#requirements"
              className="text-white/90 text-xs uppercase hover:text-white transition"
              style={{ fontFamily: 'sans-serif', letterSpacing: '0.2em' }}
            >
              Requirements
            </a>
            <a
              href="#announcements"
              className="text-white/90 text-xs uppercase hover:text-white transition"
              style={{ fontFamily: 'sans-serif', letterSpacing: '0.2em' }}
            >
              Announcement
            </a>

            {/* Right — circular profile avatar */}
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white/40 flex items-center justify-center text-white font-bold hover:bg-blue-500 transition shadow-lg"
            >
              P
            </button>
          </div>

        </nav>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${homepageBg})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Fading white gradient at the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6">

          {/* Main heading */}
          <h1
            className="text-4xl md:text-5xl font-black text-white leading-none uppercase"
            style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
          >
            Elevating the Experience<br />
            in <span className="text-blue-400">ICCT</span> with Convenience
          </h1>

          {/* Subheading paragraph */}
          <p className="text-white/80 text-base md:text-lg max-w-xl">
            A bridge between students and the institution towards efficient and guided academic processes in one platform.
          </p>

        </div>

        {/* Scroll down + arrows pinned to bottom */}
        <div className="absolute bottom-16 z-10 flex flex-col items-center gap-1">
          <p className="text-white/60 text-xs tracking-widest uppercase">Scroll Down</p>
          <div className="relative flex items-center justify-center w-16 h-16 animate-bounce">
            <img src={outerArrow} alt="outer arrow" className="absolute w-16 h-16 brightness-0 invert" />
            <img src={innerArrow} alt="inner arrow" className="absolute w-8 h-8 -translate-y-2 brightness-0 invert" />
          </div>
        </div>

      </section>

      {/* ── REST OF PAGE ── */}
      <section className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">More content coming soon...</p>
      </section>

    </div>
  )
}

export default Homepage

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import CTAButton from '../components/CTAButton'
import Footer from '../components/Footer'
import homepageBg from '../assets/Homepage_bg.png'
import outerArrow from '../assets/OuterArrow.svg'
import innerArrow from '../assets/InnerArrow.svg'

gsap.registerPlugin(ScrollTrigger)

// Mock announcements — replace with API data later
const announcements = [
  {
    id: 1,
    title: 'Enrollment for 2nd Semester',
    date: 'June 1, 2025',
    category: 'Enrollment',
    description: 'Enrollment for the second semester will begin on June 10. Please prepare all your requirements.',
    fullDetails: 'Enrollment for the second semester will begin on June 10, 2025. All students are required to settle their outstanding balances before enrolling. Enrollment will be done online through the student portal.',
    requirements: ['Previous semester grades', 'Clearance form', 'Assessment form', '2x2 ID photo', 'Proof of payment'],
    image: 'https://placehold.co/600x400/1d4ed8/ffffff?text=Enrollment',
    actionButton: { label: 'Register via Google Form', url: 'https://forms.google.com' },
  },
  {
    id: 2,
    title: 'Midterm Examination Schedule',
    date: 'May 28, 2025',
    category: 'Examination',
    description: 'The midterm examination schedule has been officially released. Check your department for the complete schedule.',
    fullDetails: 'Examinations will be held from June 15-20, 2025. No permit, no exam policy will be strictly enforced. Late students will not be allowed entry after 15 minutes.',
    requirements: ['School ID', 'Exam permit', 'Blue or black ballpen only', 'Mobile phones must be turned off'],
    image: 'https://placehold.co/600x400/0f172a/ffffff?text=Midterms',
    actionButton: null,
  },
  {
    id: 3,
    title: 'Holiday Class Suspension Notice',
    date: 'May 25, 2025',
    category: 'Notice',
    description: 'All classes are suspended on June 12 in observance of Philippine Independence Day.',
    fullDetails: 'All classes and office operations are suspended on June 12, 2025. Regular class schedules and office hours will resume on June 13, 2025.',
    requirements: [],
    image: 'https://placehold.co/600x400/15803d/ffffff?text=Holiday',
    actionButton: null,
  },
  {
    id: 4,
    title: 'Graduation Requirements Submission',
    date: 'June 5, 2025',
    category: 'Graduation',
    description: 'All graduating students must submit their graduation requirements on or before June 20.',
    fullDetails: 'Submission deadline is June 20, 2025. Late submissions will not be entertained. Please submit all requirements to the Registrar\'s Office.',
    requirements: ['Transcript of Records', 'Clearance from all departments', 'Accomplished graduation application form', '4 pcs 2x2 ID photos (white background)', 'Proof of payment for graduation fee'],
    image: 'https://placehold.co/600x400/7e22ce/ffffff?text=Graduation',
    actionButton: { label: 'View Graduation Requirements', url: '#requirements' },
  },
]

function Homepage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

  // Refs for animations
  const heroTitleRef = useRef(null)
  const heroParagraphRef = useRef(null)
  const heroScrollRef = useRef(null)
  const announcementTitleRef = useRef(null)
  const announcementRowsRef = useRef([])
  const footerRef = useRef(null)

  useEffect(() => {
    // small delay to ensure DOM is ready
    const ctx = gsap.context(() => {

    // ── HERO INTRO ANIMATION ──
    const tl = gsap.timeline()
    tl.fromTo(heroTitleRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    )
    .fromTo(heroParagraphRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6'
    )
    .fromTo(heroScrollRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3'
    )

    // ── ANNOUNCEMENT TITLE ──
    gsap.fromTo(announcementTitleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        scrollTrigger: {
          trigger: announcementTitleRef.current,
          start: 'top 90%',
          end: 'top 55%',
          scrub: 1.5,
        }
      }
    )

    // ── ANNOUNCEMENT ROWS — alternate slide from left/right ──
    announcementRowsRef.current.forEach((row, index) => {
      if (!row) return
      const image = row.querySelector('.anim-image')
      const text = row.querySelector('.anim-text')
      const isReversed = index % 2 !== 0

      gsap.fromTo(image,
        { opacity: 0, x: isReversed ? 120 : -120 },
        {
          opacity: 1, x: 0,
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            end: 'top 45%',
            scrub: 1.5,
          }
        }
      )

      gsap.fromTo(text,
        { opacity: 0, x: isReversed ? -120 : 120 },
        {
          opacity: 1, x: 0,
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            end: 'top 45%',
            scrub: 1.5,
          }
        }
      )
    })

    // ── FOOTER ANIMATION ──
    const footerChildren = footerRef.current?.querySelectorAll('.footer-col')
    if (footerChildren) {
      gsap.fromTo(footerChildren,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0,
          stagger: 0.15,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            end: 'top 50%',
            scrub: 1.5,
          }
        }
      )
    }

    }) // end gsap.context

    return () => ctx.revert()
  }, [])

  return (
    <div className="bg-white relative overflow-x-hidden">

      <Navbar />

      {/* ── HERO SECTION ── */}
      <section data-nav="dark" className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">

        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${homepageBg})` }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6">
          <h1
            ref={heroTitleRef}
            className="text-4xl md:text-5xl font-black text-white leading-none uppercase"
            style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
          >
            Elevating the Experience<br />
            in <span className="text-blue-400">ICCT</span> with Convenience
          </h1>
          <p
            ref={heroParagraphRef}
            className="text-white/80 text-base md:text-lg max-w-xl"
          >
            A bridge between students and the institution towards efficient and guided academic processes in one platform.
          </p>
        </div>

        <div ref={heroScrollRef} className="absolute bottom-16 z-10 flex flex-col items-center gap-1">
          <p className="text-white/60 text-xs tracking-widest uppercase">Scroll Down</p>
          <div className="relative flex items-center justify-center w-16 h-16 animate-bounce">
            <img src={outerArrow} alt="outer arrow" className="absolute w-16 h-16 brightness-0 invert" />
            <img src={innerArrow} alt="inner arrow" className="absolute w-8 h-8 -translate-y-2 brightness-0 invert" />
          </div>
        </div>

      </section>

      {/* ── ANNOUNCEMENTS SECTION ── */}
      <section data-nav="light" id="announcements" className="py-20 px-8 max-w-6xl mx-auto">

        <h2
          ref={announcementTitleRef}
          className="text-3xl font-black text-gray-800 uppercase text-center mb-16"
          style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.05em' }}
        >
          Latest <span className="text-blue-600">Announcements</span>
        </h2>

        {announcements.map((item, index) => (
          <div
            key={item.id}
            ref={el => announcementRowsRef.current[index] = el}
            className={`flex flex-col md:flex-row items-center gap-10 mb-20 ${
              index % 2 !== 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Feature image */}
            <div className="anim-image w-full md:w-1/2 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              <img src={item.image} alt={item.title} className="w-full h-64 object-cover" />
            </div>

            {/* Text content */}
            <div className="anim-text w-full md:w-1/2 flex flex-col gap-4">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{item.category}</span>
              <h3 className="text-2xl font-black text-gray-800 leading-tight">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.date}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              <div onClick={() => setSelectedAnnouncement(item)}>
                <CTAButton label="READ MORE" />
              </div>
            </div>

          </div>
        ))}

      </section>

      <Footer ref={footerRef} />

      {/* ── MODAL POPUP ── */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="relative bg-white w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 shrink-0">
              <img src={selectedAnnouncement.image} alt={selectedAnnouncement.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-5 right-10">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">{selectedAnnouncement.category}</span>
                <h3 className="text-xl font-black text-white leading-tight mt-1">{selectedAnnouncement.title}</h3>
                <p className="text-white/50 text-xs mt-1">{selectedAnnouncement.date}</p>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm transition backdrop-blur-sm"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-5 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">About</p>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedAnnouncement.fullDetails}</p>
              </div>
              {selectedAnnouncement.requirements?.length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Requirements</p>
                    <ul className="flex flex-col gap-2">
                      {selectedAnnouncement.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              {selectedAnnouncement.actionButton && (
                <>
                  <div className="border-t border-gray-100" />
                  <a
                    href={selectedAnnouncement.actionButton.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-[0_4px_15px_rgba(37,99,235,0.4)]"
                  >
                    {selectedAnnouncement.actionButton.label} →
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Homepage

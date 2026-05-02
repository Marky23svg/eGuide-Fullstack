import { forwardRef } from 'react'
import icctLogo from '../assets/Icctlogo.webp'
import facebookIcon from '../assets/facebookfooter.svg'
import tiktokIcon from '../assets/tiktokfooter.svg'
import youtubeIcon from '../assets/youtubefooter.svg'

const Footer = forwardRef((props, ref) => {
  return (
    <footer ref={ref} className="relative bg-gray-950 text-white overflow-hidden">

      {/* Decorative blue glow top left */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      {/* Decorative blue glow bottom right */}
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main content */}
      <div className="relative max-w-6xl mx-auto px-8 pt-16 pb-10">

        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">

          {/* Column 1 — Logo + tagline + socials */}
          <div className="footer-col flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <img
                src={icctLogo}
                alt="ICCT Logo"
                className="h-14 w-14 rounded-full object-cover border-2 border-blue-500/40"
              />
              <div className="flex flex-col leading-none">
                <span
                  className="text-3xl text-white"
                  style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.08em', lineHeight: '1' }}
                >
                  ICCT
                </span>
                <span
                  className="text-xs text-white/50 uppercase"
                  style={{ fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', letterSpacing: '0.05em', lineHeight: '1' }}
                >
                  COLLEGES
                </span>
              </div>
            </div>

            <p className="text-white/40 text-sm leading-relaxed">
              A bridge between students and the institution towards efficient and guided academic processes in one platform.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: facebookIcon, label: 'Facebook', url: 'https://www.facebook.com/IM4ICCT' },
                { icon: tiktokIcon, label: 'TikTok', url: 'https://www.tiktok.com/discover/icct' },
                { icon: youtubeIcon, label: 'YouTube', url: 'https://www.youtube.com/@icctcolleges6903' },
              ].map(({ icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition"
                >
                  <img src={icon} alt={label} className="w-4 h-4 brightness-0 invert" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick links */}
          <div className="footer-col flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Quick Links</h4>
            <div className="flex flex-col gap-3">
              {['Home', 'Announcements', 'Requirements', 'Terms of Service', 'Privacy Policy'].map(link => (
                <a
                  key={link}
                  href="#"
                  className="text-white/40 text-sm hover:text-white transition flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-3 h-px bg-blue-400 transition-all duration-300" />
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3 — Contact */}
          <div className="footer-col flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Contact Us</h4>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Address', value: 'ICCT Colleges, Cainta, Rizal, Philippines' },
                { label: 'Email', value: 'info@icct.edu.ph' },
                { label: 'Phone', value: '(02) 8123-4567' },
                { label: 'Office Hours', value: 'Mon - Fri: 8:00 AM - 5:00 PM' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-blue-400/70 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white/50 text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-6">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} ICCT Colleges. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Powered by <span className="text-blue-500">eGuide</span>
          </p>
        </div>

      </div>
    </footer>
  )
})

export default Footer

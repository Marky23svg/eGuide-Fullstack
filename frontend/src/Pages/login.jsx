import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginBg from '../assets/Login_bg.webp'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import API from '../services/api'
import { motion } from "motion/react";

function Login() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('login')
  const [forgotStep, setForgotStep] = useState('email')
  const [loginStep, setLoginStep] = useState('credentials')

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  // Login form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginOtp, setLoginOtp] = useState('')

  // Sign up form states
  const [regName, setRegName] = useState('')
  const [regStudentNo, setRegStudentNo] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotCode, setForgotCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  // Feedback messages
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Runs when login form is submitted - CONNECTED TO BACKEND
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await API.post('/auth/login', { email, password })

      if (response.success && response.requiresOtp) {
        setLoginStep('otp')
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await API.post('/auth/verify-login-otp', { email, otp: loginOtp })

      if (response.success) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        if (response.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/home')
        }
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || error.message)
    } finally {
      setLoginLoading(false)
    }
  }

  // Runs when sign up form is submitted - CONNECTED TO BACKEND
  const handleSignUp = async (e) => {
    e.preventDefault()
    setSignupError('')
    setSignupSuccess('')

    if (regPassword !== regConfirm) {
      setSignupError('Passwords do not match!')
      return
    }

    try {
      const response = await API.post('/auth/signup', {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: 'student'
      })

      if (response.success) {
        console.log('Signup successful!', response.user)
        setSignupSuccess('Account created successfully! Please login.')

        setActiveTab('login')
        setRegName('')
        setRegStudentNo('')
        setRegEmail('')
        setRegPassword('')
        setRegConfirm('')
      }
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.message || error.message)
      setSignupError('Signup failed: ' + (error.response?.data?.message || 'Email may already exist'))
    }
  }

  // Step 1 — sends code to email
  const handleForgotEmail = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    setForgotLoading(true)
    try {
      await API.post('/auth/forgot-password', { email: forgotEmail })
      setForgotSuccess('Reset code sent! Check your email.')
      setForgotStep('code')
    } catch (error) {
      setForgotError(error.message || 'No account found with this email')
    } finally {
      setForgotLoading(false)
    }
  }

  // Step 2 — verifies the code sent to email
  const handleForgotCode = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    setForgotLoading(true)
    console.log('Verifying code:', forgotCode, 'for email:', forgotEmail)
    try {
      const res = await API.post('/auth/verify-reset-code', { email: forgotEmail, code: forgotCode })
      console.log('Verify response:', res)
      if (res.success) {
        setForgotStep('reset')
      } else {
        setForgotError('Invalid or expired reset code')
      }
    } catch (error) {
      console.log('Verify error full:', JSON.stringify(error))
      setForgotError(error.message || 'Invalid or expired reset code')
    } finally {
      setForgotLoading(false)
    }
  }

  // Step 3 — resets the password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    setForgotLoading(true)
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match!')
      setForgotLoading(false)
      return
    }
    try {
      await API.post('/auth/reset-password', { email: forgotEmail, code: forgotCode, newPassword })
      setActiveTab('login')
      setForgotStep('email')
      setSignupSuccess('Password reset successfully! Please log in.')
    } catch (error) {
      setForgotError(error.message || 'Failed to reset password')
    } finally {
      setForgotLoading(false)
    }
  }

return (
  <div className="relative min-h-screen flex items-center justify-center w-full overflow-hidden">

    {/* Blurred background image */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})`, filter: 'blur(6px)', transform: 'scale(1.1)' }}
    />

    {/* WRAPPER: card + robot together */}
    <div className="relative z-10" style={{ width: '384px' }}>

      {/* ── ROBOT BODY ── */}
      <motion.img
        src="/robot-body.png"
        alt="Robot"
        className="absolute"
        key={activeTab + '-body'}
        style={{
          width: '160px',
          top: '-30px',
          zIndex: 5,
          // Login = left side, Signup = right side
          ...(activeTab === 'signup'
            ? { left: '100%', marginLeft: '-50px'}
            : { right: '100%', marginRight: '-50px', scaleX: -1, transform: 'scaleX(-1)'}
          ),
        }}
        initial={{
          x: activeTab === 'signup' ? -100 : 100,
          opacity: 0.3,
        }}
        animate={{
          x: 0,
          opacity: 1,
          y: [0, -6, 0],
        }}
        transition={{
          x: { type: 'spring', stiffness: 200, damping: 18 },
          opacity: { duration: 0.15 },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
        }}
      />

      {/* ── ROBOT ARM ── */}
      <motion.img
        src="/robot-arm.png"
        alt="Robot Arm"
        className="absolute"
        key={activeTab + '-arm'}
        style={{
          width: '80px',
          top: '60px',
          zIndex: 20,
          ...(activeTab === 'signup'
            ? { left: '100%', marginLeft: '-30px'}
            : { right: '100%', marginRight: '-30px', scaleX: -1, transform: 'scaleX(-1)'}
          ),
        }}
      />

      {/* Card */}
      <div className="relative bg-white p-8 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full" style={{ zIndex: 10 }}>

        {/* Page title */}
        <h2 className="text-2xl font-bold text-center">eGuide <span className="text-blue-600">ICCT</span></h2>
        <p className="text-center text-sm mb-4">Welcome Back!</p>

        {/* Tab buttons — hidden when on forgot password flow */}
        {activeTab !== 'forgot' && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border-2 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] ${
                activeTab === 'login'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg border-2 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] ${
                activeTab === 'signup'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-400'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Login form */}
        {activeTab === 'login' && loginStep === 'credentials' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginError && <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded p-2">{loginError}</p>}
            {signupSuccess && <p className="text-xs text-green-500 text-center bg-green-50 border border-green-200 rounded p-2">{signupSuccess}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
            <p
              onClick={() => setActiveTab('forgot')}
              className="text-xs text-right text-blue-500 cursor-pointer hover:underline -mt-2"
            >
              Forgot Password?
            </p>
            <button
              type="submit"
              disabled={loginLoading}
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Sending OTP...' : 'Log In'}
            </button>
          </form>
        )}

        {/* OTP verification step */}
        {activeTab === 'login' && loginStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <p className="font-semibold text-gray-700">Check Your Email</p>
              <p className="text-xs text-gray-400">We sent a 6-digit OTP to <span className="text-blue-500">{email}</span></p>
            </div>
            {loginError && <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded p-2">{loginError}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">OTP Code</label>
              <input
                type="text"
                value={loginOtp}
                onChange={(e) => setLoginOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <p
              onClick={() => { setLoginStep('credentials'); setLoginOtp(''); setLoginError(''); }}
              className="text-xs text-center text-blue-500 cursor-pointer hover:underline"
            >
              ← Back
            </p>
          </form>
        )}

        {/* Sign Up form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            {signupError && <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded p-2">{signupError}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showRegPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showRegConfirm ? 'text' : 'password'}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showRegConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
            >
              Sign Up
            </button>
            <div className="border-t border-gray-200" />
            <p className="text-xs text-center text-gray-400">
              By signing up, you agree to our{' '}
              <span onClick={() => navigate('/terms')} className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span onClick={() => navigate('/privacy')} className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </form>
        )}

        {/* Forgot Password flow */}
        {activeTab === 'forgot' && (
          <div className="flex flex-col gap-4">
            {forgotStep === 'email' && (
              <>
                <div className="text-center mb-2">
                  <p className="font-semibold text-gray-700">Forgot Password</p>
                  <p className="text-xs text-gray-400">Enter your email and we'll send you a code</p>
                </div>
                {forgotError && <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded p-2">{forgotError}</p>}
                {forgotSuccess && <p className="text-xs text-green-500 text-center bg-green-50 border border-green-200 rounded p-2">{forgotSuccess}</p>}
                <form onSubmit={handleForgotEmail} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Code'}
                  </button>
                </form>
              </>
            )}
            {forgotStep === 'code' && (
              <>
                <div className="text-center mb-2">
                  <p className="font-semibold text-gray-700">Enter Code</p>
                  <p className="text-xs text-gray-400">We sent a code to <span className="text-blue-500">{forgotEmail}</span></p>
                </div>
                {forgotError && <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded p-2">{forgotError}</p>}
                <form onSubmit={handleForgotCode} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Verification Code</label>
                    <input
                      type="text"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
              </>
            )}
            {forgotStep === 'reset' && (
              <>
                <div className="text-center mb-2">
                  <p className="font-semibold text-gray-700">Reset Password</p>
                  <p className="text-xs text-gray-400">Enter your new password below</p>
                </div>
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                        {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                        {showConfirmNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
            <p
              onClick={() => { setActiveTab('login'); setForgotStep('email') }}
              className="text-xs text-center text-blue-500 cursor-pointer hover:underline"
            >
              ← Back to Log In
            </p>
          </div>
        )}

      </div>{/* end card */}
    </div>{/* end wrapper */}

  </div>
)
}

export default Login

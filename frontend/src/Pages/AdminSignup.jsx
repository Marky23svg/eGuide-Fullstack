import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import loginBg from '../assets/Login_bg.webp'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdLock } from 'react-icons/md'
import API from '../services/api'
import { setAuth } from '../utils/authStorage'

const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.'
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character.'
  }
  return null
}

// This page is intentionally NOT linked from anywhere in the app UI.
// It only does anything useful if the person also knows the authorized
// email address — that check happens on the server, never in this file.
function AdminSignup() {
  const navigate = useNavigate()

  const [step, setStep] = useState('form') // 'form' | 'otp'

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authorizedEmail, setAuthorizedEmail] = useState('')

  const [otp, setOtp] = useState('')
  const [signupToken, setSignupToken] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const getApiErrorMessage = (err, fallback = 'Unable to process this request. Please try again.') => {
    if (!err) return fallback
    if (typeof err === 'string') return err
    if (err.message) return err.message
    if (err?.data?.message) return err.data.message
    if (err?.response?.data?.message) return err.response.data.message
    return fallback
  }

  const getStrength = (pwd) => {
    if (!pwd) return null
    const has8 = pwd.length >= 8
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNum = /[0-9]/.test(pwd)
    const score = [has8, hasUpper, hasLower, hasNum].filter(Boolean).length
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', text: 'text-red-500' }
    if (score === 3) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4', text: 'text-yellow-500' }
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full', text: 'text-green-500' }
  }

  // Step 1 — submit details, trigger OTP to the authorized inbox (not to this form's email)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const pwError = validatePasswordStrength(password)
    if (pwError) {
      setError(pwError)
      return
    }

    setLoading(true)
    try {
      const response = await API.post('/auth/admin-signup/send-otp', {
        name,
        email,
        password,
        confirmPassword,
        authorizedEmail,
      })
      if (response.success) {
        setSignupToken(response.signupToken)
        setSuccess('If the details are correct, a verification code has been sent to the authorized inbox.')
        setResendTimer(60)
        setStep('otp')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to process this request. Please check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  // Step 2 — verify the code retrieved from the authorized inbox
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await API.post('/auth/admin-signup/verify-otp', {
        email,
        otp,
        signupToken,
      })
      if (response.success) {
        setAuth(response.token, response.user)
        navigate('/admin')
      }
    } catch (err) {
      // If the server issued a fresh token (wrong OTP, attempts incremented), keep using it
      if (err?.signupToken) setSignupToken(err.signupToken)
      setError(getApiErrorMessage(err, 'Invalid code. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await API.post('/auth/admin-signup/send-otp', {
        name,
        email,
        password,
        confirmPassword,
        authorizedEmail,
      })
      if (response.success) {
        setSignupToken(response.signupToken)
        setSuccess('A new code has been sent to the authorized inbox.')
        setResendTimer(60)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center w-full overflow-hidden px-4 py-8">
      {/* Blurred background image — same as login page */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})`, filter: 'blur(6px)', transform: 'scale(1.1)' }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full overflow-y-auto max-h-[90vh]" style={{ zIndex: 10 }}>
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <MdLock className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-center">eGuide <span className="text-blue-600">ICCT</span></h2>
            <p className="text-center text-sm text-gray-500">Administrator Registration</p>
          </div>

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded p-2">{error}</p>}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                    placeholder="Create password"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">At least 8 characters, including one uppercase, one lowercase, one number, and one special character.</p>
                {password && (() => {
                  const s = getStrength(password)
                  return (
                    <div className="mt-1.5">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${s.color} ${s.width}`} />
                      </div>
                      <p className={`text-xs mt-0.5 font-semibold ${s.text}`}>{s.label}</p>
                    </div>
                  )
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium mb-1">Authorized Email</label>
                <input
                  type="email"
                  value={authorizedEmail}
                  onChange={(e) => setAuthorizedEmail(e.target.value)}
                  placeholder="Enter the authorized verification email"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-gray-400 mt-1">
                  A verification code will be sent to this address if it is recognized. Only someone with access to that inbox can complete registration.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Request Verification Code'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <p className="font-semibold text-gray-700">Enter Verification Code</p>
                <p className="text-xs text-gray-400">Retrieve the code from the authorized inbox and enter it below.</p>
              </div>
              {error && <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded p-2">{error}</p>}
              {success && <p className="text-xs text-green-500 text-center bg-green-50 border border-green-200 rounded p-2">{success}</p>}
              <div>
                <label className="block text-sm font-medium mb-1">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || loading}
                className="text-xs text-center text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </button>
              <p
                onClick={() => { setStep('form'); setOtp(''); setError(''); setSuccess('') }}
                className="text-xs text-center text-gray-400 cursor-pointer hover:underline"
              >
                Start over
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSignup

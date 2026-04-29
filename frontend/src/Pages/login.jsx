import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import loginBg from '../assets/Login_bg.png'
import googleIcon from '../assets/google.svg'
import facebookIcon from '../assets/facebook.svg'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import API from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('login')
  const [forgotStep, setForgotStep] = useState('email')

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  // Login form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
  const [signupError, setSignupError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState('')

  // Runs when login form is submitted - CONNECTED TO BACKEND
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    console.log('1. Login button clicked')
    console.log('2. Email:', email)
    console.log('3. Password:', password)

    try {
      console.log('4. Calling API...')
      const response = await API.post('/auth/login', { email, password })
      console.log('5. Response received:', response)

      if (response.success) {
        console.log('6. Login successful!')
        // Store token in sessionStorage (cleared when tab closes)
        // For stronger security, request your backend to set an httpOnly cookie instead
        sessionStorage.setItem('token', response.token)
        sessionStorage.setItem('user', JSON.stringify(response.user))

        console.log('7. Redirecting...')
        if (response.user.role === 'admin') {
          navigate('/admin-dashboard')
        } else {
          navigate('/home')
        }
      }
    } catch (error) {
      console.error('ERROR:', error)
      setLoginError('Login failed: ' + (error.response?.data?.message || error.message))
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
  const handleForgotEmail = (e) => {
    e.preventDefault()
    console.log('Send code to:', forgotEmail)
    setForgotStep('code')
  }

  // Step 2 — verifies the code sent to email
  const handleForgotCode = (e) => {
    e.preventDefault()
    console.log('Verify code:', forgotCode)
    setForgotStep('reset')
  }

  // Step 3 — resets the password
  const handleResetPassword = (e) => {
    e.preventDefault()
    console.log('New password:', newPassword)
    setActiveTab('login')
    setForgotStep('email')
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center w-full">

      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})`, filter: 'blur(6px)', transform: 'scale(1.1)' }}
      />

      {/* Card */}
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full max-w-sm">

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

        {/* Log In form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginError && <p className="text-xs text-red-500 text-center">{loginError}</p>}
            {signupSuccess && <p className="text-xs text-green-500 text-center">{signupSuccess}</p>}
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
              <p onClick={() => setActiveTab('forgot')} className="text-xs text-blue-500 text-right mt-1 cursor-pointer hover:underline">Forgot Password?</p>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
            >
              Log In
            </button>

            {/* Divider line with OR text */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* Social login buttons */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full border-2 border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-500 transition shadow-[0_4px_6px_rgba(0,0,0,0.08)]"
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full border-2 border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-500 transition shadow-[0_4px_6px_rgba(0,0,0,0.08)]"
            >
              <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
              Continue with Facebook
            </button>
          </form>
        )}

        {/* Sign Up form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            {signupError && <p className="text-xs text-red-500 text-center">{signupError}</p>}
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

            {/* Divider line with OR text */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* Social sign up buttons */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full border-2 border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-500 transition shadow-[0_4px_6px_rgba(0,0,0,0.08)]"
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full border-2 border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-500 transition shadow-[0_4px_6px_rgba(0,0,0,0.08)]"
            >
              <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
              Continue with Facebook
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

            {/* Step 1 — Enter email to receive code */}
            {forgotStep === 'email' && (
              <>
                <div className="text-center mb-2">
                  <p className="font-semibold text-gray-700">Forgot Password</p>
                  <p className="text-xs text-gray-400">Enter your email and we'll send you a code</p>
                </div>
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
                    className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
                  >
                    Send Code
                  </button>
                </form>
              </>
            )}

            {/* Step 2 — Enter the code sent to email */}
            {forgotStep === 'code' && (
              <>
                <div className="text-center mb-2">
                  <p className="font-semibold text-gray-700">Enter Code</p>
                  <p className="text-xs text-gray-400">We sent a code to <span className="text-blue-500">{forgotEmail}</span></p>
                </div>
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
                    className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
                  >
                    Verify Code
                  </button>
                </form>
              </>
            )}

            {/* Step 3 — Enter new password */}
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
                    className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
                  >
                    Reset Password
                  </button>
                </form>
              </>
            )}

            {/* Back to Login link */}
            <p
              onClick={() => { setActiveTab('login'); setForgotStep('email') }}
              className="text-xs text-center text-blue-500 cursor-pointer hover:underline"
            >
              ← Back to Log In
            </p>

          </div>
        )}

      </div>
    </div>
  )
}

export default Login

# eGuide ICCT — Frontend API Documentation
> This document contains all the API endpoints needed to connect the frontend to the backend.
> All endpoints should return JSON. Base URL: `http://localhost:5000` (or your deployed URL)

---

## 🔐 AUTHENTICATION

### 1. Login
- **Endpoint:** `POST /api/auth/login`
- **File:** `frontend/src/Pages/login.jsx` → `handleLogin`
- **Request Body:**
```json
{
  "email": "juan@icct.edu.ph",
  "password": "password123"
}
```
- **Expected Response:**
```json
{
  "token": "<jwt_token>",
  "user": {
    "id": "1",
    "name": "Juan Dela Cruz",
    "email": "juan@icct.edu.ph"
  }
}
```

---

### 2. Register
- **Endpoint:** `POST /api/auth/register`
- **File:** `frontend/src/Pages/login.jsx` → `handleSignUp`
- **Request Body:**
```json
{
  "name": "Juan Dela Cruz",
  "email": "juan@icct.edu.ph",
  "password": "password123"
}
```
- **Expected Response:**
```json
{
  "message": "Account created successfully",
  "token": "<jwt_token>"
}
```

---

### 3. Forgot Password — Send Code
- **Endpoint:** `POST /api/auth/forgot-password`
- **File:** `frontend/src/Pages/login.jsx` → `handleForgotEmail`
- **Request Body:**
```json
{
  "email": "juan@icct.edu.ph"
}
```
- **Expected Response:**
```json
{
  "message": "Verification code sent to email"
}
```

---

### 4. Forgot Password — Verify Code
- **Endpoint:** `POST /api/auth/verify-code`
- **File:** `frontend/src/Pages/login.jsx` → `handleForgotCode`
- **Request Body:**
```json
{
  "email": "juan@icct.edu.ph",
  "code": "123456"
}
```
- **Expected Response:**
```json
{
  "message": "Code verified successfully"
}
```

---

### 5. Reset Password
- **Endpoint:** `POST /api/auth/reset-password`
- **File:** `frontend/src/Pages/login.jsx` → `handleResetPassword`
- **Request Body:**
```json
{
  "email": "juan@icct.edu.ph",
  "newPassword": "newpassword123"
}
```
- **Expected Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

### 6. Get Current User
- **Endpoint:** `GET /api/auth/me`
- **File:** `frontend/src/components/Navbar.jsx` → Profile Card
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Expected Response:**
```json
{
  "id": "1",
  "name": "Juan Dela Cruz",
  "email": "juan@icct.edu.ph",
  "studentNumber": "CA202012345"
}
```

---

### 7. Logout
- **Endpoint:** `POST /api/auth/logout`
- **File:** `frontend/src/components/Navbar.jsx` → Log Out button
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 8. Switch Account
- **Endpoint:** `POST /api/auth/switch`
- **File:** `frontend/src/components/Navbar.jsx` → Switch Account button
- **Expected Response:**
```json
{
  "message": "Switched account successfully"
}
```

---

### 9. Google OAuth
- **Endpoint:** `GET /api/auth/google`
- **File:** `frontend/src/Pages/login.jsx` → Continue with Google button

### 10. Facebook OAuth
- **Endpoint:** `GET /api/auth/facebook`
- **File:** `frontend/src/Pages/login.jsx` → Continue with Facebook button

---

## 📢 ANNOUNCEMENTS

### 1. Get All Announcements
- **Endpoint:** `GET /api/announcements`
- **File:** `frontend/src/Pages/Homepage.jsx` → `announcements` array
- **Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Enrollment for 2nd Semester",
    "date": "June 1, 2025",
    "category": "Enrollment",
    "description": "Short description here...",
    "fullDetails": "Full details here...",
    "requirements": [
      "Previous semester grades",
      "Clearance form",
      "Assessment form"
    ],
    "image": "https://your-server.com/images/enrollment.jpg",
    "actionButton": {
      "label": "Register via Google Form",
      "url": "https://forms.google.com/your-form"
    }
  }
]
```
> **Note:** `actionButton` can be `null` if no action is needed.
> **Note:** `requirements` can be an empty array `[]` if no requirements.

---

## 📋 REQUIREMENTS

### 1. Get All Requirements
- **Endpoint:** `GET /api/requirements`
- **File:** `frontend/src/Pages/Requirements.jsx` → `requirementCards` array
- **Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Transcript of Records (TOR)",
    "incomplete": 4,
    "steps": [
      "Fill out the request form at the Registrar's Office",
      "Submit a valid school ID",
      "Pay the processing fee at the cashier",
      "Present the official receipt",
      "Wait for evaluation",
      "Claim the TOR after 5-7 working days",
      "Have the TOR signed by the Registrar",
      "Request for dry seal if needed",
      "Receive the final TOR in a sealed envelope"
    ]
  }
]
```

---

### 2. Update Requirement Progress (Mark as Done)
- **Endpoint:** `PUT /api/requirements/:id/progress`
- **File:** `frontend/src/components/RequirementCard.jsx` → `toggleStep`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Request Body:**
```json
{
  "stepIndex": 2,
  "completed": true
}
```
- **Expected Response:**
```json
{
  "message": "Progress updated successfully"
}
```

---

### 3. Reset Requirement (Retake)
- **Endpoint:** `PUT /api/requirements/:id/reset`
- **File:** `frontend/src/components/RequirementCard.jsx` → `handleRetake`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Expected Response:**
```json
{
  "message": "Requirement reset successfully"
}
```

---

## 📄 STATIC PAGES (No Backend Needed)
- `/terms` → `frontend/src/Pages/TermsOfService.jsx`
- `/privacy` → `frontend/src/Pages/PrivacyPolicy.jsx`

---

## 🗂️ FRONTEND FILE STRUCTURE
```
frontend/src/
├── assets/              — images, icons, SVGs
├── components/
│   ├── Navbar.jsx       — navigation bar + profile card
│   ├── Footer.jsx       — footer
│   ├── CTAButton.jsx    — animated CTA button
│   └── RequirementCard.jsx — requirement card with steps
├── Pages/
│   ├── login.jsx        — login + signup + forgot password
│   ├── Homepage.jsx     — homepage with announcements
│   ├── Requirements.jsx — requirements page
│   ├── TermsOfService.jsx
│   └── PrivacyPolicy.jsx
├── App.jsx              — routes
└── main.jsx
```

---

## 🛣️ FRONTEND ROUTES
| Path | Page |
|------|------|
| `/` | Login |
| `/home` | Homepage |
| `/requirements` | Requirements |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |

---

## 📦 PACKAGES USED
```json
{
  "react": "^19.2.4",
  "react-router-dom": "^7.14.1",
  "axios": "^1.15.0",
  "gsap": "latest",
  "react-icons": "^5.6.0",
  "styled-components": "^6.4.0",
  "tailwindcss": "^4.2.2"
}
```

---

## 🔑 HOW TO REPLACE MOCK DATA WITH API

### Example for Announcements:
```jsx
// BEFORE (mock data)
const announcements = [ { id: 1, title: '...' } ]

// AFTER (API data)
const [announcements, setAnnouncements] = useState([])

useEffect(() => {
  axios.get('/api/announcements')
    .then(res => setAnnouncements(res.data))
    .catch(err => console.error(err))
}, [])
```

### Example for Requirements:
```jsx
// BEFORE (mock data)
const requirementCards = [ { id: 1, title: '...' } ]

// AFTER (API data)
const [requirementCards, setRequirementCards] = useState([])

useEffect(() => {
  axios.get('/api/requirements')
    .then(res => setRequirementCards(res.data))
    .catch(err => console.error(err))
}, [])
```

---

> 📌 **Note:** All protected routes should include `Authorization: Bearer <jwt_token>` in the request headers.
> The token is received after login and should be stored in `localStorage` or a global state (context/redux).

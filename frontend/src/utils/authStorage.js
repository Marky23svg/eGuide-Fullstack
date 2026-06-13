const TOKEN_KEY = 'token'
const USER_KEY = 'user'

// Clear legacy localStorage auth from before session-based storage.
localStorage.removeItem(TOKEN_KEY)
localStorage.removeItem(USER_KEY)

export const getToken = () => sessionStorage.getItem(TOKEN_KEY)

export const getUser = () => {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    if (!raw || raw === 'undefined' || raw === 'null') return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export const setAuth = (token, user) => {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

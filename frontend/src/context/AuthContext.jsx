import { createContext, useState, useEffect, useContext } from 'react'
import api, { googleLogin as googleLoginApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    api.get('/students/auth/me/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUser(res.data))
      .catch(() => {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) { clearTokens(); setLoading(false); return }
        api.post('/students/auth/token/refresh/', { refresh })
          .then(res => {
            localStorage.setItem('access_token', res.data.access)
            return api.get('/students/auth/me/', {
              headers: { Authorization: `Bearer ${res.data.access}` },
            })
          })
          .then(res => setUser(res.data))
          .catch(() => clearTokens())
          .finally(() => setLoading(false))
      })
      .finally(() => setLoading(false))
  }, [])

  function clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  async function login(email, password) {
    const res = await api.post('/students/auth/login/', { email, password })
    localStorage.setItem('access_token', res.data.tokens.access)
    localStorage.setItem('refresh_token', res.data.tokens.refresh)
    setUser(res.data.user)
    return res.data
  }

  async function register(data) {
    const res = await api.post('/students/auth/register/', data)
    localStorage.setItem('access_token', res.data.tokens.access)
    localStorage.setItem('refresh_token', res.data.tokens.refresh)
    setUser(res.data.user)
    return res.data
  }

  async function loginWithGoogle(credential) {
    const res = await googleLoginApi(credential)
    localStorage.setItem('access_token', res.data.tokens.access)
    localStorage.setItem('refresh_token', res.data.tokens.refresh)
    setUser(res.data.user)
    return res.data
  }

  function logout() {
    clearTokens()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

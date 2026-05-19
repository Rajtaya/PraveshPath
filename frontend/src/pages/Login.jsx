import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleSignIn from '../components/GoogleSignIn'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/profile'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => { setForm(f => ({ ...f, [field]: value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email) return setError('Email is required')
    if (!form.password) return setError('Password is required')

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data?.non_field_errors) setError(data.non_field_errors[0])
      else if (data?.email) setError(data.email[0])
      else setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Log in to find your eligible programmes</p>

        {error && <div className="auth-error">{error}</div>}

        <GoogleSignIn
          text="signin_with"
          onSuccess={() => navigate(from, { replace: true })}
          onError={msg => setError(msg)}
        />
        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email" value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@example.com" autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password" value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder="Enter your password" autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          display: flex; justify-content: center; align-items: center;
          min-height: 70vh; padding: 2rem;
        }
        .auth-card {
          background: white; border-radius: 12px;
          padding: 2.5rem; width: 100%; max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          border: 1px solid var(--border);
        }
        .auth-card h1 { font-size: 1.6rem; margin-bottom: 0.3rem; text-align: center; }
        .auth-subtitle { color: var(--text-muted); text-align: center; margin-bottom: 1.5rem; font-size: 0.9rem; }
        .auth-error {
          background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
          padding: 0.65rem 1rem; border-radius: var(--radius);
          font-size: 0.85rem; margin-bottom: 1rem;
        }
        .field { margin-bottom: 1rem; }
        .field label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.3rem; color: var(--text); }
        .field input {
          width: 100%; padding: 0.6rem 0.8rem;
          border: 1px solid var(--border); border-radius: var(--radius);
          font-size: 0.9rem;
        }
        .field input:focus { outline: none; border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .btn-full { width: 100%; margin-top: 0.5rem; }
        .auth-switch { text-align: center; margin-top: 1.25rem; font-size: 0.85rem; color: var(--text-muted); }
        .auth-switch a { color: var(--primary); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
        .auth-divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1rem 0; color: var(--text-muted); font-size: 0.8rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
      `}</style>
    </div>
  )
}

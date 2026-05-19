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
      <div className="auth-container">
        <div className="auth-panel">
          <div className="auth-panel-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="auth-panel-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2>Welcome to PraveshPath</h2>
            <p>Your one-stop platform for Haryana university admissions. Check eligibility, compare programmes, and apply directly.</p>
            <div className="auth-panel-stats">
              <div><strong>7</strong> Universities</div>
              <div><strong>383</strong> Programmes</div>
              <div><strong>418</strong> Offerings</div>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <h1>Welcome Back</h1>
            <p className="auth-subtitle">Log in to find your eligible programmes</p>

            {error && <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>}

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
        </div>
      </div>

      <style>{`
        .auth-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          padding: 1.5rem;
        }
        .auth-container {
          display: flex;
          max-width: 860px;
          width: 100%;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          background: white;
          border: 1px solid var(--border);
          animation: fadeInUp 0.4s ease both;
        }
        .auth-panel {
          flex: 1;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          padding: 2.5rem;
          display: flex;
          align-items: center;
          min-width: 320px;
        }
        .auth-panel-content { max-width: 280px; }
        .auth-panel-icon { margin-bottom: 1.25rem; opacity: 0.9; }
        .auth-panel h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.75rem; }
        .auth-panel p { font-size: 0.9rem; opacity: 0.8; line-height: 1.6; margin-bottom: 1.5rem; }
        .auth-panel-stats { display: flex; gap: 1rem; font-size: 0.8rem; opacity: 0.7; }
        .auth-panel-stats strong { display: block; font-size: 1.15rem; opacity: 1; color: white; }

        .auth-form-side { flex: 1; min-width: 340px; }
        .auth-card {
          padding: 2.5rem;
        }
        .auth-card h1 { font-size: 1.5rem; margin-bottom: 0.3rem; }
        .auth-subtitle { color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.88rem; }
        .auth-error {
          background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
          padding: 0.65rem 1rem; border-radius: var(--radius);
          font-size: 0.85rem; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .field { margin-bottom: 1rem; }
        .field label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text); }
        .field input {
          width: 100%; padding: 0.65rem 0.85rem;
          border: 1.5px solid var(--border); border-radius: var(--radius);
          font-size: 0.9rem; transition: all var(--transition);
          background: var(--bg);
        }
        .field input:focus {
          outline: none; border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
          background: white;
        }
        .btn-full { width: 100%; margin-top: 0.5rem; padding: 0.7rem; }
        .auth-switch { text-align: center; margin-top: 1.25rem; font-size: 0.85rem; color: var(--text-muted); }
        .auth-switch a { color: var(--primary); font-weight: 600; text-decoration: none; }
        .auth-switch a:hover { text-decoration: underline; }
        .auth-divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1.25rem 0; color: var(--text-muted); font-size: 0.8rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }
        @media (max-width: 768px) {
          .auth-panel { display: none; }
          .auth-container { max-width: 440px; }
        }
      `}</style>
    </div>
  )
}

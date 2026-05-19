import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleSignIn from '../components/GoogleSignIn'

const PW_RULES = [
  { id: 'len', test: v => v.length >= 8, label: 'At least 8 characters' },
  { id: 'upper', test: v => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { id: 'lower', test: v => /[a-z]/.test(v), label: 'One lowercase letter' },
  { id: 'digit', test: v => /\d/.test(v), label: 'One digit' },
  { id: 'special', test: v => /[!@#$%^&*(),.?":{}|<>]/.test(v), label: 'One special character' },
]

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', password_confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
    setGlobalError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name || form.full_name.trim().length < 2) errs.full_name = 'Name is required (min 2 chars)'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required'
    if (!form.phone || !/^(\+91)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, '')))
      errs.phone = 'Valid 10-digit phone required (starting 6-9)'
    const pwFailing = PW_RULES.filter(r => !r.test(form.password))
    if (pwFailing.length) errs.password = 'Password does not meet all requirements'
    if (form.password !== form.password_confirm) errs.password_confirm = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form)
      navigate('/profile', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const fieldErrors = {}
        Object.keys(data).forEach(key => {
          const val = Array.isArray(data[key]) ? data[key][0] : data[key]
          if (key === 'non_field_errors') setGlobalError(val)
          else fieldErrors[key] = val
        })
        setErrors(fieldErrors)
      } else {
        setGlobalError('Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up to discover eligible programmes in Haryana</p>

        {globalError && <div className="auth-error">{globalError}</div>}

        <GoogleSignIn
          text="signup_with"
          onSuccess={() => navigate('/profile', { replace: true })}
          onError={msg => setGlobalError(msg)}
        />
        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input type="text" value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              placeholder="Your full name" autoComplete="name" />
            {errors.full_name && <span className="field-error">{errors.full_name}</span>}
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@example.com" autoComplete="email" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label>Phone</label>
            <input type="tel" value={form.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="10-digit mobile number" autoComplete="tel" />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder="Create a strong password" autoComplete="new-password" />
            {form.password && (
              <div className="pw-rules">
                {PW_RULES.map(rule => (
                  <div key={rule.id} className={`pw-rule ${rule.test(form.password) ? 'pass' : 'fail'}`}>
                    <span className="pw-icon">{rule.test(form.password) ? '✓' : '✗'}</span>
                    {rule.label}
                  </div>
                ))}
              </div>
            )}
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input type="password" value={form.password_confirm}
              onChange={e => update('password_confirm', e.target.value)}
              placeholder="Re-enter your password" autoComplete="new-password" />
            {errors.password_confirm && <span className="field-error">{errors.password_confirm}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
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
        .signup-card { max-width: 460px; }
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
        .field-error { color: #dc2626; font-size: 0.75rem; margin-top: 0.2rem; display: block; }
        .pw-rules { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.15rem; }
        .pw-rule { font-size: 0.72rem; display: flex; align-items: center; gap: 0.35rem; }
        .pw-rule.pass { color: #16a34a; }
        .pw-rule.fail { color: #9ca3af; }
        .pw-icon { font-size: 0.8rem; width: 1rem; text-align: center; }
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

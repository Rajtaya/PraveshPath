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

  const pwPassed = PW_RULES.filter(r => r.test(form.password)).length
  const pwTotal = PW_RULES.length
  const pwPercent = form.password ? (pwPassed / pwTotal) * 100 : 0

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-panel">
          <div className="auth-panel-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="auth-panel-icon">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <h2>Join PraveshPath</h2>
            <p>Create your free account and discover which programmes match your profile across all Haryana universities.</p>
            <div className="auth-panel-features">
              <div className="auth-panel-feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Free eligibility matching
              </div>
              <div className="auth-panel-feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Deadline reminders
              </div>
              <div className="auth-panel-feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Direct application links
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <h1>Create Account</h1>
            <p className="auth-subtitle">Sign up to discover eligible programmes in Haryana</p>

            {globalError && <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {globalError}
            </div>}

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

              <div className="field-row">
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
                    placeholder="10-digit mobile" autoComplete="tel" />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Create a strong password" autoComplete="new-password" />
                {form.password && (
                  <>
                    <div className="pw-bar">
                      <div className="pw-bar-fill" style={{
                        width: `${pwPercent}%`,
                        background: pwPercent === 100 ? '#16a34a' : pwPercent >= 60 ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                    <div className="pw-rules">
                      {PW_RULES.map(rule => (
                        <div key={rule.id} className={`pw-rule ${rule.test(form.password) ? 'pass' : 'fail'}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            {rule.test(form.password)
                              ? <polyline points="20 6 9 17 4 12" />
                              : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
                          </svg>
                          {rule.label}
                        </div>
                      ))}
                    </div>
                  </>
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          display: flex; justify-content: center; align-items: center;
          min-height: 80vh; padding: 1.5rem;
        }
        .auth-container {
          display: flex;
          max-width: 900px;
          width: 100%;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          background: white;
          border: 1px solid var(--border);
          animation: fadeInUp 0.4s ease both;
        }
        .auth-panel {
          flex: 0 0 320px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          padding: 2.5rem;
          display: flex;
          align-items: center;
        }
        .auth-panel-content { max-width: 280px; }
        .auth-panel-icon { margin-bottom: 1.25rem; opacity: 0.9; }
        .auth-panel h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.75rem; }
        .auth-panel p { font-size: 0.88rem; opacity: 0.8; line-height: 1.6; margin-bottom: 1.25rem; }
        .auth-panel-features { display: flex; flex-direction: column; gap: 0.5rem; }
        .auth-panel-feature {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.82rem; opacity: 0.85;
        }

        .auth-form-side { flex: 1; overflow-y: auto; max-height: 90vh; }
        .auth-card { padding: 2rem 2.5rem; }
        .auth-card h1 { font-size: 1.5rem; margin-bottom: 0.3rem; }
        .auth-subtitle { color: var(--text-muted); margin-bottom: 1.25rem; font-size: 0.88rem; }
        .auth-error {
          background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
          padding: 0.65rem 1rem; border-radius: var(--radius);
          font-size: 0.85rem; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .field { margin-bottom: 0.9rem; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .field label { display: block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.3rem; color: var(--text); }
        .field input {
          width: 100%; padding: 0.6rem 0.85rem;
          border: 1.5px solid var(--border); border-radius: var(--radius);
          font-size: 0.9rem; transition: all var(--transition);
          background: var(--bg);
        }
        .field input:focus {
          outline: none; border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
          background: white;
        }
        .field-error { color: #dc2626; font-size: 0.75rem; margin-top: 0.2rem; display: block; }

        .pw-bar { height: 3px; background: var(--border); border-radius: 3px; margin-top: 0.5rem; overflow: hidden; }
        .pw-bar-fill { height: 100%; border-radius: 3px; transition: all var(--transition); }
        .pw-rules { margin-top: 0.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.15rem 0.5rem; }
        .pw-rule { font-size: 0.7rem; display: flex; align-items: center; gap: 0.3rem; }
        .pw-rule.pass { color: #16a34a; }
        .pw-rule.fail { color: #9ca3af; }

        .btn-full { width: 100%; margin-top: 0.5rem; padding: 0.7rem; }
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
        @media (max-width: 768px) {
          .auth-panel { display: none; }
          .auth-container { max-width: 480px; }
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile } from '../api/client'

const STREAMS = [
  { value: 'arts', label: 'Arts / Humanities' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'science', label: 'Science' },
  { value: 'computer', label: 'Computer Applications' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'management', label: 'Management' },
  { value: 'medical', label: 'Medical' },
  { value: 'law', label: 'Law' },
  { value: 'education', label: 'Education' },
]

const DISTRICTS = [
  'ambala', 'bhiwani', 'charkhi dadri', 'faridabad', 'fatehabad',
  'gurugram', 'hisar', 'jhajjar', 'jind', 'kaithal', 'karnal',
  'kurukshetra', 'mahendragarh', 'nuh', 'palwal', 'panchkula',
  'panipat', 'rewari', 'rohtak', 'sirsa', 'sonipat', 'yamunanagar',
]

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'bc_a', label: 'BC-A' },
  { value: 'bc_b', label: 'BC-B' },
  { value: 'ews', label: 'EWS' },
  { value: 'obc', label: 'OBC' },
]

export default function ProfileWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    class_10_percentage: '',
    class_12_percentage: '',
    class_12_stream: '',
    class_12_subjects: '',
    category: 'general',
    haryana_domicile: true,
    preferred_stream: '',
    preferred_level: 'ug',
    preferred_districts: '',
    max_annual_fee: '',
  })

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.full_name) return 'Please enter your name'
      if (!form.class_10_percentage || form.class_10_percentage < 0 || form.class_10_percentage > 100)
        return 'Enter valid 10th percentage'
      if (!form.class_12_percentage || form.class_12_percentage < 0 || form.class_12_percentage > 100)
        return 'Enter valid 12th percentage'
      if (!form.class_12_stream) return 'Select your 12th stream'
    }
    return ''
  }

  const nextStep = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setStep(s => s + 1)
  }

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = { ...form }
      if (payload.max_annual_fee === '') delete payload.max_annual_fee
      const res = await createProfile(payload)
      navigate(`/results/${res.data.session_id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h1>Find Eligible Colleges</h1>
        <p>Fill your details to discover matching colleges and courses</p>
        <div className="steps">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>
        <div className="step-labels">
          <span>Academic Info</span>
          <span>Preferences</span>
          <span>Confirm</span>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="wizard-body card">
        {step === 1 && (
          <div className="form-step">
            <h2>Academic Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>10th Percentage</label>
                <input
                  type="number"
                  min="0" max="100" step="0.01"
                  value={form.class_10_percentage}
                  onChange={e => update('class_10_percentage', e.target.value)}
                  placeholder="e.g. 78.5"
                />
              </div>
              <div className="form-group">
                <label>12th Percentage</label>
                <input
                  type="number"
                  min="0" max="100" step="0.01"
                  value={form.class_12_percentage}
                  onChange={e => update('class_12_percentage', e.target.value)}
                  placeholder="e.g. 72.0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>12th Stream</label>
              <select
                value={form.class_12_stream}
                onChange={e => update('class_12_stream', e.target.value)}
              >
                <option value="">Select stream</option>
                {STREAMS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>12th Subjects (comma-separated)</label>
              <input
                type="text"
                value={form.class_12_subjects}
                onChange={e => update('class_12_subjects', e.target.value)}
                placeholder="e.g. Physics, Chemistry, Math"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => update('category', e.target.value)}>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Haryana Domicile?</label>
                <select
                  value={form.haryana_domicile ? 'yes' : 'no'}
                  onChange={e => update('haryana_domicile', e.target.value === 'yes')}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Your Preferences</h2>
            <div className="form-group">
              <label>Preferred Stream (for admission)</label>
              <select
                value={form.preferred_stream}
                onChange={e => update('preferred_stream', e.target.value)}
              >
                <option value="">Any stream</option>
                {STREAMS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Level</label>
              <select
                value={form.preferred_level}
                onChange={e => update('preferred_level', e.target.value)}
              >
                <option value="ug">Undergraduate (UG)</option>
                <option value="pg">Postgraduate (PG)</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Districts</label>
              <div className="checkbox-grid">
                {DISTRICTS.map(d => (
                  <label key={d} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={form.preferred_districts.split(',').map(x => x.trim()).includes(d)}
                      onChange={e => {
                        const current = form.preferred_districts
                          ? form.preferred_districts.split(',').map(x => x.trim()).filter(Boolean)
                          : []
                        if (e.target.checked) {
                          update('preferred_districts', [...current, d].join(','))
                        } else {
                          update('preferred_districts', current.filter(x => x !== d).join(','))
                        }
                      }}
                    />
                    <span>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                  </label>
                ))}
              </div>
              <small>Leave all unchecked to search all districts</small>
            </div>
            <div className="form-group">
              <label>Maximum Annual Fee (INR)</label>
              <input
                type="number"
                min="0"
                value={form.max_annual_fee}
                onChange={e => update('max_annual_fee', e.target.value)}
                placeholder="e.g. 50000 (leave empty for no limit)"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Confirm Your Details</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Name</span>
                <span className="value">{form.full_name}</span>
              </div>
              <div className="summary-item">
                <span className="label">10th %</span>
                <span className="value">{form.class_10_percentage}%</span>
              </div>
              <div className="summary-item">
                <span className="label">12th %</span>
                <span className="value">{form.class_12_percentage}%</span>
              </div>
              <div className="summary-item">
                <span className="label">Stream</span>
                <span className="value">{form.class_12_stream}</span>
              </div>
              <div className="summary-item">
                <span className="label">Category</span>
                <span className="value">{form.category.toUpperCase()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Domicile</span>
                <span className="value">{form.haryana_domicile ? 'Haryana' : 'Other State'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Preferred Stream</span>
                <span className="value">{form.preferred_stream || 'Any'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Max Fee</span>
                <span className="value">
                  {form.max_annual_fee ? `₹${Number(form.max_annual_fee).toLocaleString()}` : 'No limit'}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Districts</span>
                <span className="value">{form.preferred_districts || 'All'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="wizard-actions">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button className="btn btn-success btn-lg" onClick={submit} disabled={loading}>
              {loading ? 'Finding matches...' : 'Find My Colleges'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .wizard { max-width: 700px; margin: 0 auto; }
        .wizard-header { text-align: center; margin-bottom: 2rem; }
        .wizard-header h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
        .wizard-header p { color: var(--text-muted); }
        .steps { display: flex; align-items: center; justify-content: center; margin: 1.5rem 0 0.5rem; gap: 0; }
        .step-dot {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--border); color: var(--text-muted);
          font-weight: 600; font-size: 0.9rem;
        }
        .step-dot.active { background: var(--primary); color: white; }
        .step-line { width: 60px; height: 2px; background: var(--border); }
        .step-labels { display: flex; justify-content: center; gap: 3rem; font-size: 0.8rem; color: var(--text-muted); }
        .form-step h2 { font-size: 1.3rem; margin-bottom: 1.5rem; }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-weight: 500; margin-bottom: 0.4rem; font-size: 0.9rem; }
        .form-group input, .form-group select {
          width: 100%; padding: 0.6rem 0.75rem;
          border: 1px solid var(--border); border-radius: var(--radius);
          font-size: 0.95rem; transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none; border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .checkbox-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.4rem; margin-top: 0.5rem;
        }
        .checkbox-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.85rem; cursor: pointer;
        }
        .form-group small { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.3rem; display: block; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .summary-item { display: flex; flex-direction: column; }
        .summary-item .label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
        .summary-item .value { font-weight: 600; font-size: 1rem; }
        .wizard-actions { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .error-msg { background: #fee2e2; color: #991b1b; padding: 0.75rem 1rem; border-radius: var(--radius); margin-bottom: 1rem; font-size: 0.9rem; }
      `}</style>
    </div>
  )
}

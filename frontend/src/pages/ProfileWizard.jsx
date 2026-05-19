import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile, getMyProfile } from '../api/client'

const CLASS_12_STREAMS = [
  { value: 'science', label: 'Science' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'arts', label: 'Arts / Humanities' },
]

const GRADUATION_STREAMS = [
  { value: 'science', label: 'Science' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'arts', label: 'Arts / Humanities' },
  { value: 'engineering', label: 'Engineering / Technology' },
  { value: 'management', label: 'Management' },
  { value: 'computer', label: 'Computer Applications' },
  { value: 'law', label: 'Law' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical' },
  { value: 'other', label: 'Other' },
]


const DISTRICTS = [
  'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad',
  'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal',
  'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula',
  'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar',
]


export default function ProfileWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    preferred_level: '',
    class_10_percentage: '',
    class_12_percentage: '',
    class_12_stream: '',
    class_12_subjects: '',
    graduation_stream: '',
    graduation_percentage: '',
    graduation_subject: '',
    haryana_domicile: true,
    preferred_districts: '',
    max_annual_fee: '',
  })

  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    getMyProfile()
      .then(res => {
        const p = res.data
        const saved = {
          full_name: p.full_name || '',
          preferred_level: p.preferred_level || '',
          class_10_percentage: p.class_10_percentage || '',
          class_12_percentage: p.class_12_percentage || '',
          class_12_stream: p.class_12_stream || '',
          class_12_subjects: p.class_12_subjects || '',
          graduation_stream: p.graduation_stream || '',
          graduation_percentage: p.graduation_percentage || '',
          graduation_subject: p.graduation_subject || '',
          haryana_domicile: p.haryana_domicile !== undefined ? p.haryana_domicile : true,
          preferred_districts: p.preferred_districts || '',
          max_annual_fee: p.max_annual_fee || '',
        }
        setForm(saved)
        if (saved.preferred_level && saved.class_12_percentage && saved.class_12_stream) setStep(4)
        setProfileLoaded(true)
      })
      .catch(() => setProfileLoaded(true))
  }, [])

  const isUG = form.preferred_level === 'ug'
  const isPG = form.preferred_level === 'pg'

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const STEP_LABELS = ['Select Level', 'Academic Info', 'Preferences', 'Confirm']

  const validateStep = () => {
    if (step === 1) {
      if (!form.preferred_level) return 'Please select a level'
    }
    if (step === 2) {
      if (!form.full_name) return 'Please enter your name'
      if (isUG) {
        if (!form.class_10_percentage || form.class_10_percentage < 0 || form.class_10_percentage > 100)
          return 'Enter valid 10th percentage'
        if (!form.class_12_percentage || form.class_12_percentage < 0 || form.class_12_percentage > 100)
          return 'Enter valid 12th percentage'
        if (!form.class_12_stream) return 'Select your 12th stream'
      }
      if (isPG) {
        if (!form.graduation_stream) return 'Select your graduation stream'
        if (!form.graduation_percentage || form.graduation_percentage < 0 || form.graduation_percentage > 100)
          return 'Enter valid graduation percentage'
        if (!form.class_12_percentage || form.class_12_percentage < 0 || form.class_12_percentage > 100)
          return 'Enter valid 12th percentage'
      }
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
      if (isUG) {
        delete payload.graduation_stream
        delete payload.graduation_percentage
        delete payload.graduation_subject
      }
      if (isPG) {
        delete payload.class_10_percentage
        delete payload.class_12_stream
        delete payload.class_12_subjects
      }
      await createProfile(payload)
      navigate('/results')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!profileLoaded) {
    return <div className="wizard"><div className="loading" style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>Loading your profile...</div></div>
  }

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h1>Find Eligible Programmes</h1>
        <p>Fill your details to discover matching universities and programmes</p>
        <div className="steps">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className="step-group">
              <div className={`step-dot ${step >= i + 1 ? 'active' : ''}`}>{i + 1}</div>
              {i < STEP_LABELS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>
        <div className="step-labels">
          {STEP_LABELS.map(label => <span key={label}>{label}</span>)}
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="wizard-body card">
        {step === 1 && (
          <div className="form-step">
            <h2>What level are you looking for?</h2>
            <div className="level-cards">
              <div
                className={`level-card ${form.preferred_level === 'ug' ? 'selected' : ''}`}
                onClick={() => update('preferred_level', 'ug')}
              >
                <div className="level-icon">&#x1F393;</div>
                <h3>Undergraduate (UG)</h3>
                <p>B.A., B.Sc., B.Com., B.Tech, BBA, BCA, LL.B and more</p>
              </div>
              <div
                className={`level-card ${form.preferred_level === 'pg' ? 'selected' : ''}`}
                onClick={() => update('preferred_level', 'pg')}
              >
                <div className="level-icon">&#x1F4DA;</div>
                <h3>Postgraduate (PG)</h3>
                <p>M.A., M.Sc., M.Com., M.Tech, MBA, MCA, LL.M and more</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && isUG && (
          <div className="form-step">
            <h2>Academic Information (UG)</h2>
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
                {CLASS_12_STREAMS.map(s => (
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
        )}

        {step === 2 && isPG && (
          <div className="form-step">
            <h2>Academic Information (PG)</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Graduation Stream</label>
              <select
                value={form.graduation_stream}
                onChange={e => update('graduation_stream', e.target.value)}
              >
                <option value="">Select stream</option>
                {GRADUATION_STREAMS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Graduation Percentage</label>
                <input
                  type="number"
                  min="0" max="100" step="0.01"
                  value={form.graduation_percentage}
                  onChange={e => update('graduation_percentage', e.target.value)}
                  placeholder="e.g. 65.0"
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
              <label>Graduation Subject / Specialization</label>
              <input
                type="text"
                value={form.graduation_subject}
                onChange={e => update('graduation_subject', e.target.value)}
                placeholder="e.g. English, Physics, Computer Science"
              />
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
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Your Preferences</h2>
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
                    <span>{d}</span>
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

        {step === 4 && (
          <div className="form-step">
            <h2>Confirm Your Details</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Level</span>
                <span className="value">{isUG ? 'Undergraduate (UG)' : 'Postgraduate (PG)'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Name</span>
                <span className="value">{form.full_name}</span>
              </div>
              {isUG && (
                <>
                  <div className="summary-item">
                    <span className="label">10th %</span>
                    <span className="value">{form.class_10_percentage}%</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">12th %</span>
                    <span className="value">{form.class_12_percentage}%</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">12th Stream</span>
                    <span className="value">{form.class_12_stream}</span>
                  </div>
                </>
              )}
              {isPG && (
                <>
                  <div className="summary-item">
                    <span className="label">Graduation Stream</span>
                    <span className="value">
                      {GRADUATION_STREAMS.find(s => s.value === form.graduation_stream)?.label || form.graduation_stream}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Graduation %</span>
                    <span className="value">{form.graduation_percentage}%</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">12th %</span>
                    <span className="value">{form.class_12_percentage}%</span>
                  </div>
                  {form.graduation_subject && (
                    <div className="summary-item">
                      <span className="label">Subject</span>
                      <span className="value">{form.graduation_subject}</span>
                    </div>
                  )}
                </>
              )}
              <div className="summary-item">
                <span className="label">Domicile</span>
                <span className="value">{form.haryana_domicile ? 'Haryana' : 'Other State'}</span>
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
          {step < 4 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button className="btn btn-success btn-lg" onClick={submit} disabled={loading}>
              {loading ? 'Finding matches...' : 'Find My Programmes'}
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
        .step-group { display: flex; align-items: center; }
        .step-dot {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--border); color: var(--text-muted);
          font-weight: 600; font-size: 0.9rem;
        }
        .step-dot.active { background: var(--primary); color: white; }
        .step-line { width: 50px; height: 2px; background: var(--border); }
        .step-labels { display: flex; justify-content: center; gap: 2rem; font-size: 0.8rem; color: var(--text-muted); }
        .level-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1rem; }
        .level-card {
          border: 2px solid var(--border); border-radius: var(--radius);
          padding: 2rem 1.5rem; text-align: center; cursor: pointer;
          transition: all 0.2s;
        }
        .level-card:hover { border-color: var(--primary-light); background: #f8faff; }
        .level-card.selected { border-color: var(--primary); background: #eff6ff; }
        .level-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .level-card h3 { font-size: 1.1rem; margin-bottom: 0.4rem; }
        .level-card p { font-size: 0.82rem; color: var(--text-muted); margin: 0; }
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

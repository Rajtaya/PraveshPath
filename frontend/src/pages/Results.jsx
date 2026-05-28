import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMatchResults } from '../api/client'

export default function Results() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ stream: '', district: '', status: '', type: '', search: '' })
  const [activeUni, setActiveUni] = useState(null)
  const [selectedProg, setSelectedProg] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMatchResults()
        setData(res.data)
      } catch (err) {
        const code = err.response?.data?.code
        if (code === 'profile_missing' || code === 'profile_incomplete') {
          navigate('/profile')
          return
        }
        setError(err.response?.data?.error || 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="loading"><div className="loading-spinner" /><span>Finding your matches...</span></div>
  if (error) return <div className="error-page"><p>{error}</p><Link to="/profile" className="btn btn-primary">Try Again</Link></div>

  const filtered = data.results.filter(item => {
    if (filter.stream && item.course.stream !== filter.stream) return false
    if (filter.district && item.university.district !== filter.district) return false
    if (filter.type && item.university.university_type !== filter.type) return false
    if (filter.status) {
      const cycle = item.admission_cycles[0]
      if (!cycle || cycle.status !== filter.status) return false
    }
    if (filter.search) {
      const q = filter.search.toLowerCase()
      const matchUni = item.university.name.toLowerCase().includes(q) ||
        item.university.short_name.toLowerCase().includes(q)
      const matchCourse = item.course.name.toLowerCase().includes(q)
      if (!matchUni && !matchCourse) return false
    }
    return true
  })

  const activeFilterCount = [filter.stream, filter.district, filter.type, filter.status, filter.search].filter(Boolean).length
  const clearFilters = () => setFilter({ stream: '', district: '', status: '', type: '', search: '' })

  const grouped = {}
  filtered.forEach(item => {
    const key = item.university.id
    if (!grouped[key]) grouped[key] = { university: item.university, courses: [] }
    grouped[key].courses.push(item)
  })
  const unis = Object.values(grouped).sort((a, b) => b.courses.length - a.courses.length)

  const districts = [...new Set(data.results.map(r => r.university.district))].sort()
  const streams = [...new Set(data.results.map(r => r.course.stream))].sort()
  const types = [...new Set(data.results.map(r => r.university.university_type))].sort()

  const streamSet = group => [...new Set(group.courses.map(c => c.course.stream))]

  return (
    <div className="results-page">
      <div className="results-header">
        <div>
          <h1>Your Eligible Programmes</h1>
          <p className="results-subtitle">
            {data.profile.name} &middot; {data.profile.highest_qualification}
            {data.profile.stream ? ` · ${data.profile.stream}` : ''}
          </p>
        </div>
        <div className="match-stats">
          <div className="stat-box">
            <span className="stat-num">{unis.length}</span>
            <span className="stat-label">Universities</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{filtered.length}</span>
            <span className="stat-label">Programmes</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            placeholder="Search university or programme..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            className="search-input"
          />
        </div>
        <div className="filters">
          <select value={filter.stream} onChange={e => setFilter(f => ({ ...f, stream: e.target.value }))}>
            <option value="">All Streams</option>
            {streams.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filter.district} onChange={e => setFilter(f => ({ ...f, district: e.target.value }))}>
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
          {activeFilterCount > 0 && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
        {activeFilterCount > 0 && (
          <div className="filter-summary">
            Showing {filtered.length} of {data.results.length} programmes across {unis.length} universities
          </div>
        )}
      </div>

      {!activeUni ? (
        <>
          <div className="uni-grid">
            {unis.map(group => (
              <div
                key={group.university.id}
                className="uni-card"
                onClick={() => setActiveUni(group.university.id)}
              >
                <div className="uni-card__badge">
                  <span className={`uni-card__type badge-type-${group.university.university_type}`}>
                    {group.university.university_type}
                  </span>
                </div>
                <h3 className="uni-card__short">{group.university.short_name}</h3>
                <p className="uni-card__name">{group.university.name}</p>
                <div className="uni-card__meta">
                  <span>{group.university.district}</span>
                  {group.university.website && (
                    <a href={group.university.website} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}>
                      Website
                    </a>
                  )}
                </div>
                <div className="uni-card__stats">
                  <div className="uni-card__stat">
                    <span className="uni-card__stat-num">{group.courses.length}</span>
                    <span className="uni-card__stat-lbl">Programme{group.courses.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="uni-card__stat">
                    <span className="uni-card__stat-num">{streamSet(group).length}</span>
                    <span className="uni-card__stat-lbl">Stream{streamSet(group).length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="uni-card__streams">
                  {streamSet(group).sort().map(s => (
                    <span key={s} className="uni-card__stream-tag">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {unis.length === 0 && (
            <div className="no-results card">
              <p>No matches found with current filters. Try adjusting your filters above.</p>
            </div>
          )}
        </>
      ) : (
        <UniversityProgrammes
          group={unis.find(g => g.university.id === activeUni)}
          onBack={() => { setActiveUni(null); setSelectedProg(null) }}
          selectedProg={selectedProg}
          setSelectedProg={setSelectedProg}
        />
      )}

      {selectedProg && (
        <DetailModal
          item={filtered.find(i => i.id === selectedProg)}
          onClose={() => setSelectedProg(null)}
        />
      )}

      <style>{`
        .results-page { max-width: 1200px; margin: 0 auto; animation: fadeInUp 0.4s ease both; }
        .results-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .results-header h1 { font-size: 1.8rem; margin-bottom: 0.3rem; }
        .results-subtitle { color: var(--text-muted); }
        .match-stats { display: flex; gap: 0.75rem; }
        .stat-box {
          text-align: center; background: var(--primary-50); padding: 0.75rem 1.25rem;
          border-radius: var(--radius-lg); min-width: 80px;
          border: 1px solid var(--primary-100);
        }
        .stat-num { display: block; font-size: 1.6rem; font-weight: 800; color: var(--primary); }
        .stat-label { font-size: 0.75rem; color: var(--text-muted); }
        .filter-bar { margin-bottom: 1.5rem; }
        .filter-search { margin-bottom: 0.75rem; }
        .search-input {
          width: 100%; padding: 0.65rem 1rem;
          border: 1.5px solid var(--border); border-radius: var(--radius);
          font-size: 0.95rem; background: white;
          transition: all var(--transition);
        }
        .search-input:focus { outline: none; border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .filters { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
        .filters select {
          padding: 0.45rem 0.65rem; border: 1.5px solid var(--border);
          border-radius: var(--radius); font-size: 0.82rem; background: white;
          transition: all var(--transition); cursor: pointer;
        }
        .filters select:focus { outline: none; border-color: var(--primary-light); }
        .clear-filters {
          padding: 0.45rem 0.75rem; border: 1.5px solid #ef4444; background: #fef2f2;
          color: #dc2626; border-radius: var(--radius); font-size: 0.82rem;
          cursor: pointer; font-weight: 500; transition: all var(--transition);
        }
        .clear-filters:hover { background: #fee2e2; }
        .filter-summary { margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted); }

        .uni-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .uni-card {
          background: white;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          cursor: pointer;
          transition: all var(--transition);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .uni-card:hover {
          border-color: var(--primary);
          box-shadow: 0 8px 24px rgba(59,130,246,0.12);
          transform: translateY(-3px);
        }
        .uni-card__badge { display: flex; justify-content: flex-end; }
        .uni-card__type {
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 0.2rem 0.6rem; border-radius: 999px;
        }
        .badge-type-state { background: #dbeafe; color: #1e40af; }
        .badge-type-central { background: #fce7f3; color: #9d174d; }
        .badge-type-deemed { background: #e0e7ff; color: #3730a3; }
        .badge-type-private { background: #f3f4f6; color: #374151; }

        .uni-card__short {
          font-size: 1.6rem; font-weight: 800; color: var(--primary-dark);
          margin: 0.25rem 0 0;
        }
        .uni-card__name {
          font-size: 0.8rem; color: var(--text-muted); margin: 0;
          line-height: 1.3;
        }
        .uni-card__meta {
          display: flex; gap: 0.75rem; align-items: center;
          font-size: 0.82rem; color: var(--text-muted); margin-top: 0.25rem;
        }
        .uni-card__meta a {
          color: var(--primary); text-decoration: none; font-weight: 600; font-size: 0.8rem;
        }
        .uni-card__meta a:hover { text-decoration: underline; }

        .uni-card__stats {
          display: flex; gap: 1.5rem; margin-top: 0.5rem;
          padding-top: 0.75rem; border-top: 1px solid var(--border);
        }
        .uni-card__stat { display: flex; flex-direction: column; }
        .uni-card__stat-num { font-size: 1.3rem; font-weight: 800; color: var(--primary); }
        .uni-card__stat-lbl { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }

        .uni-card__streams {
          display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem;
        }
        .uni-card__stream-tag {
          font-size: 0.65rem; background: var(--bg); color: var(--text-muted);
          padding: 0.15rem 0.5rem; border-radius: 999px; text-transform: capitalize;
        }

        .loading {
          text-align: center; padding: 4rem; font-size: 1.1rem; color: var(--text-muted);
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
        }
        .loading-spinner {
          width: 32px; height: 32px;
          border: 3px solid var(--border); border-top-color: var(--primary);
          border-radius: 50%; animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error-page { text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .no-results { text-align: center; padding: 3rem; color: var(--text-muted); }
      `}</style>
    </div>
  )
}


function UniversityProgrammes({ group, onBack, selectedProg, setSelectedProg }) {
  if (!group) return null
  const { university, courses } = group

  const sorted = [...courses].sort((a, b) => {
    const sCmp = a.course.stream.localeCompare(b.course.stream)
    if (sCmp !== 0) return sCmp
    return a.course.name.localeCompare(b.course.name)
  })

  return (
    <div className="uni-progs">
      <button className="uni-progs__back" onClick={onBack}>
        &larr; Back to Universities
      </button>

      <div className="uni-progs__header">
        <div>
          <h2 className="uni-progs__title">{university.short_name}</h2>
          <p className="uni-progs__fullname">{university.name}</p>
          <div className="uni-progs__meta">
            <span className={`uni-card__type badge-type-${university.university_type}`}>
              {university.university_type}
            </span>
            <span>{university.district}</span>
            {university.website && (
              <a href={university.website} target="_blank" rel="noopener noreferrer">Website</a>
            )}
          </div>
        </div>
        <div className="uni-progs__count">
          <span className="stat-num">{courses.length}</span>
          <span className="stat-label">Programme{courses.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="prog-grid">
        {sorted.map(item => {
          const cycle = item.admission_cycles[0]
          const criteria = item.eligibility[0]
          return (
            <div
              key={item.id}
              className={`prog-card ${selectedProg === item.id ? 'prog-card--selected' : ''}`}
              onClick={() => setSelectedProg(selectedProg === item.id ? null : item.id)}
            >
              <div className="prog-card__top">
                <span className={`prog-card__status badge-${cycle?.status || 'unknown'}`}>
                  {cycle?.status || 'N/A'}
                </span>
                <span className="prog-card__stream">{item.course.stream}</span>
              </div>

              <h3 className="prog-card__title">{item.course.name}</h3>

              <div className="prog-card__details">
                {criteria?.min_12th_percentage && (
                  <div className="prog-card__detail">
                    <span className="prog-card__detail-label">Min %</span>
                    <span className="prog-card__detail-value">{criteria.min_12th_percentage}%</span>
                  </div>
                )}
                {item.annual_fee && (
                  <div className="prog-card__detail">
                    <span className="prog-card__detail-label">Fee</span>
                    <span className="prog-card__detail-value">&#x20B9;{Number(item.annual_fee).toLocaleString()}</span>
                  </div>
                )}
                {item.total_seats && (
                  <div className="prog-card__detail">
                    <span className="prog-card__detail-label">Seats</span>
                    <span className="prog-card__detail-value">{item.total_seats}</span>
                  </div>
                )}
                <div className="prog-card__detail">
                  <span className="prog-card__detail-label">Duration</span>
                  <span className="prog-card__detail-value">{item.course.duration_years} yr</span>
                </div>
              </div>

              {cycle && (
                <div className="prog-card__deadline">
                  Deadline: {cycle.application_end}
                  {cycle.days_remaining !== null && cycle.days_remaining > 0 && (
                    <span className="prog-card__days"> ({cycle.days_remaining}d left)</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        .uni-progs__back {
          background: none; border: none; color: var(--primary);
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          padding: 0.4rem 0; margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.3rem;
          transition: all var(--transition);
        }
        .uni-progs__back:hover { opacity: 0.8; }

        .uni-progs__header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 1.5rem; padding-bottom: 1rem;
          border-bottom: 2px solid var(--border);
        }
        .uni-progs__title { font-size: 1.8rem; font-weight: 800; color: var(--primary-dark); margin: 0; }
        .uni-progs__fullname { font-size: 0.85rem; color: var(--text-muted); margin: 0.2rem 0 0.5rem; }
        .uni-progs__meta {
          display: flex; gap: 0.75rem; align-items: center;
          font-size: 0.82rem; color: var(--text-muted);
        }
        .uni-progs__meta a { color: var(--primary); text-decoration: none; font-weight: 600; }
        .uni-progs__meta a:hover { text-decoration: underline; }
        .uni-progs__count { text-align: center; }

        .prog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1rem;
        }

        .prog-card {
          background: white;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.1rem;
          cursor: pointer;
          transition: all var(--transition);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .prog-card:hover {
          border-color: var(--primary-light);
          box-shadow: 0 6px 16px rgba(59,130,246,0.1);
          transform: translateY(-2px);
        }
        .prog-card--selected {
          border-color: var(--primary);
          box-shadow: 0 6px 20px rgba(59,130,246,0.15);
        }

        .prog-card__top { display: flex; justify-content: space-between; align-items: center; }
        .prog-card__status {
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.04em; padding: 0.15rem 0.5rem; border-radius: 999px;
        }
        .badge-open { background: #dcfce7; color: #166534; }
        .badge-upcoming { background: #fef9c3; color: #854d0e; }
        .badge-closed { background: #fee2e2; color: #991b1b; }
        .badge-unknown { background: #f3f4f6; color: #6b7280; }
        .badge-counselling { background: #e0e7ff; color: #3730a3; }

        .prog-card__stream {
          font-size: 0.7rem; color: var(--text-muted); background: var(--bg);
          padding: 0.1rem 0.45rem; border-radius: 6px; text-transform: capitalize;
        }
        .prog-card__title {
          font-size: 0.95rem; font-weight: 700; color: var(--text);
          margin: 0; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .prog-card__details {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 0.4rem; margin-top: 0.25rem;
          padding-top: 0.6rem; border-top: 1px solid var(--border);
        }
        .prog-card__detail { display: flex; flex-direction: column; }
        .prog-card__detail-label {
          font-size: 0.62rem; text-transform: uppercase;
          letter-spacing: 0.04em; color: var(--text-muted);
        }
        .prog-card__detail-value { font-size: 0.82rem; font-weight: 600; color: var(--text); }

        .prog-card__deadline {
          font-size: 0.72rem; color: var(--text-muted);
          padding-top: 0.4rem; border-top: 1px solid var(--border);
        }
        .prog-card__days { color: #ea580c; font-weight: 600; }
      `}</style>
    </div>
  )
}


function DetailModal({ item, onClose }) {
  if (!item) return null
  const cycle = item.admission_cycles[0]
  const criteria = item.eligibility[0]

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-handle" onClick={onClose}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M14 5L8 11L14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="detail-handle__text">Back to Results</span>
        </div>
        <button className="detail-close" onClick={onClose}>&times;</button>

        <div className="detail-modal__header">
          <h2>{item.course.name}</h2>
          <div className="detail-modal__uni-row">
            <span className="detail-modal__uni">{item.university.name} ({item.university.short_name})</span>
            {cycle && <span className={`prog-card__status badge-${cycle.status}`}>{cycle.status}</span>}
          </div>
          <div className="detail-modal__meta">
            <span className={`uni-card__type badge-type-${item.university.university_type}`}>{item.university.university_type}</span>
            <span>{item.university.district}</span>
            {item.university.website && (
              <a href={item.university.website} target="_blank" rel="noopener noreferrer">Website</a>
            )}
          </div>
        </div>

        <div className="detail-modal__stats">
          {item.annual_fee && (
            <div className="detail-modal__stat">
              <span className="detail-modal__stat-val">&#x20B9;{Number(item.annual_fee).toLocaleString()}</span>
              <span className="detail-modal__stat-lbl">Annual Fee</span>
            </div>
          )}
          {item.total_seats && (
            <div className="detail-modal__stat">
              <span className="detail-modal__stat-val">{item.total_seats}</span>
              <span className="detail-modal__stat-lbl">Seats</span>
            </div>
          )}
          <div className="detail-modal__stat">
            <span className="detail-modal__stat-val">{item.course.duration_years} yr</span>
            <span className="detail-modal__stat-lbl">Duration</span>
          </div>
          <div className="detail-modal__stat">
            <span className="detail-modal__stat-val" style={{ textTransform: 'capitalize' }}>{item.course.stream}</span>
            <span className="detail-modal__stat-lbl">Stream</span>
          </div>
        </div>

        <div className="detail-modal__sections">
          {criteria && (
            <div className="detail-modal__section">
              <h4>Eligibility</h4>
              <ul>
                {criteria.min_12th_percentage && <li><strong>Min 12th:</strong> {criteria.min_12th_percentage}%</li>}
                {criteria.min_10th_percentage && <li><strong>Min 10th:</strong> {criteria.min_10th_percentage}%</li>}
                {criteria.required_stream && <li><strong>Stream:</strong> {criteria.required_stream}</li>}
                {criteria.entrance_exam && <li><strong>Entrance:</strong> {criteria.entrance_exam}</li>}
                {criteria.domicile_required && <li><strong>Domicile:</strong> Required</li>}
              </ul>
            </div>
          )}

          {cycle && (
            <div className="detail-modal__section">
              <h4>Admission {cycle.academic_year}</h4>
              <ul>
                <li><strong>Apply:</strong> {cycle.application_start} to {cycle.application_end}</li>
                {cycle.application_fee && <li><strong>Application Fee:</strong> &#x20B9;{cycle.application_fee}</li>}
                {cycle.days_remaining !== null && cycle.days_remaining > 0 && (
                  <li><strong>Days Remaining:</strong> {cycle.days_remaining}</li>
                )}
              </ul>
              {cycle.application_link && (
                <a href={cycle.application_link} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary" style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1.2rem', display: 'inline-block' }}>
                  Apply Now
                </a>
              )}
            </div>
          )}

          {item.documents.length > 0 && (
            <div className="detail-modal__section">
              <h4>Required Documents</h4>
              <ul className="detail-modal__docs">
                {item.documents.map((doc, i) => (
                  <li key={i}>
                    {doc.name}
                    {!doc.is_mandatory && <span className="optional"> (if applicable)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .detail-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.45); z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .detail-modal {
          background: white; border-radius: var(--radius-xl);
          max-width: 640px; width: 100%; max-height: 85vh;
          overflow-y: auto; padding: 2rem; position: relative;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.2s ease;
        }
        .detail-handle { display: none; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 600px) {
          .detail-overlay {
            background: white;
            padding: 0;
            display: block;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            animation: screenSlide 0.25s ease;
          }
          @keyframes screenSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .detail-modal {
            max-height: none; max-width: 100%;
            border-radius: 0;
            padding: 0 1.25rem 2rem;
            box-shadow: none;
            animation: none;
          }
          .detail-handle {
            display: flex; align-items: center; gap: 0.5rem;
            padding: 0.75rem 1rem;
            position: sticky; top: 0; z-index: 10;
            background: rgba(255,255,255,0.92);
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border, #e5e7eb);
            cursor: pointer;
          }
          .detail-handle svg {
            color: var(--primary, #1a56db);
            flex-shrink: 0;
          }
          .detail-handle__text {
            font-size: 0.92rem; font-weight: 600;
            color: var(--primary, #1a56db);
          }
          .detail-close { display: none; }
          .detail-modal__header { padding-top: 1rem; }
        }

        .detail-close {
          position: absolute; top: 1rem; right: 1rem;
          background: none; border: none; font-size: 1.5rem;
          cursor: pointer; color: var(--text-muted);
          width: 2rem; height: 2rem;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
        }
        .detail-close:hover { background: var(--bg); color: var(--text); }

        .detail-modal__header { margin-bottom: 1.25rem; }
        .detail-modal__header h2 { font-size: 1.3rem; margin: 0 0 0.4rem; color: var(--text); padding-right: 2rem; }
        .detail-modal__uni-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.3rem; flex-wrap: wrap; }
        .detail-modal__uni { font-size: 0.9rem; color: var(--primary); font-weight: 600; }
        .detail-modal__meta { display: flex; gap: 0.75rem; align-items: center; font-size: 0.8rem; color: var(--text-muted); }
        .detail-modal__meta a { color: var(--primary); text-decoration: none; font-weight: 600; }
        .detail-modal__meta a:hover { text-decoration: underline; }

        .detail-modal__stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem; padding: 1rem; background: #f8fafc;
          border-radius: var(--radius); margin-bottom: 1.25rem;
        }
        .detail-modal__stat { text-align: center; }
        .detail-modal__stat-val { display: block; font-size: 1.05rem; font-weight: 700; color: var(--primary); }
        .detail-modal__stat-lbl { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

        .detail-modal__sections { display: flex; flex-direction: column; gap: 1.25rem; }
        .detail-modal__section h4 {
          font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-muted); margin: 0 0 0.5rem;
          padding-bottom: 0.35rem; border-bottom: 1px solid var(--border);
        }
        .detail-modal__section ul { list-style: none; padding: 0; margin: 0; }
        .detail-modal__section li { font-size: 0.88rem; padding: 0.2rem 0; color: var(--text); }
        .detail-modal__docs { columns: 2; column-gap: 1.5rem; }
        .optional { color: var(--text-muted); font-size: 0.75rem; }
      `}</style>
    </div>
  )
}

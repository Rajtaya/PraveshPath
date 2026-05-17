import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMatchResults } from '../api/client'

export default function Results() {
  const { sessionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ stream: '', district: '', status: '' })

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMatchResults(sessionId)
        setData(res.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [sessionId])

  if (loading) return <div className="loading">Finding your matches...</div>
  if (error) return <div className="error-page"><p>{error}</p><Link to="/profile">Try Again</Link></div>

  const filtered = data.results.filter(item => {
    if (filter.stream && item.course.stream !== filter.stream) return false
    if (filter.district && item.college.district !== filter.district) return false
    if (filter.status) {
      const cycle = item.admission_cycles[0]
      if (!cycle || cycle.status !== filter.status) return false
    }
    return true
  })

  const districts = [...new Set(data.results.map(r => r.college.district))]
  const streams = [...new Set(data.results.map(r => r.course.stream))]

  return (
    <div className="results-page">
      <div className="results-header">
        <div>
          <h1>Your Eligible Colleges</h1>
          <p className="results-subtitle">
            {data.profile.name} &middot; {data.profile.stream} &middot; {data.profile['12th_percentage']}%
          </p>
        </div>
        <div className="match-count">
          <span className="count-number">{data.total_matches}</span>
          <span className="count-label">Matches Found</span>
        </div>
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
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="upcoming">Upcoming</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="results-count">{filtered.length} results</div>

      <div className="results-list">
        {filtered.map(item => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="no-results card">
          <p>No matches found with current filters. Try adjusting your filters above.</p>
        </div>
      )}

      <style>{`
        .results-page { max-width: 900px; margin: 0 auto; }
        .results-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .results-header h1 { font-size: 1.8rem; margin-bottom: 0.3rem; }
        .results-subtitle { color: var(--text-muted); }
        .match-count { text-align: center; background: #eff6ff; padding: 1rem 1.5rem; border-radius: var(--radius); }
        .count-number { display: block; font-size: 2rem; font-weight: 800; color: var(--primary); }
        .count-label { font-size: 0.8rem; color: var(--text-muted); }
        .filters { display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .filters select {
          padding: 0.5rem 0.75rem; border: 1px solid var(--border);
          border-radius: var(--radius); font-size: 0.85rem; background: white;
        }
        .results-count { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; }
        .results-list { display: flex; flex-direction: column; gap: 1rem; }
        .loading { text-align: center; padding: 4rem; font-size: 1.2rem; color: var(--text-muted); }
        .error-page { text-align: center; padding: 4rem; }
        .no-results { text-align: center; padding: 3rem; color: var(--text-muted); }
      `}</style>
    </div>
  )
}

function ResultCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const cycle = item.admission_cycles[0]
  const criteria = item.eligibility[0]

  return (
    <div className="card result-card">
      <div className="result-top" onClick={() => setExpanded(!expanded)}>
        <div className="result-info">
          <h3>{item.college.name}</h3>
          <p className="course-name">{item.course.name}</p>
          <div className="result-meta">
            <span className={`badge badge-${item.college.college_type}`}>
              {item.college.college_type.replace('_', ' ')}
            </span>
            <span>{item.college.district}</span>
            <span>{item.college.university_name}</span>
          </div>
        </div>
        <div className="result-right">
          {item.annual_fee && (
            <div className="fee">&#x20B9;{Number(item.annual_fee).toLocaleString()}/yr</div>
          )}
          {cycle && <span className={`badge badge-${cycle.status}`}>{cycle.status}</span>}
        </div>
      </div>

      {expanded && (
        <div className="result-details">
          <div className="detail-grid">
            {criteria && (
              <div className="detail-section">
                <h4>Eligibility</h4>
                <ul>
                  {criteria.min_12th_percentage && <li>Min 12th: {criteria.min_12th_percentage}%</li>}
                  {criteria.required_stream && <li>Stream: {criteria.required_stream}</li>}
                  {criteria.entrance_exam && <li>Exam: {criteria.entrance_exam}</li>}
                  {criteria.domicile_required && <li>Domicile Required</li>}
                </ul>
              </div>
            )}
            {cycle && (
              <div className="detail-section">
                <h4>Admission {cycle.academic_year}</h4>
                <ul>
                  <li>Apply: {cycle.application_start} to {cycle.application_end}</li>
                  {cycle.application_fee && <li>Fee: &#x20B9;{cycle.application_fee}</li>}
                  {cycle.days_remaining !== null && <li>{cycle.days_remaining} days remaining</li>}
                  {cycle.counselling_date && <li>Counselling: {cycle.counselling_date}</li>}
                </ul>
                {cycle.application_link && (
                  <a href={cycle.application_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Apply Now
                  </a>
                )}
              </div>
            )}
            {item.documents.length > 0 && (
              <div className="detail-section">
                <h4>Required Documents</h4>
                <ul>
                  {item.documents.map((doc, i) => (
                    <li key={i}>
                      {doc.name} {!doc.is_mandatory && <span className="optional">(if applicable)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {item.total_seats && <p className="seats">Total Seats: {item.total_seats}</p>}
        </div>
      )}

      <style>{`
        .result-card { cursor: pointer; transition: box-shadow 0.2s; }
        .result-card:hover { box-shadow: var(--shadow-md); }
        .result-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .result-info h3 { font-size: 1.1rem; margin-bottom: 0.2rem; }
        .course-name { color: var(--primary); font-weight: 500; margin-bottom: 0.5rem; }
        .result-meta { display: flex; gap: 0.75rem; align-items: center; font-size: 0.8rem; color: var(--text-muted); }
        .result-right { text-align: right; }
        .fee { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
        .result-details { margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .detail-section h4 { font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.03em; }
        .detail-section ul { list-style: none; padding: 0; }
        .detail-section li { font-size: 0.9rem; padding: 0.2rem 0; }
        .optional { color: var(--text-muted); font-size: 0.8rem; }
        .seats { margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted); }
      `}</style>
    </div>
  )
}

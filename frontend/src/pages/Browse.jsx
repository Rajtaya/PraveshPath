import { useState, useEffect } from 'react'
import { getCollegeCourses, getUniversities } from '../api/client'

export default function Browse() {
  const [results, setResults] = useState([])
  const [universities, setUniversities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    course__stream: '',
    course__level: '',
    college__university: '',
    college__district: '',
  })

  useEffect(() => {
    getUniversities().then(res => setUniversities(res.data.results || res.data))
  }, [])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = {}
        Object.entries(filters).forEach(([key, val]) => {
          if (val) params[key === 'search' ? 'search' : key] = val
        })
        const res = await getCollegeCourses(params)
        setResults(res.data.results || res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(fetch, 300)
    return () => clearTimeout(timer)
  }, [filters])

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  return (
    <div className="browse-page">
      <h1>Browse Colleges & Courses</h1>

      <div className="browse-filters card">
        <input
          type="text"
          placeholder="Search colleges or courses..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
          className="search-input"
        />
        <div className="filter-row">
          <select value={filters['course__stream']} onChange={e => updateFilter('course__stream', e.target.value)}>
            <option value="">All Streams</option>
            <option value="arts">Arts</option>
            <option value="science">Science</option>
            <option value="commerce">Commerce</option>
            <option value="computer">Computer</option>
            <option value="engineering">Engineering</option>
            <option value="management">Management</option>
            <option value="law">Law</option>
            <option value="medical">Medical</option>
            <option value="education">Education</option>
          </select>
          <select value={filters['course__level']} onChange={e => updateFilter('course__level', e.target.value)}>
            <option value="">All Levels</option>
            <option value="ug">Undergraduate</option>
            <option value="pg">Postgraduate</option>
            <option value="diploma">Diploma</option>
          </select>
          <select value={filters['college__university']} onChange={e => updateFilter('college__university', e.target.value)}>
            <option value="">All Universities</option>
            {universities.map(u => (
              <option key={u.id} value={u.id}>{u.short_name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <p className="browse-count">{results.length} results</p>
          <div className="browse-grid">
            {results.map(item => (
              <div key={item.id} className="card browse-card">
                <div className="browse-card-header">
                  <span className={`badge badge-${item.college_type}`}>
                    {item.college_type.replace('_', ' ')}
                  </span>
                  <span className="uni-tag">{item.university_name}</span>
                </div>
                <h3>{item.college_name}</h3>
                <p className="browse-course">{item.course_name}</p>
                <div className="browse-meta">
                  <span>{item.college_district}</span>
                  {item.annual_fee && <span>&#x20B9;{Number(item.annual_fee).toLocaleString()}/yr</span>}
                  {item.total_seats && <span>{item.total_seats} seats</span>}
                </div>
                {item.application_deadline && (
                  <div className="deadline">
                    <span className={`badge badge-${item.current_status}`}>{item.current_status}</span>
                    <span className="deadline-date">Deadline: {item.application_deadline}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .browse-page h1 { font-size: 1.8rem; margin-bottom: 1.5rem; }
        .browse-filters { margin-bottom: 1.5rem; }
        .search-input {
          width: 100%; padding: 0.75rem 1rem;
          border: 1px solid var(--border); border-radius: var(--radius);
          font-size: 1rem; margin-bottom: 1rem;
        }
        .search-input:focus { outline: none; border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .filter-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .filter-row select { padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.85rem; }
        .browse-count { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; }
        .browse-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
        .browse-card { transition: box-shadow 0.2s; }
        .browse-card:hover { box-shadow: var(--shadow-md); }
        .browse-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .uni-tag { font-size: 0.75rem; font-weight: 600; color: var(--primary); }
        .browse-card h3 { font-size: 1rem; margin-bottom: 0.3rem; }
        .browse-course { color: var(--primary); font-weight: 500; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .browse-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-muted); }
        .deadline { margin-top: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .deadline-date { font-size: 0.8rem; color: var(--text-muted); }
        .loading { text-align: center; padding: 3rem; color: var(--text-muted); }
      `}</style>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { getBrowseUniversities, getUniversityProgrammes } from '../api/client'

export default function Browse() {
  const [level, setLevel] = useState('ug')
  const [universities, setUniversities] = useState([])
  const [selectedUni, setSelectedUni] = useState(null)
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(false)
  const [uniSearch, setUniSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    setSelectedUni(null)
    setProgrammes([])
    getBrowseUniversities(level)
      .then(res => setUniversities(res.data))
      .finally(() => setLoading(false))
  }, [level])

  const handleSelectUni = (uni) => {
    setSelectedUni(uni)
    setLoading(true)
    getUniversityProgrammes(uni.id, level)
      .then(res => setProgrammes(res.data))
      .finally(() => setLoading(false))
  }

  const filteredUnis = universities.filter(u =>
    u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
    u.short_name.toLowerCase().includes(uniSearch.toLowerCase())
  )

  if (!selectedUni) {
    return (
      <div className="browse-page" style={{ animation: 'fadeInUp 0.4s ease both' }}>
        <div className="browse-header">
          <h1>Browse Universities & Programmes</h1>
          <p className="browse-subtitle">Explore the complete catalogue of programmes across Haryana</p>
        </div>

        <div className="browse-controls">
          <div className="level-toggle">
            <button className={`toggle-btn ${level === 'ug' ? 'active' : ''}`} onClick={() => setLevel('ug')}>
              Undergraduate (UG)
            </button>
            <button className={`toggle-btn ${level === 'pg' ? 'active' : ''}`} onClick={() => setLevel('pg')}>
              Postgraduate (PG)
            </button>
          </div>
          <div className="search-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search universities..."
              value={uniSearch}
              onChange={e => setUniSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <span>Loading universities...</span>
          </div>
        ) : (
          <div className="uni-grid">
            {filteredUnis.map(uni => (
              <div key={uni.id} className="card uni-card" onClick={() => handleSelectUni(uni)}>
                <div className="uni-card-header">
                  <span className={`badge badge-${uni.university_type}`}>{uni.university_type}</span>
                  <span className="uni-programme-count">{uni.programme_count} programmes</span>
                </div>
                <h3>{uni.short_name}</h3>
                <p className="uni-full-name">{uni.name}</p>
                <p className="uni-district">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {uni.district}
                </p>
                <div className="uni-programmes">
                  {uni.programmes.slice(0, 6).map(p => (
                    <span key={p} className="programme-chip">{p}</span>
                  ))}
                  {uni.programmes.length > 6 && (
                    <span className="programme-chip more">+{uni.programmes.length - 6}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <style>{browseStyles}</style>
      </div>
    )
  }

  return (
    <div className="browse-page" style={{ animation: 'fadeInUp 0.3s ease both' }}>
      <div className="browse-breadcrumb">
        <button className="crumb clickable" onClick={() => setSelectedUni(null)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          {level.toUpperCase()} Universities
        </button>
        <span className="crumb-sep">/</span>
        <span className="crumb active">{selectedUni.short_name}</span>
      </div>

      <div className="uni-detail-header">
        <div>
          <h1>{selectedUni.name}</h1>
          <p className="uni-meta">
            <span className={`badge badge-${selectedUni.university_type}`}>{selectedUni.university_type}</span>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {selectedUni.district}
            </span>
            <span>{programmes.length} programmes</span>
          </p>
        </div>
        {selectedUni.website && (
          <a href={selectedUni.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Visit Website
          </a>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
          <span>Loading programmes...</span>
        </div>
      ) : (
        <div className="programme-list">
          {programmes.map(prog => (
            <div key={prog.id} className="card programme-card">
              <div className="programme-card-header">
                <div className="programme-name-row">
                  <h3>{prog.course_name}</h3>
                  <span className={`badge badge-${prog.status}`}>{prog.status}</span>
                </div>
                <div className="programme-meta">
                  <span className={`stream-tag stream-${prog.stream}`}>{prog.stream}</span>
                  <span>{prog.duration_years} yr</span>
                  {prog.total_seats && <span>{prog.total_seats} seats</span>}
                  {prog.annual_fee && <span>&#x20B9;{Number(prog.annual_fee).toLocaleString()}/yr</span>}
                </div>
              </div>
              <div className="programme-details">
                {prog.entrance_exam && <span className="detail-chip">Entrance: {prog.entrance_exam}</span>}
                {prog.application_end && <span className="detail-chip">Deadline: {prog.application_end}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{browseStyles}</style>
    </div>
  )
}

const browseStyles = `
  .browse-page h1 { font-size: 1.8rem; margin-bottom: 0.25rem; }
  .browse-header { margin-bottom: 1.5rem; }
  .browse-subtitle { color: var(--text-muted); font-size: 0.95rem; }

  .browse-controls {
    display: flex; gap: 1rem; margin-bottom: 1.5rem;
    flex-wrap: wrap; align-items: center;
  }
  .level-toggle {
    display: flex; gap: 0;
    border: 1.5px solid var(--border); border-radius: var(--radius); overflow: hidden;
  }
  .toggle-btn {
    padding: 0.55rem 1.5rem; font-size: 0.9rem; font-weight: 600;
    border: none; background: #fff; color: var(--text-muted); cursor: pointer;
    transition: all var(--transition);
  }
  .toggle-btn:not(:last-child) { border-right: 1.5px solid var(--border); }
  .toggle-btn.active { background: var(--primary); color: #fff; }
  .toggle-btn:hover:not(.active) { background: var(--bg); }

  .search-wrap {
    position: relative; flex: 1; max-width: 350px;
  }
  .search-icon {
    position: absolute; left: 0.85rem; top: 50%;
    transform: translateY(-50%); color: var(--text-light);
    pointer-events: none;
  }
  .search-input {
    width: 100%; padding: 0.65rem 1rem 0.65rem 2.75rem;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    font-size: 0.9rem; transition: all var(--transition);
    background: white;
  }
  .search-input:focus {
    outline: none; border-color: var(--primary-light);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .browse-breadcrumb {
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.25rem; font-size: 0.88rem;
  }
  .crumb { color: var(--text-muted); }
  .crumb.clickable {
    color: var(--primary); cursor: pointer;
    background: none; border: none; font-size: 0.88rem; font-weight: 500;
    display: flex; align-items: center; gap: 0.3rem;
    padding: 0;
  }
  .crumb.clickable:hover { text-decoration: underline; }
  .crumb.active { color: var(--text); font-weight: 600; }
  .crumb-sep { color: var(--border); }

  .uni-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.25rem;
  }
  .uni-card {
    cursor: pointer; transition: all var(--transition);
    border: 1.5px solid var(--border);
  }
  .uni-card:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
    transform: translateY(-3px);
  }
  .uni-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .uni-programme-count { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
  .uni-card h3 { font-size: 1.2rem; color: var(--primary); margin-bottom: 0.2rem; }
  .uni-full-name { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .uni-district {
    font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;
    text-transform: capitalize;
    display: flex; align-items: center; gap: 0.3rem;
  }
  .uni-programmes { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .programme-chip {
    font-size: 0.7rem; padding: 0.2rem 0.55rem;
    background: var(--primary-50); color: var(--primary); border-radius: 999px; font-weight: 500;
  }
  .programme-chip.more { background: var(--bg); color: var(--text-muted); }

  .uni-detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
  .uni-meta {
    display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem;
    font-size: 0.85rem; color: var(--text-muted);
  }
  .uni-meta span { display: flex; align-items: center; gap: 0.25rem; }

  .programme-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }
  .programme-card {
    transition: all var(--transition);
    display: flex; flex-direction: column;
    border: 1.5px solid var(--border);
  }
  .programme-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .programme-card-header { margin-bottom: 0.5rem; }
  .programme-name-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem; }
  .programme-name-row h3 { font-size: 0.95rem; margin: 0; flex: 1; line-height: 1.35; }
  .programme-meta { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; font-size: 0.8rem; color: var(--text-muted); }
  .stream-tag {
    font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 999px; font-weight: 600; text-transform: capitalize;
  }
  .stream-tag.stream-arts { background: #fef3c7; color: #92400e; }
  .stream-tag.stream-science { background: #d1fae5; color: #065f46; }
  .stream-tag.stream-commerce { background: #dbeafe; color: #1e40af; }
  .stream-tag.stream-computer { background: #ede9fe; color: #5b21b6; }
  .stream-tag.stream-management { background: #fce7f3; color: #9d174d; }
  .stream-tag.stream-education { background: #ffedd5; color: #9a3412; }
  .stream-tag.stream-design { background: #e0e7ff; color: #3730a3; }
  .stream-tag.stream-law { background: #fef9c3; color: #854d0e; }
  .stream-tag.stream-engineering { background: #f3e8ff; color: #6b21a8; }
  .stream-tag.stream-medical { background: #fce4ec; color: #880e4f; }

  .programme-details { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .detail-chip {
    font-size: 0.75rem; padding: 0.2rem 0.6rem;
    background: var(--bg); color: var(--text-muted); border-radius: 999px;
  }

  .loading {
    text-align: center; padding: 3rem;
    color: var(--text-muted);
    display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  }
  .loading-spinner {
    width: 28px; height: 28px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .uni-grid { grid-template-columns: 1fr; }
    .programme-list { grid-template-columns: 1fr; }
    .uni-detail-header { flex-direction: column; }
    .browse-controls { flex-direction: column; }
    .search-wrap { max-width: 100%; }
  }
`

import { useState, useEffect } from 'react'
import { getBrowseUniversities, getUniversityProgrammes } from '../api/client'

const getGradient = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const h1 = Math.abs(hash % 360)
  const h2 = (h1 + 35) % 360
  return `linear-gradient(135deg, hsl(${h1}, 50%, 38%), hsl(${h2}, 60%, 50%))`
}

const streamGradients = {
  any: 'linear-gradient(135deg, #334155, #64748b)',
  science: 'linear-gradient(135deg, #065f46, #10b981)',
  arts: 'linear-gradient(135deg, #92400e, #d97706)',
  commerce: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  engineering: 'linear-gradient(135deg, #5b21b6, #8b5cf6)',
  management: 'linear-gradient(135deg, #9d174d, #ec4899)',
  education: 'linear-gradient(135deg, #9a3412, #f97316)',
  law: 'linear-gradient(135deg, #854d0e, #ca8a04)',
  computer: 'linear-gradient(135deg, #3730a3, #6366f1)',
  medical: 'linear-gradient(135deg, #881337, #e11d48)',
  design: 'linear-gradient(135deg, #1e40af, #60a5fa)',
  other: 'linear-gradient(135deg, #374151, #6b7280)',
}

const streamLabel = (s) => (!s || s === 'any') ? 'General' : s

export default function Browse() {
  const [level, setLevel] = useState('ug')
  const [universities, setUniversities] = useState([])
  const [selectedUni, setSelectedUni] = useState(null)
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(false)
  const [uniSearch, setUniSearch] = useState('')
  const [filters, setFilters] = useState({ type: [], district: [] })
  const [expanded, setExpanded] = useState({ type: true, district: true })
  const [showFilters, setShowFilters] = useState(false)
  const [expandedProg, setExpandedProg] = useState(null)
  const [streamFilter, setStreamFilter] = useState('')

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
    setExpandedProg(null)
    setStreamFilter('')
    setLoading(true)
    window.scrollTo(0, 0)
    getUniversityProgrammes(uni.id, level)
      .then(res => setProgrammes(res.data))
      .finally(() => setLoading(false))
  }

  const uniqueTypes = [...new Set(universities.map(u => u.university_type))].filter(Boolean)
  const uniqueDistricts = [...new Set(universities.map(u => u.district))].filter(Boolean).sort()

  const toggleFilter = (cat, val) => {
    setFilters(prev => ({
      ...prev,
      [cat]: prev[cat].includes(val) ? prev[cat].filter(v => v !== val) : [...prev[cat], val]
    }))
  }

  const clearFilters = () => setFilters({ type: [], district: [] })
  const hasFilters = filters.type.length > 0 || filters.district.length > 0

  const filteredUnis = universities.filter(u => {
    const s = uniSearch.toLowerCase()
    return (u.name.toLowerCase().includes(s) || u.short_name.toLowerCase().includes(s)) &&
      (!filters.type.length || filters.type.includes(u.university_type)) &&
      (!filters.district.length || filters.district.includes(u.district))
  })

  const uniqueStreams = [...new Set(programmes.map(p => p.stream))].filter(Boolean).sort()
  const filteredProgs = programmes.filter(p => !streamFilter || p.stream === streamFilter)

  const ChevronIcon = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {open ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  )

  const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )

  const FilterSidebar = () => (
    <>
      {showFilters && <div className="b-filter-overlay" onClick={() => setShowFilters(false)} />}
      <aside className={`b-sidebar ${showFilters ? 'open' : ''}`}>
        <div className="b-sidebar-top">
          <button className="b-clear-btn" onClick={clearFilters} disabled={!hasFilters}>Clear all</button>
          <ChevronIcon open={true} />
        </div>

        <div className="b-filter-group">
          <button className="b-filter-title" onClick={() => setExpanded(p => ({ ...p, type: !p.type }))}>
            <span>University Type</span>
            <span className="b-filter-icons"><InfoIcon /><ChevronIcon open={expanded.type} /></span>
          </button>
          {expanded.type && (
            <div className="b-filter-opts">
              {uniqueTypes.map(t => (
                <label key={t} className="b-filter-opt">
                  <input type="checkbox" checked={filters.type.includes(t)} onChange={() => toggleFilter('type', t)} />
                  <span className="b-check" />
                  <span style={{ textTransform: 'capitalize' }}>{t}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="b-filter-group">
          <button className="b-filter-title" onClick={() => setExpanded(p => ({ ...p, district: !p.district }))}>
            <span>District</span>
            <span className="b-filter-icons"><InfoIcon /><ChevronIcon open={expanded.district} /></span>
          </button>
          {expanded.district && (
            <div className="b-filter-opts">
              {uniqueDistricts.map(d => (
                <label key={d} className="b-filter-opt">
                  <input type="checkbox" checked={filters.district.includes(d)} onChange={() => toggleFilter('district', d)} />
                  <span className="b-check" />
                  <span style={{ textTransform: 'capitalize' }}>{d}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="b-filter-group">
          <button className="b-filter-title" onClick={() => setExpanded(p => ({ ...p, level: !p.level }))}>
            <span>Level</span>
            <span className="b-filter-icons"><InfoIcon /><ChevronIcon open={expanded.level} /></span>
          </button>
          {expanded.level && (
            <div className="b-filter-opts">
              <label className="b-filter-opt">
                <input type="radio" name="level" checked={level === 'ug'} onChange={() => setLevel('ug')} />
                <span className="b-radio" />
                <span>Undergraduate</span>
              </label>
              <label className="b-filter-opt">
                <input type="radio" name="level" checked={level === 'pg'} onChange={() => setLevel('pg')} />
                <span className="b-radio" />
                <span>Postgraduate</span>
              </label>
            </div>
          )}
        </div>
      </aside>
    </>
  )

  if (!selectedUni) {
    return (
      <div className="b-page" style={{ animation: 'fadeInUp 0.4s ease both' }}>
        <div className="b-header">
          <h1>Browse Universities & Programmes</h1>
          <p className="b-subtitle">Explore the complete catalogue of programmes across Haryana</p>
        </div>

        <div className="b-topbar">
          <div className="b-toggle">
            <button className={`b-toggle-btn ${level === 'ug' ? 'active' : ''}`} onClick={() => setLevel('ug')}>Undergraduate</button>
            <button className={`b-toggle-btn ${level === 'pg' ? 'active' : ''}`} onClick={() => setLevel('pg')}>Postgraduate</button>
          </div>
          <div className="b-search-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="b-search-icon">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search universities..." value={uniSearch} onChange={e => setUniSearch(e.target.value)} className="b-search" />
          </div>
          <button className="b-filter-mobile-btn" onClick={() => setShowFilters(!showFilters)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Filters{hasFilters ? ` (${filters.type.length + filters.district.length})` : ''}
          </button>
        </div>

        <div className="b-layout">
          <FilterSidebar />
          <div className="b-content">
            {loading ? (
              <div className="b-loading"><div className="b-spinner" /><span>Loading universities...</span></div>
            ) : filteredUnis.length === 0 ? (
              <div className="b-empty">
                <p>No universities found.</p>
                {hasFilters && <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>}
              </div>
            ) : (
              <div className="b-grid">
                {filteredUnis.map(uni => (
                  <div key={uni.id} className="b-card" onClick={() => handleSelectUni(uni)}>
                    <div className="b-card-img" style={{ background: getGradient(uni.name) }}>
                      <span className="b-card-img-label">{uni.short_name}</span>
                    </div>
                    <div className="b-card-body">
                      <div className="b-card-row">
                        <div className="b-logo" style={{ background: getGradient(uni.name) }}>
                          {uni.short_name.charAt(0)}
                        </div>
                        <div className="b-card-text">
                          <h3>{uni.name}</h3>
                          <p>{uni.programme_count} {level === 'ug' ? 'Undergraduate' : 'Postgraduate'} Programme{uni.programme_count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <button className="b-action-btn">View Programmes</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <style>{styles}</style>
      </div>
    )
  }

  return (
    <div className="b-page" style={{ animation: 'fadeInUp 0.3s ease both' }}>
      <button className="b-back" onClick={() => { setSelectedUni(null); window.scrollTo(0, 0) }}>
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M14 5L8 11L14 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to Universities
      </button>

      <div className="b-detail-header">
        <div className="b-detail-info">
          <div className="b-logo lg" style={{ background: getGradient(selectedUni.name) }}>{selectedUni.short_name.charAt(0)}</div>
          <div>
            <h1>{selectedUni.name}</h1>
            <div className="b-meta">
              <span className={`badge badge-${selectedUni.university_type}`}>{selectedUni.university_type}</span>
              <span className="b-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {selectedUni.district}
              </span>
              <span className="b-meta-item">{programmes.length} programmes</span>
            </div>
          </div>
        </div>
        {selectedUni.website && (
          <a href={selectedUni.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Visit Website
          </a>
        )}
      </div>

      {!loading && uniqueStreams.length > 1 && (
        <div className="b-stream-pills">
          <button className={`b-pill ${!streamFilter ? 'active' : ''}`} onClick={() => setStreamFilter('')}>All</button>
          {uniqueStreams.map(s => (
            <button key={s} className={`b-pill ${streamFilter === s ? 'active' : ''}`} onClick={() => setStreamFilter(s)}>
              {streamLabel(s)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="b-loading"><div className="b-spinner" /><span>Loading programmes...</span></div>
      ) : (
        <div className="b-grid">
          {filteredProgs.map(prog => (
            <div key={prog.id} className="b-card prog">
              <div className="b-card-img" style={{ background: streamGradients[prog.stream] || 'linear-gradient(135deg, #475569, #94a3b8)' }}>
                <span className="b-card-img-label" style={{ textTransform: 'capitalize' }}>{streamLabel(prog.stream)}</span>
              </div>
              <div className="b-card-body">
                <div className="b-card-row">
                  <div className="b-logo" style={{ background: getGradient(selectedUni.name) }}>
                    {selectedUni.short_name.charAt(0)}
                  </div>
                  <div className="b-card-text">
                    <h3>{prog.course_name}</h3>
                    <p>
                      <span style={{ textTransform: 'capitalize' }}>{streamLabel(prog.stream)}</span>
                      {prog.duration_years && <span> &middot; {prog.duration_years} yr</span>}
                    </p>
                  </div>
                </div>
                {expandedProg === prog.id && (
                  <div className="b-prog-details">
                    {prog.status && <div className="b-detail-row"><span className="b-detail-label">Status</span><span className={`badge badge-${prog.status}`}>{prog.status}</span></div>}
                    {prog.total_seats && <div className="b-detail-row"><span className="b-detail-label">Seats</span><span>{prog.total_seats}</span></div>}
                    {prog.annual_fee && <div className="b-detail-row"><span className="b-detail-label">Fee</span><span>&#x20B9;{Number(prog.annual_fee).toLocaleString()}/yr</span></div>}
                    {prog.entrance_exam && <div className="b-detail-row"><span className="b-detail-label">Entrance</span><span>{prog.entrance_exam}</span></div>}
                    {prog.application_end && <div className="b-detail-row"><span className="b-detail-label">Deadline</span><span>{prog.application_end}</span></div>}
                  </div>
                )}
                <button className="b-action-btn" onClick={e => { e.stopPropagation(); setExpandedProg(expandedProg === prog.id ? null : prog.id) }}>
                  {expandedProg === prog.id ? 'Less info' : 'More info'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{styles}</style>
    </div>
  )
}

const styles = `
  /* Page */
  .b-page h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
  .b-header { margin-bottom: 1.5rem; }
  .b-subtitle { color: var(--text-muted); font-size: 0.95rem; }

  /* Top bar */
  .b-topbar {
    display: flex; gap: 1rem; margin-bottom: 1.5rem;
    flex-wrap: wrap; align-items: center;
  }
  .b-toggle {
    display: flex;
    border: 1.5px solid var(--border); border-radius: var(--radius); overflow: hidden;
  }
  .b-toggle-btn {
    padding: 0.55rem 1.25rem; font-size: 0.88rem; font-weight: 600;
    border: none; background: #fff; color: var(--text-muted); cursor: pointer;
    transition: all var(--transition);
  }
  .b-toggle-btn:not(:last-child) { border-right: 1.5px solid var(--border); }
  .b-toggle-btn.active { background: var(--primary); color: #fff; }
  .b-toggle-btn:hover:not(.active) { background: var(--bg); }

  .b-search-wrap { position: relative; flex: 1; max-width: 320px; }
  .b-search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-light); pointer-events: none; }
  .b-search {
    width: 100%; padding: 0.6rem 1rem 0.6rem 2.75rem;
    border: 1.5px solid var(--border); border-radius: var(--radius);
    font-size: 0.88rem; background: white; transition: all var(--transition);
  }
  .b-search:focus { outline: none; border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

  .b-filter-mobile-btn {
    display: none; align-items: center; gap: 0.4rem;
    padding: 0.55rem 1rem; border: 1.5px solid var(--border); border-radius: var(--radius);
    background: white; font-size: 0.88rem; font-weight: 600; color: var(--text-muted);
    cursor: pointer; transition: all var(--transition);
  }
  .b-filter-mobile-btn:hover { border-color: var(--primary-light); color: var(--primary); }

  /* Layout */
  .b-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
  .b-content { flex: 1; min-width: 0; }

  /* Filter sidebar */
  .b-sidebar {
    width: 220px; flex-shrink: 0;
    background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 0.75rem; position: sticky; top: 5rem;
  }
  .b-sidebar-top {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0.5rem 0.75rem; border-bottom: 1px solid var(--border);
  }
  .b-clear-btn {
    background: none; border: none; color: var(--text-muted); font-size: 0.88rem;
    cursor: pointer; padding: 0; font-weight: 500;
  }
  .b-clear-btn:hover:not(:disabled) { color: var(--primary); }
  .b-clear-btn:disabled { opacity: 0.4; cursor: default; }

  .b-filter-group { border-bottom: 1px solid var(--border); }
  .b-filter-group:last-child { border-bottom: none; }
  .b-filter-title {
    display: flex; justify-content: space-between; align-items: center;
    width: 100%; padding: 0.75rem 0.5rem; background: none; border: none;
    cursor: pointer; font-size: 0.9rem; font-weight: 600; color: var(--text);
  }
  .b-filter-title:hover { color: var(--primary); }
  .b-filter-icons { display: flex; align-items: center; gap: 0.4rem; }
  .b-filter-opts { padding: 0 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }

  .b-filter-opt {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.82rem; color: var(--text); cursor: pointer;
  }
  .b-filter-opt input { display: none; }
  .b-check {
    width: 16px; height: 16px; border: 1.5px solid var(--border); border-radius: 3px;
    flex-shrink: 0; position: relative; transition: all var(--transition);
  }
  .b-filter-opt input:checked + .b-check {
    background: var(--primary); border-color: var(--primary);
  }
  .b-filter-opt input:checked + .b-check::after {
    content: ''; position: absolute; left: 4px; top: 1px;
    width: 5px; height: 9px; border: solid white; border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  .b-radio {
    width: 16px; height: 16px; border: 1.5px solid var(--border); border-radius: 50%;
    flex-shrink: 0; position: relative; transition: all var(--transition);
  }
  .b-filter-opt input:checked + .b-radio {
    border-color: var(--primary);
  }
  .b-filter-opt input:checked + .b-radio::after {
    content: ''; position: absolute; left: 3px; top: 3px;
    width: 8px; height: 8px; border-radius: 50%; background: var(--primary);
  }
  .b-filter-overlay { display: none; }

  /* Card grid */
  .b-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
  }

  /* Cards */
  .b-card {
    background: white; border: 1px solid var(--border); border-radius: var(--radius-lg);
    overflow: hidden; cursor: pointer; transition: all var(--transition);
    display: flex; flex-direction: column;
  }
  .b-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .b-card.prog { cursor: default; }
  .b-card.prog:hover { transform: none; box-shadow: var(--shadow); }

  .b-card-img {
    height: 150px; position: relative; display: flex;
    align-items: flex-end; padding: 1rem 1.25rem;
  }
  .b-card-img::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(transparent 40%, rgba(0,0,0,0.35));
    pointer-events: none;
  }
  .b-card-img-label {
    position: relative; z-index: 1;
    color: white; font-weight: 700; font-size: 1.1rem;
    text-shadow: 0 1px 4px rgba(0,0,0,0.3);
    letter-spacing: 0.02em;
  }

  .b-card-body { padding: 1rem 1.25rem 1.25rem; flex: 1; display: flex; flex-direction: column; }
  .b-card-row { display: flex; align-items: flex-start; gap: 0.65rem; margin-bottom: auto; padding-bottom: 1rem; }
  .b-logo {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 0.85rem;
  }
  .b-logo.lg { width: 48px; height: 48px; font-size: 1.2rem; }
  .b-card-text { min-width: 0; }
  .b-card-text h3 {
    font-size: 0.92rem; font-weight: 600; line-height: 1.35;
    margin: 0 0 0.15rem; color: var(--text);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .b-card-text p { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

  .b-action-btn {
    width: 100%; padding: 0.6rem; border: 1.5px solid var(--border); border-radius: var(--radius);
    background: white; color: var(--text); font-size: 0.85rem; font-weight: 500;
    cursor: pointer; transition: all var(--transition); text-align: center;
  }
  .b-action-btn:hover { border-color: var(--primary); color: var(--primary); }

  /* Programme expanded details */
  .b-prog-details {
    padding: 0.75rem 0; margin-bottom: 0.75rem;
    border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 0.4rem;
    animation: fadeIn 0.2s ease;
  }
  .b-detail-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.82rem;
  }
  .b-detail-label { color: var(--text-muted); font-weight: 500; }

  /* Back button */
  .b-back {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: var(--primary-light, #eff6ff); border: none;
    color: var(--primary); font-size: 0.9rem; font-weight: 600;
    cursor: pointer; padding: 0.55rem 1rem 0.55rem 0.7rem;
    margin-bottom: 1.25rem; border-radius: 999px;
    transition: all 0.15s ease;
  }
  .b-back:hover { background: var(--primary); color: white; }
  .b-back:hover svg { color: white; }

  /* Detail header */
  .b-detail-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
  }
  .b-detail-info { display: flex; align-items: flex-start; gap: 1rem; }
  .b-meta { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted); flex-wrap: wrap; }
  .b-meta-item { display: flex; align-items: center; gap: 0.25rem; text-transform: capitalize; }

  /* Stream pills */
  .b-stream-pills {
    display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;
  }
  .b-pill {
    padding: 0.4rem 1rem; border: 1.5px solid var(--border); border-radius: 999px;
    background: white; font-size: 0.82rem; font-weight: 500; color: var(--text-muted);
    cursor: pointer; text-transform: capitalize; transition: all var(--transition);
  }
  .b-pill.active { background: var(--primary); color: white; border-color: var(--primary); }
  .b-pill:hover:not(.active) { border-color: var(--primary-light); color: var(--primary); }

  /* Loading */
  .b-loading {
    text-align: center; padding: 3rem; color: var(--text-muted);
    display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  }
  .b-spinner {
    width: 28px; height: 28px;
    border: 3px solid var(--border); border-top-color: var(--primary);
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .b-empty { text-align: center; padding: 3rem; color: var(--text-muted); }

  /* Mobile */
  @media (max-width: 900px) {
    .b-sidebar { display: none; }
    .b-sidebar.open {
      display: block; position: fixed; top: 0; left: 0; width: 280px; height: 100vh;
      z-index: 200; border-radius: 0; overflow-y: auto;
      box-shadow: 4px 0 20px rgba(0,0,0,0.15);
    }
    .b-filter-overlay {
      display: block; position: fixed; inset: 0;
      background: rgba(0,0,0,0.3); z-index: 199;
    }
    .b-filter-mobile-btn { display: flex; }
    .b-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
  }

  @media (max-width: 600px) {
    .b-topbar { flex-direction: column; align-items: stretch; }
    .b-search-wrap { max-width: 100%; }
    .b-grid { grid-template-columns: 1fr; }
    .b-detail-header { flex-direction: column; }
    .b-detail-info { flex-direction: column; align-items: flex-start; }
    .b-page h1 { font-size: 1.35rem; }
  }
`

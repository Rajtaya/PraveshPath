import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Home() {
  const [stats, setStats] = useState({ universities: 0, programmes: 0, offerings: 0, districts: 0 })

  useEffect(() => {
    api.get('/stats/').then(res => setStats(res.data)).catch(() => {})
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <h1>Find Your Perfect Programme in Haryana</h1>
        <p className="subtitle">
          One profile. Instant eligibility matching across all Haryana universities.
        </p>
        <div className="hero-actions">
          <Link to="/profile" className="btn btn-primary btn-lg">
            Check My Eligibility
          </Link>
          <Link to="/browse" className="btn btn-secondary btn-lg">
            Browse Universities
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-grid">
          <div className="card feature-card">
            <div className="feature-icon">&#x1F4CB;</div>
            <h3>One Profile</h3>
            <p>Fill your academic details once — marks, stream, preferences.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">&#x2705;</div>
            <h3>Instant Matching</h3>
            <p>See all universities and programmes you're eligible for immediately.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">&#x1F4C5;</div>
            <h3>Deadlines & Docs</h3>
            <p>Never miss a deadline. Know exactly which documents you need.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon">&#x1F517;</div>
            <h3>Direct Apply</h3>
            <p>Get direct links to application portals for each university.</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat-grid">
          <div className="stat">
            <span className="stat-number">{stats.universities}</span>
            <span className="stat-label">Universities</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.programmes}</span>
            <span className="stat-label">Programmes</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.offerings}</span>
            <span className="stat-label">Offerings</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.districts}</span>
            <span className="stat-label">Districts</span>
          </div>
        </div>
      </section>

      <style>{`
        .home { text-align: center; }
        .hero { padding: 3rem 0; }
        .hero h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary-dark);
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        .subtitle {
          font-size: 1.2rem;
          color: var(--text-muted);
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .features { padding: 3rem 0; }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .feature-card { text-align: center; padding: 2rem 1.5rem; }
        .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .feature-card h3 { margin-bottom: 0.5rem; color: var(--text); }
        .feature-card p { color: var(--text-muted); font-size: 0.9rem; }
        .stats { padding: 2rem 0; }
        .stat-grid {
          display: flex;
          justify-content: center;
          gap: 3rem;
          flex-wrap: wrap;
        }
        .stat { display: flex; flex-direction: column; align-items: center; }
        .stat-number { font-size: 2.5rem; font-weight: 800; color: var(--primary); }
        .stat-label { color: var(--text-muted); font-size: 0.9rem; }
      `}</style>
    </div>
  )
}

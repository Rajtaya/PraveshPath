import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function AnimatedNumber({ target, duration = 1200 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (!target) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}</span>
}

const FEATURES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'One Profile',
    desc: 'Fill your academic details once — marks, stream, and preferences.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Instant Matching',
    desc: 'See all universities and programmes you\'re eligible for immediately.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    title: 'Deadlines & Docs',
    desc: 'Never miss a deadline. Know exactly which documents you need.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    ),
    title: 'Direct Apply',
    desc: 'Get direct links to application portals for each university.',
  },
]

const STEPS = [
  { num: '1', title: 'Create Profile', desc: 'Enter your qualifications, marks, and stream' },
  { num: '2', title: 'Get Matches', desc: 'We check eligibility across all Haryana universities' },
  { num: '3', title: 'Apply Directly', desc: 'See deadlines, documents, and apply with one click' },
]

export default function Home() {
  const [stats, setStats] = useState({ universities: 0, programmes: 0, offerings: 0, districts: 0 })

  useEffect(() => {
    api.get('/stats/').then(res => setStats(res.data)).catch(() => {})
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">Admissions 2025-26</div>
          <h1>Find Your Perfect<br />Programme in Haryana</h1>
          <p className="hero-subtitle">
            One profile. Instant eligibility matching across all Haryana universities.
            Compare fees, deadlines, and eligibility — all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/profile" className="btn btn-primary btn-lg hero-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Check My Eligibility
            </Link>
            <Link to="/browse" className="btn btn-secondary btn-lg hero-btn">
              Browse Universities
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-number"><AnimatedNumber target={stats.universities} /></span>
            <span className="stat-label">Universities</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number"><AnimatedNumber target={stats.programmes} /></span>
            <span className="stat-label">Programmes</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number"><AnimatedNumber target={stats.offerings} /></span>
            <span className="stat-label">Offerings</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number"><AnimatedNumber target={stats.districts} /></span>
            <span className="stat-label">Districts</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need</h2>
          <p>From eligibility check to application — we've got you covered</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to find your match</p>
        </div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className="step-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>}
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to Find Your Programme?</h2>
          <p>Join students who've already discovered their eligible programmes across Haryana.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get Started — It's Free
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/logo.png" alt="PraveshPath" className="footer-logo" />
            <span className="footer-name">PraveshPath</span>
            <p className="footer-tagline">Simplifying Haryana university admissions</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/profile">Find Programmes</Link>
              <Link to="/browse">Browse Universities</Link>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 PraveshPath. Built for students in Haryana.</p>
        </div>
      </footer>

      <style>{`
        .home { text-align: center; margin: -2rem -1.5rem 0; }

        .hero {
          position: relative;
          padding: 4.5rem 1.5rem 3.5rem;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #e0e7ff 70%, #f0f4ff 100%);
          z-index: 0;
        }
        .hero-bg::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-block;
          padding: 0.35rem 1rem;
          background: white;
          border: 1px solid var(--primary-100);
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 1.5rem;
          animation: fadeInUp 0.5s ease both;
        }
        .hero h1 {
          font-size: 3rem;
          font-weight: 800;
          color: var(--primary-dark);
          line-height: 1.15;
          margin-bottom: 1.25rem;
          letter-spacing: -0.02em;
          animation: fadeInUp 0.5s ease 0.1s both;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          max-width: 520px;
          margin: 0 auto 2rem;
          line-height: 1.65;
          animation: fadeInUp 0.5s ease 0.2s both;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 0.5s ease 0.3s both;
        }
        .hero-btn { min-width: 200px; }

        .stats-section {
          padding: 0 1.5rem;
          margin-top: -1.5rem;
          position: relative;
          z-index: 2;
        }
        .stats-inner {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          padding: 1.75rem 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
        }
        .stat-item { display: flex; flex-direction: column; align-items: center; }
        .stat-number { font-size: 2.2rem; font-weight: 800; color: var(--primary); line-height: 1; }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem; font-weight: 500; }
        .stat-divider { width: 1px; height: 40px; background: var(--border); }

        .section-header { margin-bottom: 2.5rem; }
        .section-header h2 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }
        .section-header p { color: var(--text-muted); font-size: 1.05rem; }

        .features-section {
          padding: 4.5rem 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          text-align: center;
          padding: 2rem 1.5rem;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          background: white;
          transition: all var(--transition-slow);
          animation: fadeInUp 0.5s ease both;
        }
        .feature-card:hover {
          border-color: var(--primary-light);
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }
        .feature-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-50);
          color: var(--primary);
          border-radius: var(--radius-lg);
        }
        .feature-card h3 { margin-bottom: 0.5rem; color: var(--text); font-size: 1.1rem; }
        .feature-card p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.55; }

        .steps-section {
          padding: 4rem 1.5rem 4.5rem;
          background: var(--primary-50);
          max-width: 100%;
        }
        .steps-grid {
          display: flex;
          justify-content: center;
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          flex-wrap: wrap;
        }
        .step-card {
          flex: 1;
          min-width: 200px;
          max-width: 260px;
          text-align: center;
          position: relative;
        }
        .step-num {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .step-card h3 { margin-bottom: 0.5rem; color: var(--text); font-size: 1.05rem; }
        .step-card p { color: var(--text-muted); font-size: 0.88rem; line-height: 1.5; }
        .step-arrow {
          position: absolute;
          top: 20px;
          right: -22px;
          color: var(--primary-light);
          opacity: 0.5;
        }

        .cta-section {
          padding: 3rem 1.5rem 4rem;
          max-width: 700px;
          margin: 0 auto;
        }
        .cta-card {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: var(--radius-xl);
          padding: 3rem 2rem;
          color: white;
        }
        .cta-card h2 { font-size: 1.6rem; font-weight: 700; margin-bottom: 0.75rem; }
        .cta-card p { opacity: 0.85; margin-bottom: 1.5rem; font-size: 1rem; }
        .cta-card .btn {
          background: white;
          color: var(--primary);
          font-weight: 700;
        }
        .cta-card .btn:hover {
          background: var(--primary-50);
          box-shadow: 0 4px 16px rgba(255,255,255,0.3);
        }

        .site-footer {
          background: var(--text);
          color: #cbd5e1;
          padding: 3rem 1.5rem 0;
        }
        .footer-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          padding-bottom: 2rem;
        }
        .footer-brand { display: flex; flex-direction: column; gap: 0.25rem; }
        .footer-logo { height: 32px; width: auto; filter: brightness(0) invert(1); opacity: 0.9; }
        .footer-name { font-size: 1.1rem; font-weight: 700; color: white; }
        .footer-tagline { font-size: 0.85rem; opacity: 0.6; }
        .footer-links { display: flex; gap: 3rem; }
        .footer-col { display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-col h4 { color: white; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .footer-col a { color: #94a3b8; font-size: 0.88rem; text-decoration: none; transition: color var(--transition); }
        .footer-col a:hover { color: white; text-decoration: none; }
        .footer-bottom {
          border-top: 1px solid #334155;
          max-width: 900px;
          margin: 0 auto;
          padding: 1.25rem 0;
          font-size: 0.8rem;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .hero h1 { font-size: 2rem; }
          .hero-subtitle { font-size: 1rem; }
          .stats-inner { flex-wrap: wrap; gap: 1.25rem; padding: 1.25rem; }
          .stat-divider { display: none; }
          .stat-number { font-size: 1.8rem; }
          .step-arrow { display: none; }
          .steps-grid { flex-direction: column; align-items: center; }
          .footer-inner { flex-direction: column; text-align: center; align-items: center; }
          .footer-links { gap: 2rem; }
        }
      `}</style>
    </div>
  )
}

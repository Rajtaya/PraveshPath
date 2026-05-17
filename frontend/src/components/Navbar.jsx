import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">&#x1F393;</span>
          <span>CED Platform</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/profile" className={isActive('/profile')}>Find Colleges</Link>
          <Link to="/browse" className={isActive('/browse')}>Browse</Link>
        </div>
      </div>
      <style>{`
        .navbar {
          background: white;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-dark);
          text-decoration: none;
        }
        .brand-icon { font-size: 1.5rem; }
        .nav-links { display: flex; gap: 0.25rem; }
        .nav-link {
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.2s;
        }
        .nav-link:hover { color: var(--text); background: var(--bg); }
        .nav-link.active { color: var(--primary); background: #eff6ff; }
      `}</style>
    </nav>
  )
}

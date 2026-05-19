import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={closeMobile}>
          <img src="/logo.png" alt="PraveshPath" className="brand-logo" />
          <span>PraveshPath</span>
        </Link>

        <button
          className={`nav-hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className={`nav-links ${mobileOpen ? 'nav-links--open' : ''}`}>
          <Link to="/" className={isActive('/')} onClick={closeMobile}>Home</Link>
          <Link to="/profile" className={isActive('/profile')} onClick={closeMobile}>Find Programmes</Link>
          <Link to="/browse" className={isActive('/browse')} onClick={closeMobile}>Browse</Link>
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.full_name}</span>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')} onClick={closeMobile}>Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm nav-signup" onClick={closeMobile}>Sign Up</Link>
            </>
          )}
        </div>

        {mobileOpen && <div className="nav-overlay" onClick={closeMobile} />}
      </div>
      <style>{`
        .navbar {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
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
          z-index: 110;
        }
        .brand-logo { height: 36px; width: auto; }
        .nav-links {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }
        .nav-link {
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all var(--transition);
        }
        .nav-link:hover { color: var(--text); background: var(--bg); text-decoration: none; }
        .nav-link.active { color: var(--primary); background: var(--primary-50); font-weight: 600; }
        .nav-user {
          padding: 0.5rem 0.75rem;
          font-size: 0.82rem;
          color: var(--primary);
          font-weight: 600;
        }
        .nav-logout {
          padding: 0.4rem 0.8rem;
          border: 1px solid var(--border);
          background: white;
          border-radius: var(--radius);
          font-size: 0.8rem;
          cursor: pointer;
          color: var(--text-muted);
          font-weight: 500;
          transition: all var(--transition);
        }
        .nav-logout:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .nav-signup {
          margin-left: 0.25rem;
          padding: 0.4rem 1rem !important;
          font-size: 0.82rem !important;
          text-decoration: none;
        }

        .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          z-index: 110;
        }
        .nav-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all var(--transition);
        }
        .nav-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .nav-hamburger.open span:nth-child(2) { opacity: 0; }
        .nav-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        .nav-overlay { display: none; }

        @media (max-width: 768px) {
          .nav-hamburger { display: flex; }
          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 280px;
            height: 100vh;
            background: white;
            flex-direction: column;
            align-items: stretch;
            padding: 5rem 1.5rem 2rem;
            gap: 0.25rem;
            box-shadow: var(--shadow-xl);
            transition: right var(--transition-slow);
            z-index: 105;
          }
          .nav-links--open { right: 0; }
          .nav-link {
            padding: 0.75rem 1rem;
            font-size: 1rem;
            border-radius: var(--radius);
          }
          .nav-signup {
            margin-left: 0 !important;
            margin-top: 0.5rem;
            text-align: center;
          }
          .nav-user { padding: 0.75rem 1rem; }
          .nav-logout { margin: 0.25rem 1rem; }
          .nav-overlay {
            display: block;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 101;
          }
        }
      `}</style>
    </nav>
  )
}

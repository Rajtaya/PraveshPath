import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <img src="/logo.png" alt="PraveshPath" className="brand-logo" />
          <span>PraveshPath</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/profile" className={isActive('/profile')}>Find Programmes</Link>
          <Link to="/browse" className={isActive('/browse')}>Browse</Link>
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.full_name}</span>
              <button className="nav-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm nav-signup">Sign Up</Link>
            </>
          )}
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
        .brand-logo { height: 36px; width: auto; }
        .nav-links { display: flex; gap: 0.25rem; align-items: center; }
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
        }
        .nav-logout:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .nav-signup {
          margin-left: 0.25rem;
          padding: 0.4rem 1rem !important;
          font-size: 0.82rem !important;
          text-decoration: none;
        }
      `}</style>
    </nav>
  )
}

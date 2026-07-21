import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useSelector(s => s.auth);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const isAdmin = user?.role === 'admin';

  const navLinks = isAdmin
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/complaints', label: 'Complaints' }, { to: '/admin/analytics', label: 'Analytics' }]
    : [{ to: '/dashboard', label: 'My Reports' }, { to: '/submit', label: 'Report Issue' }];

  return (
    <nav style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
        <span style={{ fontSize: '1.3rem' }}>🗑️</span>
        <span style={{ color: 'var(--accent)' }}>Smart</span>Sanitation
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} style={{ padding: '0.4rem 0.9rem', borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 500, color: pathname === l.to ? 'var(--accent)' : 'var(--muted)', background: pathname === l.to ? 'rgba(63,185,80,0.1)' : 'transparent', textDecoration: 'none', transition: 'all 0.15s' }}>
            {l.label}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          {user?.name} {isAdmin && <span className="badge badge-resolved" style={{ marginLeft: '0.3rem' }}>Admin</span>}
        </span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

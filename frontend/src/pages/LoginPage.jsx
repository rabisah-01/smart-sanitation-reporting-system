import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../features/auth/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(login(form));
  };

  const fillDemo = (email, password) => {
    dispatch(clearError());
    setForm({ email, password });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗑️</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Smart Sanitation</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Urban Cleanliness Reporting Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="yourname@citizen.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
          No account? <Link to="/register">Register here</Link>
        </p>

        {/* Demo accounts - clickable to auto-fill */}
        <div style={{ marginTop: '1.25rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ padding: '0.5rem 0.85rem', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Demo Accounts — click to fill
          </div>
          {[
            { label: '🔵 Admin',   email: 'admin@sanitation.gov.np', password: 'Admin@123', color: 'var(--accent2)' },
            { label: '🟢 Citizen', email: 'rabi@citizen.com',        password: 'Admin@123', color: 'var(--accent)'  },
          ].map(d => (
            <button key={d.email} type="button"
              onClick={() => fillDemo(d.email, d.password)}
              style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', padding: '0.6rem 0.85rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '0.82rem', color: d.color, fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{d.email}</span>
            </button>
          ))}
          <div style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
            Password for both: <code style={{ color: 'var(--text)' }}>Admin@123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

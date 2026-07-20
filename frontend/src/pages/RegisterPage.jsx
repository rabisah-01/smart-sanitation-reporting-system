import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../features/auth/authSlice';

const ADMIN_DOMAIN   = 'sanitation.gov.np';
const CITIZEN_DOMAIN = 'citizen.com';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');
  const [detectedRole, setDetectedRole] = useState(null);

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate]);

  // Detect role live as user types email
  const handleEmailChange = (val) => {
    setForm(f => ({ ...f, email: val }));
    setLocalError('');
    const domain = val.split('@')[1];
    if (!domain)                    setDetectedRole(null);
    else if (domain === ADMIN_DOMAIN)   setDetectedRole('admin');
    else if (domain === CITIZEN_DOMAIN) setDetectedRole('citizen');
    else                            setDetectedRole('invalid');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    const domain = form.email.split('@')[1];
    if (domain !== ADMIN_DOMAIN && domain !== CITIZEN_DOMAIN) {
      return setLocalError(
        `Invalid email domain. Use @${CITIZEN_DOMAIN} for citizens or @${ADMIN_DOMAIN} for admins.`
      );
    }
    if (form.password !== form.confirm) return setLocalError('Passwords do not match');
    if (form.password.length < 6) return setLocalError('Password must be at least 6 characters');

    dispatch(clearError());
    dispatch(register({ name: form.name, email: form.email, password: form.password }));
  };

  const roleBadgeStyle = {
    display: 'inline-block',
    padding: '0.2rem 0.65rem',
    borderRadius: 999,
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'Syne, sans-serif',
    marginLeft: '0.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏙️</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Smart Sanitation Reporting System</p>
        </div>

        {/* Domain rules info box */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem' }}>📧 Allowed email domains:</div>
          <div>🟢 Citizens &nbsp;→ <code style={{ color: 'var(--accent)' }}>yourname@citizen.com</code></div>
          <div style={{ marginTop: '0.2rem' }}>🔵 Admins &nbsp;&nbsp;&nbsp;→ <code style={{ color: 'var(--accent2)' }}>yourname@sanitation.gov.np</code></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Rabi Sah" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              Email
              {detectedRole === 'admin'   && <span style={{ ...roleBadgeStyle, background: 'rgba(88,166,255,0.15)', color: 'var(--accent2)' }}>Admin Account</span>}
              {detectedRole === 'citizen' && <span style={{ ...roleBadgeStyle, background: 'rgba(63,185,80,0.15)',  color: 'var(--accent)'  }}>Citizen Account</span>}
              {detectedRole === 'invalid' && <span style={{ ...roleBadgeStyle, background: 'rgba(248,81,73,0.15)',  color: 'var(--danger)'  }}>Invalid Domain</span>}
            </label>
            <input
              type="email"
              placeholder="yourname@citizen.com"
              value={form.email}
              onChange={e => handleEmailChange(e.target.value)}
              style={{ borderColor: detectedRole === 'invalid' ? 'var(--danger)' : detectedRole ? 'var(--accent)' : undefined }}
              required
            />
            {detectedRole === 'invalid' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
                Only @citizen.com or @sanitation.gov.np are allowed
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="••••••••" value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })} required />
          </div>

          {(localError || error) && <p className="error-msg">{localError || error}</p>}

          <button className="btn btn-primary" type="submit"
            disabled={loading || detectedRole === 'invalid' || detectedRole === null}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

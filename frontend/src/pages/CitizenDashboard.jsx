import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchComplaints, clearStatus } from '../features/complaints/complaintsSlice';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const fmt = (d) => new Date(d).toLocaleDateString('en-NP', { day: '2-digit', month: 'short', year: 'numeric' });

export default function CitizenDashboard() {
  const dispatch = useDispatch();
  const { list, total, loading, success } = useSelector(s => s.complaints);
  const { user } = useSelector(s => s.auth);
  const [filter, setFilter] = useState({ status: '', category: '' });

  useEffect(() => { dispatch(fetchComplaints(filter)); }, [dispatch, filter]);
  useEffect(() => { if (success) { setTimeout(() => dispatch(clearStatus()), 3000); } }, [success, dispatch]);

  const stats = [
    { label: 'Total Reported', value: total, color: 'var(--accent2)' },
    { label: 'Pending', value: list.filter(c => c.status === 'pending').length, color: 'var(--warn)' },
    { label: 'In Progress', value: list.filter(c => c.status === 'in_progress' || c.status === 'assigned').length, color: 'var(--accent2)' },
    { label: 'Resolved', value: list.filter(c => c.status === 'resolved').length, color: 'var(--accent)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {success && (
          <div style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: 'var(--accent)', fontSize: '0.88rem' }}>
            ✅ {success}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Welcome, {user?.name} 👋</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Track and manage your sanitation reports</p>
          </div>
          <Link to="/submit" className="btn btn-primary">+ Report New Issue</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem' }}>My Complaints</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} style={{ width: 'auto' }}>
                <option value="">All Status</option>
                {['pending','assigned','in_progress','resolved','rejected'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} style={{ width: 'auto' }}>
                <option value="">All Categories</option>
                {['garbage','drainage','public_space','water','other'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {loading ? <Loader /> : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
              <p>No complaints yet. <Link to="/submit">Report your first issue</Link></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {list.map(c => (
                <Link key={c.complaint_id} to={'/complaint/' + c.complaint_id}
                  style={{ display: 'block', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', textDecoration: 'none', color: 'var(--text)', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>#{c.complaint_id}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>· {c.category.replace('_', ' ')}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>📍 {c.location}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                      <StatusBadge status={c.status} />
                      <StatusBadge priority={c.priority} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fmt(c.date)}</span>
                    </div>
                  </div>
                  {c.assigned_to && (
                    <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--accent2)' }}>
                      👷 Assigned to: {c.assigned_to}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

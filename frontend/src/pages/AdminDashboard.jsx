import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAnalytics } from '../features/admin/adminSlice';
import { fetchComplaints } from '../features/complaints/complaintsSlice';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const fmt = (d) => new Date(d).toLocaleDateString('en-NP', { day: '2-digit', month: 'short' });

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector(s => s.admin);
  const { list } = useSelector(s => s.complaints);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchComplaints({ limit: 8 }));
  }, [dispatch]);

  if (loading && !analytics) return <><Navbar /><Loader text="Loading dashboard…" /></>;

  const stats = analytics ? [
    { label: 'Total Complaints', value: analytics.total, icon: '📋', color: 'var(--accent2)' },
    { label: 'Pending', value: analytics.pending, icon: '⏳', color: 'var(--warn)' },
    { label: 'In Progress', value: analytics.in_progress, icon: '🔧', color: 'var(--accent2)' },
    { label: 'Resolved', value: analytics.resolved, icon: '✅', color: 'var(--accent)' },
    { label: 'Resolution Rate', value: analytics.resolutionRate + '%', icon: '📈', color: 'var(--accent)' },
    { label: 'Avg. Resolution', value: analytics.avgResolutionHours + 'h', icon: '⏱️', color: 'var(--muted)' },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Kathmandu Metropolitan City — Sanitation Management</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Recent Complaints */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem' }}>Recent Complaints</h2>
              <Link to="/admin/complaints" className="btn btn-secondary btn-sm">View All →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {list.slice(0, 8).map(c => (
                <Link key={c.complaint_id} to={'/complaint/' + c.complaint_id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', gap: '0.75rem', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>📍 {c.location} · {c.citizen_name}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
                    <StatusBadge status={c.status} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{fmt(c.date)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>By Category</h2>
            {analytics?.categoryBreakdown?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {analytics.categoryBreakdown.map(({ category, count }) => {
                  const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                  const icons = { garbage: '🗑️', drainage: '🌊', public_space: '🌳', water: '💧', other: '📌' };
                  return (
                    <div key={category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                        <span>{icons[category] || '📌'} {category.replace('_', ' ')}</span>
                        <span style={{ color: 'var(--muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', background: 'var(--accent2)', borderRadius: 999, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No data yet</p>}

            {/* Monthly trend */}
            {analytics?.monthlyTrend?.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Trend</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: 60 }}>
                  {analytics.monthlyTrend.map(({ month, count }) => {
                    const max = Math.max(...analytics.monthlyTrend.map(m => m.count));
                    const h = max > 0 ? Math.round((count / max) * 100) : 0;
                    return (
                      <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{count}</span>
                        <div style={{ width: '100%', height: h + '%', minHeight: 4, background: 'var(--accent)', borderRadius: '3px 3px 0 0', transition: 'height 0.4s ease' }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{month.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../features/admin/adminSlice';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#f85149','#3fb950','#58a6ff','#d29922','#bc8cff'];

const Card = ({ title, children }) => (
  <div className="card">
    <h2 style={{ fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>{title}</h2>
    {children}
  </div>
);

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
    <div style={{ fontSize: '2rem', fontWeight: 800, color, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{sub}</div>}
  </div>
);

const tooltipStyle = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem' };

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector(s => s.admin);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  if (loading && !analytics) return <><Navbar /><Loader text="Loading analytics…" /></>;
  if (!analytics) return <><Navbar /><div style={{ padding: '2rem', color: 'var(--muted)' }}>No data available yet.</div></>;

  const a = analytics;

  const statusData = [
    { name: 'Pending',     value: a.pending,     fill: '#d29922' },
    { name: 'Assigned',    value: a.assigned,    fill: '#58a6ff' },
    { name: 'In Progress', value: a.in_progress, fill: '#bc8cff' },
    { name: 'Resolved',    value: a.resolved,    fill: '#3fb950' },
    { name: 'Rejected',    value: a.rejected,    fill: '#f85149' },
  ].filter(d => d.value > 0);

  const categoryData = a.categoryBreakdown.map(({ category, count }) => ({
    name: category.replace('_', ' '),
    count,
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Analytics & Reports</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Insights into sanitation complaint trends and resolution performance</p>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="📋" label="Total Complaints"    value={a.total}                    color="var(--text)" />
          <StatCard icon="⏳" label="Pending"             value={a.pending}                  color="var(--warn)" />
          <StatCard icon="🔧" label="In Progress"         value={a.in_progress + a.assigned} color="var(--accent2)" />
          <StatCard icon="✅" label="Resolved"            value={a.resolved}                 color="var(--accent)" sub={`${a.resolutionRate}% resolution rate`} />
          <StatCard icon="❌" label="Rejected"            value={a.rejected}                 color="var(--danger)" />
          <StatCard icon="⏱️" label="Avg Resolution"      value={a.avgResolutionHours + 'h'} color="var(--muted)" sub="For resolved complaints" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Monthly Trend */}
          <Card title="Monthly Complaint Trend">
            {a.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={a.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4 }} name="Complaints" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>Not enough data yet</p>}
          </Card>

          {/* Status Pie */}
          <Card title="Status Breakdown">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>No data yet</p>}
          </Card>
        </div>

        {/* Category Bar Chart */}
        <Card title="Complaints by Category">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11, textTransform: 'capitalize' }} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Complaints" radius={[4,4,0,0]}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No data yet</p>}
        </Card>

        {/* Recent Complaints Table */}
        {a.recentComplaints?.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <Card title="Recent Complaints">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['#', 'Description', 'Citizen', 'Status', 'Priority', 'Date'].map(h => (
                        <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {a.recentComplaints.map(c => (
                      <tr key={c.complaint_id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)' }}>#{c.complaint_id}</td>
                        <td style={{ padding: '0.6rem 0.75rem', maxWidth: 260 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.description}</span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>{c.citizen_name}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><span className={`badge badge-${c.status}`}>{c.status.replace('_',' ')}</span></td>
                        <td style={{ padding: '0.6rem 0.75rem' }}><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                        <td style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{new Date(c.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

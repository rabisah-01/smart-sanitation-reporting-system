import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchComplaints, updateComplaintStatus } from '../features/complaints/complaintsSlice';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const fmt = (d) => new Date(d).toLocaleDateString('en-NP', { day: '2-digit', month: 'short', year: 'numeric' });
const STATUSES = ['', 'pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
const CATEGORIES = ['', 'garbage', 'drainage', 'public_space', 'water', 'other'];
const PRIORITIES = ['', 'low', 'medium', 'high'];

export default function AdminComplaintsPage() {
  const dispatch = useDispatch();
  const { list, total, totalPages, page, loading } = useSelector(s => s.complaints);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', page: 1, limit: 15 });

  useEffect(() => { dispatch(fetchComplaints(filters)); }, [dispatch, filters]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>All Complaints</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{total} total reports</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Status',   key: 'status',   opts: STATUSES },
            { label: 'Category', key: 'category', opts: CATEGORIES },
            { label: 'Priority', key: 'priority', opts: PRIORITIES },
          ].map(f => (
            <select key={f.key} value={filters[f.key]} onChange={e => setFilter(f.key, e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
              {f.opts.map(o => <option key={o} value={o}>{o ? o.replace('_', ' ') : 'All ' + f.label}</option>)}
            </select>
          ))}
          {(filters.status || filters.category || filters.priority) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: '', category: '', priority: '', page: 1, limit: 15 })}>
              Clear Filters
            </button>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? <Loader /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                    {['ID', 'Description', 'Location', 'Citizen', 'Category', 'Priority', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted)' }}>No complaints found</td></tr>
                  ) : list.map((c, i) => (
                    <tr key={c.complaint_id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    >
                      <td style={{ padding: '0.7rem 1rem', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>#{c.complaint_id}</td>
                      <td style={{ padding: '0.7rem 1rem', maxWidth: '220px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.description}</span>
                      </td>
                      <td style={{ padding: '0.7rem 1rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>📍 {c.location}</td>
                      <td style={{ padding: '0.7rem 1rem', whiteSpace: 'nowrap' }}>{c.citizen_name}</td>
                      <td style={{ padding: '0.7rem 1rem', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{c.category?.replace('_', ' ')}</td>
                      <td style={{ padding: '0.7rem 1rem' }}><StatusBadge priority={c.priority} /></td>
                      <td style={{ padding: '0.7rem 1rem' }}>
                        <select value={c.status}
                          onChange={e => dispatch(updateComplaintStatus({ id: c.complaint_id, status: e.target.value }))}
                          style={{ width: 'auto', fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}>
                          {['pending','assigned','in_progress','resolved','rejected'].map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '0.7rem 1rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmt(c.date)}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>
                        <Link to={'/complaint/' + c.complaint_id} className="btn btn-secondary btn-sm">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
            <span style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem', color: 'var(--muted)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

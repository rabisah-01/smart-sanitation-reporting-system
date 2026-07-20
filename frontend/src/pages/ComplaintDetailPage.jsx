import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaintById, updateComplaintStatus, assignComplaint, clearStatus } from '../features/complaints/complaintsSlice';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const fmt = (d) => new Date(d).toLocaleString('en-NP', { dateStyle: 'medium', timeStyle: 'short' });
const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected: c, loading, error, success } = useSelector(s => s.complaints);
  const { user } = useSelector(s => s.auth);
  const isAdmin = user?.role === 'admin';

  const [assignForm, setAssignForm] = useState({ assigned_to: '', notes: '' });
  const [showAssign, setShowAssign] = useState(false);

  useEffect(() => { dispatch(fetchComplaintById(id)); }, [dispatch, id]);
  useEffect(() => { if (success) { dispatch(fetchComplaintById(id)); dispatch(clearStatus()); } }, [success, dispatch, id]);

  if (loading && !c) return <><Navbar /><Loader /></>;
  if (error) return <><Navbar /><div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div></>;
  if (!c) return null;

  const handleStatusChange = (status) => dispatch(updateComplaintStatus({ id, status }));
  const handleAssign = (e) => {
    e.preventDefault();
    dispatch(assignComplaint({ id, ...assignForm }));
    setShowAssign(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>← Back</button>

        {success && (
          <div style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: 'var(--accent)', fontSize: '0.88rem' }}>
            ✅ {success}
          </div>
        )}

        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>COMPLAINT #{c.complaint_id}</span>
              <h1 style={{ fontSize: '1.3rem', marginTop: '0.3rem', textTransform: 'capitalize' }}>{c.category?.replace('_', ' ')} Issue</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <StatusBadge priority={c.priority} />
              <StatusBadge status={c.status} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Reported By', value: c.citizen_name },
              { label: 'Location', value: `📍 ${c.location}` },
              { label: 'Date Submitted', value: fmt(c.date) },
              { label: 'Last Updated', value: fmt(c.updated_at) },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{f.label}</div>
                <div style={{ fontSize: '0.88rem' }}>{f.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Description</div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, background: 'var(--bg3)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>{c.description}</p>
          </div>

          {c.image_url && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Photo Evidence</div>
              <img src={'http://localhost:5000' + c.image_url} alt="complaint" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
            </div>
          )}

          {c.assigned_to && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(88,166,255,0.08)', borderRadius: 'var(--radius)', border: '1px solid rgba(88,166,255,0.2)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent2)', fontWeight: 600, marginBottom: '0.3rem' }}>👷 ASSIGNMENT</div>
              <div style={{ fontSize: '0.88rem' }}>Assigned to: <strong>{c.assigned_to}</strong> by {c.admin_name}</div>
              {c.assignment_notes && <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{c.assignment_notes}</div>}
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Assigned on {fmt(c.assigned_at)}</div>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="card">
            <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>🛠️ Admin Actions</h2>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Update Status</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className={`btn btn-sm ${c.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    disabled={c.status === s} style={{ textTransform: 'capitalize' }}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Assign to Worker / Team</div>
              {!showAssign ? (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(true)}>
                  {c.assigned_to ? '✏️ Re-assign' : '+ Assign'}
                </button>
              ) : (
                <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input placeholder="Worker / Team name (e.g. Ward 10 Sanitation Team)" value={assignForm.assigned_to}
                    onChange={e => setAssignForm({ ...assignForm, assigned_to: e.target.value })} required />
                  <textarea placeholder="Notes for the worker (optional)" value={assignForm.notes}
                    onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })} style={{ minHeight: '70px' }} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">Assign</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAssign(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

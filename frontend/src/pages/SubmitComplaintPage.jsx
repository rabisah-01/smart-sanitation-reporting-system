import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createComplaint, clearStatus } from '../features/complaints/complaintsSlice';
import Navbar from '../components/Navbar';

export default function SubmitComplaintPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector(s => s.complaints);
  const [form, setForm] = useState({ description: '', location: '', category: 'garbage', priority: 'medium' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (success) {
      setTimeout(() => { dispatch(clearStatus()); navigate('/dashboard'); }, 1500);
    }
  }, [success, dispatch, navigate]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearStatus());
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    dispatch(createComplaint(fd));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Report a Sanitation Issue</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Help keep your city clean. Your report will be reviewed by municipal authorities.</p>
        </div>

        {success && (
          <div style={{ background: 'rgba(63,185,80,0.12)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: 'var(--accent)', fontSize: '0.88rem' }}>
            ✅ Complaint submitted! Redirecting…
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Description *</label>
              <textarea placeholder="Describe the sanitation issue in detail…" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} required style={{ minHeight: '110px' }} />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input type="text" placeholder="e.g. New Road, Kathmandu Ward 21" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="garbage">🗑️ Garbage / Waste</option>
                  <option value="drainage">🌊 Drainage / Flooding</option>
                  <option value="public_space">🌳 Public Space</option>
                  <option value="water">💧 Water Supply</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Photo Evidence (optional)</label>
              <input type="file" accept="image/*" onChange={handleImage}
                style={{ padding: '0.5rem', cursor: 'pointer' }} />
              {preview && (
                <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                  <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
                  <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, fontSize: '0.75rem', cursor: 'pointer' }}>✕</button>
                </div>
              )}
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Submitting…</> : '📤 Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

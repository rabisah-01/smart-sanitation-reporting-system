export default function Loader({ text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{text}</span>
    </div>
  );
}

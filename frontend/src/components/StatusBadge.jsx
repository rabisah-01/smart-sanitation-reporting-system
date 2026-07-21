export default function StatusBadge({ status, priority }) {
  if (priority) return <span className={`badge badge-${priority}`}>{priority}</span>;
  const label = status === 'in_progress' ? 'In Progress' : status?.charAt(0).toUpperCase() + status?.slice(1);
  return <span className={`badge badge-${status}`}>{label}</span>;
}

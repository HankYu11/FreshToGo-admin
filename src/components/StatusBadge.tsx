import styles from './StatusBadge.module.css';

const defaultColors: Record<string, string> = {
  PENDING: '#d97706',
  CONFIRMED: '#2563eb',
  PICKED_UP: '#16a34a',
  CANCELLED: '#6b7280',
  EXPIRED: '#6b7280',
  AVAILABLE: '#2563eb',
  RESERVED: '#d97706',
  SOLD: '#16a34a',
  NO_SHOW: '#dc2626',
};

function hexToRgba(hex: string, alpha: number): string {
  const match = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return hex;
  const [, r, g, b] = match.map((x, i) => (i > 0 ? parseInt(x, 16) : x));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

export default function StatusBadge({ status, colorMap }: StatusBadgeProps) {
  const colors = colorMap ?? defaultColors;
  const color = colors[status] ?? '#6b7280';
  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: hexToRgba(color, 0.08), color, borderColor: hexToRgba(color, 0.19) }}
    >
      {label}
    </span>
  );
}

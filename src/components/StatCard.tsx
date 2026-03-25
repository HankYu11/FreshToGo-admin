import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
}

export default function StatCard({ title, value, loading }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.title}>{title}</span>
      {loading ? (
        <div className={`skeleton ${styles.skeleton}`} />
      ) : (
        <span className={styles.value}>{value}</span>
      )}
    </div>
  );
}

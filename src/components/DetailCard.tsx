import type { CSSProperties, ReactNode } from 'react';
import styles from './DetailCard.module.css';

interface DetailCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function DetailCard({ children, className, style }: DetailCardProps) {
  return (
    <div className={`${styles.card}${className ? ` ${className}` : ''}`} style={style}>
      <dl className={styles.grid}>{children}</dl>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className={styles.label}>{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

DetailCard.Field = Field;

import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <h1>{title}</h1>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}

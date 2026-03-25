import type { ReactNode } from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  loading,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }, (_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key}>
                        <div className={`skeleton ${styles.skeletonCell}`} />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((row) => (
                  <tr
                    key={keyExtractor(row)}
                    className={onRowClick ? styles.clickableRow : undefined}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className="btn-secondary"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

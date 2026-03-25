import { useRef, useEffect } from 'react';
import styles from './Filters.module.css';

export interface FilterDropdown {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
}

interface FiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterDropdown[];
  onFilterChange?: (key: string, value: string) => void;
  showDateRange?: boolean;
  dateFrom?: string;
  dateTo?: string;
  onDateRangeChange?: (from: string, to: string) => void;
}

export default function Filters({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters,
  onFilterChange,
  showDateRange,
  dateFrom = '',
  dateTo = '',
  onDateRangeChange,
}: FiltersProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== searchValue) {
      inputRef.current.value = searchValue;
    }
  }, [searchValue]);

  const handleSearch = (value: string) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearchChange?.(value), 300);
  };

  return (
    <div className={styles.bar}>
      {onSearchChange && (
        <input
          ref={inputRef}
          type="search"
          placeholder={searchPlaceholder}
          defaultValue={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.search}
        />
      )}
      {filters?.map((f) => (
        <select
          key={f.key}
          value={f.value}
          onChange={(e) => onFilterChange?.(f.key, e.target.value)}
          className={styles.select}
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
      {showDateRange && (
        <div className={styles.dateRange}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateRangeChange?.(e.target.value, dateTo)}
          />
          <span>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateRangeChange?.(dateFrom, e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

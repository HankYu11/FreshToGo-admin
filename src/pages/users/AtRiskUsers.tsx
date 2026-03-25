import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { User, PaginatedResponse } from '../../types/api';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';

const columns: Column<User>[] = [
  { key: 'name', header: 'Display Name' },
  { key: 'email', header: 'Email' },
  { key: 'noShowCount', header: 'No-Show Count' },
  {
    key: 'createdAt',
    header: 'Created',
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

interface FetchState {
  data: User[];
  totalPages: number;
  key: string;
}

export default function AtRiskUsers() {
  const navigate = useNavigate();
  const [fetchState, setFetchState] = useState<FetchState | null>(null);
  const [page, setPage] = useState(0);

  const fetchKey = `${page}`;

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<PaginatedResponse<User>>('/api/admin/users/at-risk', {
        params: { page, size: 20 },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setFetchState({ data: res.content, totalPages: res.totalPages, key: fetchKey });
      })
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load at-risk users');
        throw err;
      });
    return () => controller.abort();
  }, [page, fetchKey]);

  const loading = fetchState === null || fetchState.key !== fetchKey;

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>At-Risk Users</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Users with high no-show counts who may need attention.
      </p>
      <DataTable
        columns={columns}
        data={fetchState?.data ?? []}
        loading={loading}
        page={page}
        totalPages={fetchState?.totalPages ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

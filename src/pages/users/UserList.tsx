import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { User, PaginatedResponse } from '../../types/api';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';

const columns: Column<User>[] = [
  { key: 'name', header: 'Display Name' },
  { key: 'email', header: 'Email' },
  { key: 'noShowCount', header: 'No-Shows' },
  {
    key: 'blocked',
    header: 'Blocked',
    render: (row) => (
      <StatusBadge
        status={row.blocked ? 'Blocked' : 'Active'}
        colorMap={{ Blocked: '#dc2626', Active: '#16a34a' }}
      />
    ),
  },
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

export default function UserList() {
  const navigate = useNavigate();
  const [fetchState, setFetchState] = useState<FetchState | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [blocked, setBlocked] = useState('');

  const fetchKey = `${page}:${search}:${blocked}`;

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<PaginatedResponse<User>>('/api/admin/users', {
        params: { page, size: 20, search: search || undefined, blocked: blocked || undefined },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setFetchState({ data: res.content, totalPages: res.totalPages, key: fetchKey });
      })
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load users');
        throw err;
      });
    return () => controller.abort();
  }, [page, search, blocked, fetchKey]);

  const loading = fetchState === null || fetchState.key !== fetchKey;

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Users</h1>
      <Filters
        searchPlaceholder="Search users..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        filters={[
          {
            key: 'blocked',
            label: 'All Status',
            options: [
              { value: 'true', label: 'Blocked' },
              { value: 'false', label: 'Active' },
            ],
            value: blocked,
          },
        ]}
        onFilterChange={(_key, value) => { setBlocked(value); setPage(0); }}
      />
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

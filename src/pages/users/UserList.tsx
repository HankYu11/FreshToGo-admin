import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/api';
import { usePaginatedList } from '../../lib/usePaginatedList';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { USER_STATUS_COLORS } from '../../constants/statusColors';

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
        colorMap={USER_STATUS_COLORS}
      />
    ),
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export default function UserList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [blocked, setBlocked] = useState('');

  const { data, loading, page, totalPages, setPage } = usePaginatedList<User>(
    '/api/admin/users',
    { search: search || undefined, blocked: blocked || undefined },
    { errorMessage: 'Failed to load users' },
  );

  return (
    <div>
      <PageHeader title="Users" />
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
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

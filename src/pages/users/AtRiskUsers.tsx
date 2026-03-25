import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/api';
import { usePaginatedList } from '../../lib/usePaginatedList';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';

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

export default function AtRiskUsers() {
  const navigate = useNavigate();

  const { data, loading, page, totalPages, setPage } = usePaginatedList<User>(
    '/api/admin/users/at-risk',
    {},
    { errorMessage: 'Failed to load at-risk users' },
  );

  return (
    <div>
      <PageHeader title="At-Risk Users" />
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Users with high no-show counts who may need attention.
      </p>
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

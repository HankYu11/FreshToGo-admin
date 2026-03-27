import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { User } from '../../types/api';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';

const columns: Column<User>[] = [
  { key: 'displayName', header: 'Display Name' },
  { key: 'noShowCount', header: 'No-Show Count' },
  {
    key: 'createdAt',
    header: 'Created',
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export default function AtRiskUsers() {
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<User[]>('/api/admin/users/at-risk', { signal: controller.signal })
      .then(({ data: users }) => {
        setData(users);
        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error('Failed to load at-risk users');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

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
        page={0}
        totalPages={1}
        onPageChange={() => {}}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

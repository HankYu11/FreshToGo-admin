import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Merchant, PaginatedResponse } from '../../types/api';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';

const columns: Column<Merchant>[] = [
  { key: 'name', header: 'Store Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'verified',
    header: 'Verified',
    render: (row) => (
      <StatusBadge
        status={row.verified ? 'Yes' : 'No'}
        colorMap={{ Yes: '#16a34a', No: '#d97706' }}
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
  data: Merchant[];
  totalPages: number;
  key: string;
}

export default function MerchantList() {
  const navigate = useNavigate();
  const [fetchState, setFetchState] = useState<FetchState | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [verified, setVerified] = useState('');

  const fetchKey = `${page}:${search}:${verified}`;

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<PaginatedResponse<Merchant>>('/api/admin/merchants', {
        params: { page, size: 20, search: search || undefined, verified: verified || undefined },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setFetchState({ data: res.content, totalPages: res.totalPages, key: fetchKey });
      })
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load merchants');
        throw err;
      });
    return () => controller.abort();
  }, [page, search, verified, fetchKey]);

  const loading = fetchState === null || fetchState.key !== fetchKey;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Merchants</h1>
        <button className="btn-primary" onClick={() => navigate('/merchants/new')}>
          Create Merchant
        </button>
      </div>
      <Filters
        searchPlaceholder="Search merchants..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        filters={[
          {
            key: 'verified',
            label: 'All Verified',
            options: [
              { value: 'true', label: 'Verified' },
              { value: 'false', label: 'Unverified' },
            ],
            value: verified,
          },
        ]}
        onFilterChange={(_key, value) => { setVerified(value); setPage(0); }}
      />
      <DataTable
        columns={columns}
        data={fetchState?.data ?? []}
        loading={loading}
        page={page}
        totalPages={fetchState?.totalPages ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/merchants/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

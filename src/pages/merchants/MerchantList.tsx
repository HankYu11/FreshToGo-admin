import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Merchant } from '../../types/api';
import { usePaginatedList } from '../../lib/usePaginatedList';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { VERIFIED_COLORS } from '../../constants/statusColors';

const columns: Column<Merchant>[] = [
  { key: 'storeName', header: 'Store Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'isVerified',
    header: 'Verified',
    render: (row) => (
      <StatusBadge
        status={row.isVerified ? 'Yes' : 'No'}
        colorMap={VERIFIED_COLORS}
      />
    ),
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

export default function MerchantList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [verified, setVerified] = useState('');

  const { data, loading, page, totalPages, setPage } = usePaginatedList<Merchant>(
    '/api/admin/merchants',
    { search: search || undefined, isVerified: verified || undefined },
    { errorMessage: 'Failed to load merchants' },
  );

  return (
    <div>
      <PageHeader title="Merchants">
        <button className="btn-primary" onClick={() => navigate('/merchants/new')}>
          Create Merchant
        </button>
      </PageHeader>
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
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/merchants/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

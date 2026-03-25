import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import type { Box, PaginatedResponse, Merchant } from '../../types/api';
import { usePaginatedList } from '../../lib/usePaginatedList';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import type { FilterDropdown } from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';

const columns: Column<Box>[] = [
  { key: 'name', header: 'Name' },
  { key: 'merchantName', header: 'Merchant' },
  {
    key: 'price',
    header: 'Price',
    render: (row) => (
      <span>
        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)' }}>
          ${row.originalPrice.toFixed(2)}
        </span>
        {' → '}
        <strong>${row.discountedPrice.toFixed(2)}</strong>
      </span>
    ),
  },
  {
    key: 'quantity',
    header: 'Qty / Remaining',
    render: (row) => `${row.remaining} / ${row.quantity}`,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'saleDate',
    header: 'Sale Date',
    render: (row) => new Date(row.saleDate).toLocaleDateString(),
  },
];

export default function BoxList() {
  const navigate = useNavigate();
  const [merchantId, setMerchantId] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [merchantOptions, setMerchantOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<PaginatedResponse<Merchant>>('/api/admin/merchants', {
        params: { size: 1000 },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setMerchantOptions(res.content.map((m) => ({ value: m.id, label: m.name })));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const { data, loading, page, totalPages, setPage } = usePaginatedList<Box>(
    '/api/admin/boxes',
    {
      merchantId: merchantId || undefined,
      status: status || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    },
    { errorMessage: 'Failed to load boxes' },
  );

  const filters: FilterDropdown[] = [
    {
      key: 'merchantId',
      label: 'All Merchants',
      options: merchantOptions,
      value: merchantId,
    },
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'AVAILABLE', label: 'Available' },
        { value: 'RESERVED', label: 'Reserved' },
        { value: 'SOLD', label: 'Sold' },
        { value: 'EXPIRED', label: 'Expired' },
      ],
      value: status,
    },
  ];

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'merchantId') setMerchantId(value);
    if (key === 'status') setStatus(value);
    setPage(0);
  };

  return (
    <div>
      <PageHeader title="Boxes" />
      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        showDateRange
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateRangeChange={(from, to) => { setDateFrom(from); setDateTo(to); setPage(0); }}
      />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/boxes/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

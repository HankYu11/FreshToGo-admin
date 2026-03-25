import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Box, PaginatedResponse, Merchant } from '../../types/api';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import type { FilterDropdown } from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';

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

interface FetchState {
  data: Box[];
  totalPages: number;
  key: string;
}

export default function BoxList() {
  const navigate = useNavigate();
  const [fetchState, setFetchState] = useState<FetchState | null>(null);
  const [page, setPage] = useState(0);
  const [merchantId, setMerchantId] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [merchantOptions, setMerchantOptions] = useState<Array<{ value: string; label: string }>>([]);

  const fetchKey = `${page}:${merchantId}:${status}:${dateFrom}:${dateTo}`;

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

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<PaginatedResponse<Box>>('/api/admin/boxes', {
        params: {
          page,
          size: 20,
          merchantId: merchantId || undefined,
          status: status || undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
        },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setFetchState({ data: res.content, totalPages: res.totalPages, key: fetchKey });
      })
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load boxes');
        throw err;
      });
    return () => controller.abort();
  }, [page, merchantId, status, dateFrom, dateTo, fetchKey]);

  const loading = fetchState === null || fetchState.key !== fetchKey;

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
      <h1 style={{ marginBottom: '1rem' }}>Boxes</h1>
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
        data={fetchState?.data ?? []}
        loading={loading}
        page={page}
        totalPages={fetchState?.totalPages ?? 0}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/boxes/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

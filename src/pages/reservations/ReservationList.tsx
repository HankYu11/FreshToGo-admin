import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Reservation, PaginatedResponse, Merchant } from '../../types/api';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import type { FilterDropdown } from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';

const statusColors: Record<string, string> = {
  PENDING: '#d97706',
  CONFIRMED: '#2563eb',
  PICKED_UP: '#16a34a',
  CANCELLED: '#6b7280',
  EXPIRED: '#6b7280',
  NO_SHOW: '#dc2626',
};

const columns: Column<Reservation>[] = [
  {
    key: 'id',
    header: 'Order ID',
    render: (row) => row.id.slice(0, 8),
  },
  { key: 'userName', header: 'User' },
  { key: 'boxName', header: 'Box' },
  { key: 'merchantName', header: 'Merchant' },
  {
    key: 'price',
    header: 'Price',
    render: (row) => `$${row.price.toFixed(2)}`,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} colorMap={statusColors} />,
  },
  {
    key: 'pickupTime',
    header: 'Pickup',
    render: (row) => new Date(row.pickupTime).toLocaleString(),
  },
];

interface FetchState {
  data: Reservation[];
  totalPages: number;
  key: string;
}

export default function ReservationList() {
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
      .get<PaginatedResponse<Reservation>>('/api/admin/reservations', {
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
        if (!controller.signal.aborted) toast.error('Failed to load reservations');
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
        { value: 'PENDING', label: 'Pending' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'PICKED_UP', label: 'Picked Up' },
        { value: 'CANCELLED', label: 'Cancelled' },
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
      <h1 style={{ marginBottom: '1rem' }}>Reservations</h1>
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
        onRowClick={(row) => navigate(`/reservations/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

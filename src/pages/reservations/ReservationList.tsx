import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import type { Reservation, PaginatedResponse, Merchant } from '../../types/api';
import { usePaginatedList } from '../../lib/usePaginatedList';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import Filters from '../../components/Filters';
import type { FilterDropdown } from '../../components/Filters';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { RESERVATION_STATUS_COLORS } from '../../constants/statusColors';

const columns: Column<Reservation>[] = [
  {
    key: 'orderId',
    header: 'Order ID',
    render: (row) => row.orderId,
  },
  { key: 'userDisplayName', header: 'User' },
  { key: 'boxName', header: 'Box' },
  { key: 'merchantStoreName', header: 'Merchant' },
  {
    key: 'price',
    header: 'Price',
    render: (row) => `$${row.price.toFixed(2)}`,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} colorMap={RESERVATION_STATUS_COLORS} />,
  },
  {
    key: 'pickupDate',
    header: 'Pickup',
    render: (row) => new Date(row.pickupDate).toLocaleDateString(),
  },
];

export default function ReservationList() {
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
        setMerchantOptions(res.items.map((m) => ({ value: m.id, label: m.storeName })));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const { data, loading, page, totalPages, setPage } = usePaginatedList<Reservation>(
    '/api/admin/reservations',
    {
      merchantId: merchantId || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { errorMessage: 'Failed to load reservations' },
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
        { value: 'ACTIVE', label: 'Active' },
        { value: 'PICKED_UP', label: 'Picked Up' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'EXPIRED', label: 'Expired' },
        { value: 'NO_SHOW', label: 'No Show' },
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
      <PageHeader title="Reservations" />
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
        onRowClick={(row) => navigate(`/reservations/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

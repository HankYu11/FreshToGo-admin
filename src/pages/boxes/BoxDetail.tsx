import { useNavigate } from 'react-router-dom';
import type { Box, Reservation } from '../../types/api';
import { useDetail } from '../../lib/useDetail';
import { usePaginatedList } from '../../lib/usePaginatedList';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import DetailCard from '../../components/DetailCard';
import { RESERVATION_STATUS_COLORS } from '../../constants/statusColors';

const reservationColumns: Column<Reservation>[] = [
  {
    key: 'id',
    header: 'Order ID',
    render: (row) => row.id.slice(0, 8),
  },
  { key: 'userName', header: 'User' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} colorMap={RESERVATION_STATUS_COLORS} />,
  },
  {
    key: 'pickupTime',
    header: 'Pickup',
    render: (row) => new Date(row.pickupTime).toLocaleString(),
  },
];

export default function BoxDetail() {
  const navigate = useNavigate();
  const { data: box, loading: boxLoading, id } = useDetail<Box>(
    '/api/admin/boxes',
    { errorMessage: 'Failed to load box' },
  );

  const { data: reservations, loading: resLoading, page: resPage, totalPages: resTotalPages, setPage: setResPage } =
    usePaginatedList<Reservation>(
      `/api/admin/boxes/${id}/reservations`,
      {},
      { errorMessage: 'Failed to load reservations' },
    );

  if (boxLoading || !box) {
    return (
      <div>
        <h1>Box Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={box.name} />

      <DetailCard style={{ marginBottom: '2rem' }}>
        <DetailCard.Field label="Merchant">{box.merchantName}</DetailCard.Field>
        <DetailCard.Field label="Description">{box.description || '—'}</DetailCard.Field>
        <DetailCard.Field label="Price">
          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)' }}>
            ${box.originalPrice.toFixed(2)}
          </span>
          {' → '}
          <strong>${box.discountedPrice.toFixed(2)}</strong>
        </DetailCard.Field>
        <DetailCard.Field label="Quantity">{box.remaining} remaining of {box.quantity}</DetailCard.Field>
        <DetailCard.Field label="Status"><StatusBadge status={box.status} /></DetailCard.Field>
        <DetailCard.Field label="Sale Date">{new Date(box.saleDate).toLocaleDateString()}</DetailCard.Field>
        <DetailCard.Field label="Pickup Window">
          {new Date(box.pickupStart).toLocaleString()} — {new Date(box.pickupEnd).toLocaleString()}
        </DetailCard.Field>
      </DetailCard>

      <h2 style={{ marginBottom: '1rem' }}>Reservations</h2>
      <DataTable
        columns={reservationColumns}
        data={reservations}
        loading={resLoading}
        page={resPage}
        totalPages={resTotalPages}
        onPageChange={setResPage}
        onRowClick={(row) => navigate(`/reservations/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import type { BoxDetail as BoxDetailType, Reservation } from '../../types/api';
import { useDetail } from '../../lib/useDetail';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import DetailCard from '../../components/DetailCard';
import { RESERVATION_STATUS_COLORS } from '../../constants/statusColors';

const reservationColumns: Column<Reservation>[] = [
  {
    key: 'orderId',
    header: 'Order ID',
    render: (row) => row.orderId,
  },
  { key: 'userDisplayName', header: 'User' },
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

export default function BoxDetail() {
  const navigate = useNavigate();
  const { data: box, loading: boxLoading } = useDetail<BoxDetailType>(
    '/api/admin/boxes',
    { errorMessage: 'Failed to load box' },
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
        <DetailCard.Field label="Merchant">{box.merchantStoreName}</DetailCard.Field>
        <DetailCard.Field label="Merchant Address">{box.merchantStoreAddress || '—'}</DetailCard.Field>
        <DetailCard.Field label="Description">{box.description || '—'}</DetailCard.Field>
        <DetailCard.Field label="Price">
          <span style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)' }}>
            ${box.originalPrice.toFixed(2)}
          </span>
          {' → '}
          <strong>${box.discountedPrice.toFixed(2)}</strong>
        </DetailCard.Field>
        <DetailCard.Field label="Quantity">{box.remainingCount} remaining of {box.quantity}</DetailCard.Field>
        <DetailCard.Field label="Status"><StatusBadge status={box.status} /></DetailCard.Field>
        <DetailCard.Field label="Sale Date">{new Date(box.saleDate).toLocaleDateString()}</DetailCard.Field>
        <DetailCard.Field label="Sale Window">{box.saleTimeStart} — {box.saleTimeEnd}</DetailCard.Field>
        <DetailCard.Field label="Pickup Window">{box.pickupTimeStart} — {box.pickupTimeEnd}</DetailCard.Field>
        {box.imageUrl && (
          <DetailCard.Field label="Image">
            <img src={box.imageUrl} alt={box.name} style={{ maxWidth: 200, borderRadius: 8 }} />
          </DetailCard.Field>
        )}
      </DetailCard>

      <h2 style={{ marginBottom: '1rem' }}>Reservations</h2>
      <DataTable
        columns={reservationColumns}
        data={box.reservations}
        loading={false}
        page={0}
        totalPages={1}
        onPageChange={() => {}}
        onRowClick={(row) => navigate(`/reservations/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}

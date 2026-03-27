import { toast } from 'sonner';
import api from '../../lib/api';
import type { ReservationDetail as ReservationDetailType } from '../../types/api';
import { useDetail } from '../../lib/useDetail';
import { useConfirmAction } from '../../lib/useConfirmAction';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import DetailCard from '../../components/DetailCard';
import { RESERVATION_STATUS_COLORS } from '../../constants/statusColors';

export default function ReservationDetail() {
  const { data: reservation, setData: setReservation, loading, id } = useDetail<ReservationDetailType>(
    '/api/admin/reservations',
    { errorMessage: 'Failed to load reservation' },
  );

  const refetch = async () => {
    const { data } = await api.get<ReservationDetailType>(`/api/admin/reservations/${id}`);
    setReservation(data);
  };

  const cancelAction = useConfirmAction(async () => {
    await api.patch(`/api/admin/reservations/${id}/cancel`);
    await refetch();
    toast.success('Reservation cancelled');
  }, { errorMessage: 'Failed to cancel reservation' });

  const pickupAction = useConfirmAction(async () => {
    await api.patch(`/api/admin/reservations/${id}/pickup`);
    await refetch();
    toast.success('Marked as picked up');
  }, { errorMessage: 'Failed to mark as picked up' });

  if (loading || !reservation) {
    return (
      <div>
        <h1>Reservation Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  const canAct = !reservation.isCancelled && !reservation.isPickedUp && reservation.status !== 'EXPIRED';

  return (
    <div>
      <PageHeader title={`Reservation ${reservation.orderId}`}>
        {canAct && (
          <button className="btn-primary" onClick={pickupAction.requestConfirm}>
            Mark Picked Up
          </button>
        )}
        {canAct && (
          <button className="btn-danger" onClick={cancelAction.requestConfirm}>
            Cancel
          </button>
        )}
      </PageHeader>

      <DetailCard>
        <DetailCard.Field label="Order ID">{reservation.orderId}</DetailCard.Field>
        <DetailCard.Field label="User">{reservation.userDisplayName}</DetailCard.Field>
        <DetailCard.Field label="Merchant">{reservation.merchantStoreName}</DetailCard.Field>
        <DetailCard.Field label="Box">{reservation.boxName}</DetailCard.Field>
        <DetailCard.Field label="Price">${reservation.price.toFixed(2)}</DetailCard.Field>
        <DetailCard.Field label="Status">
          <StatusBadge status={reservation.status} colorMap={RESERVATION_STATUS_COLORS} />
        </DetailCard.Field>
        <DetailCard.Field label="Pickup Date">{new Date(reservation.pickupDate).toLocaleDateString()}</DetailCard.Field>
        <DetailCard.Field label="Redemption Code">{reservation.redemptionCode}</DetailCard.Field>
        <DetailCard.Field label="Created">{new Date(reservation.createdAt).toLocaleString()}</DetailCard.Field>
      </DetailCard>

      <ConfirmDialog
        open={cancelAction.open}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation?"
        confirmLabel="Cancel Reservation"
        variant="danger"
        loading={cancelAction.loading}
        onConfirm={cancelAction.confirm}
        onCancel={cancelAction.cancel}
      />

      <ConfirmDialog
        open={pickupAction.open}
        title="Mark as Picked Up"
        message="Are you sure you want to mark this reservation as picked up?"
        confirmLabel="Confirm Pickup"
        loading={pickupAction.loading}
        onConfirm={pickupAction.confirm}
        onCancel={pickupAction.cancel}
      />
    </div>
  );
}

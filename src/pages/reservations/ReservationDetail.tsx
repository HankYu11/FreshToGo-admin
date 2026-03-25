import { useState } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Reservation } from '../../types/api';
import { useDetail } from '../../lib/useDetail';
import { useConfirmAction } from '../../lib/useConfirmAction';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import DetailCard from '../../components/DetailCard';
import { RESERVATION_STATUS_COLORS } from '../../constants/statusColors';

export default function ReservationDetail() {
  const { data: reservation, setData: setReservation, loading, id } = useDetail<Reservation>(
    '/api/admin/reservations',
    { errorMessage: 'Failed to load reservation' },
  );
  const [cancelReason, setCancelReason] = useState('');

  const cancelAction = useConfirmAction(async () => {
    const { data } = await api.patch<Reservation>(`/api/admin/reservations/${id}/cancel`, {
      reason: cancelReason,
    });
    setReservation(data);
    toast.success('Reservation cancelled');
    setCancelReason('');
  }, { errorMessage: 'Failed to cancel reservation' });

  const pickupAction = useConfirmAction(async () => {
    const { data } = await api.patch<Reservation>(`/api/admin/reservations/${id}/pickup`);
    setReservation(data);
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

  const canAct = !['CANCELLED', 'PICKED_UP', 'EXPIRED'].includes(reservation.status);

  return (
    <div>
      <PageHeader title={`Reservation ${reservation.id.slice(0, 8)}`}>
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
        <DetailCard.Field label="Order ID">{reservation.id}</DetailCard.Field>
        <DetailCard.Field label="User">{reservation.userName}</DetailCard.Field>
        <DetailCard.Field label="Merchant">{reservation.merchantName}</DetailCard.Field>
        <DetailCard.Field label="Box">{reservation.boxName}</DetailCard.Field>
        <DetailCard.Field label="Price">${reservation.price.toFixed(2)}</DetailCard.Field>
        <DetailCard.Field label="Status">
          <StatusBadge status={reservation.status} colorMap={RESERVATION_STATUS_COLORS} />
        </DetailCard.Field>
        <DetailCard.Field label="Pickup Time">{new Date(reservation.pickupTime).toLocaleString()}</DetailCard.Field>
        {reservation.cancelReason && (
          <DetailCard.Field label="Cancel Reason">{reservation.cancelReason}</DetailCard.Field>
        )}
        <DetailCard.Field label="Created">{new Date(reservation.createdAt).toLocaleString()}</DetailCard.Field>
      </DetailCard>

      <ConfirmDialog
        open={cancelAction.open}
        title="Cancel Reservation"
        message="Please provide a reason for cancellation."
        confirmLabel="Cancel Reservation"
        variant="danger"
        loading={cancelAction.loading}
        onConfirm={cancelAction.confirm}
        onCancel={() => { cancelAction.cancel(); setCancelReason(''); }}
      >
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Cancellation reason..."
          rows={3}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
      </ConfirmDialog>

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

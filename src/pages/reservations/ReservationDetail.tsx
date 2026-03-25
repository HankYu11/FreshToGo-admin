import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Reservation } from '../../types/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';

const statusColors: Record<string, string> = {
  PENDING: '#d97706',
  CONFIRMED: '#2563eb',
  PICKED_UP: '#16a34a',
  CANCELLED: '#6b7280',
  EXPIRED: '#6b7280',
  NO_SHOW: '#dc2626',
};

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [pickingUp, setPickingUp] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<Reservation>(`/api/admin/reservations/${id}`, { signal: controller.signal })
      .then(({ data }) => setReservation(data))
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load reservation');
        throw err;
      });
    return () => controller.abort();
  }, [id]);

  const canCancel = reservation && !['CANCELLED', 'PICKED_UP', 'EXPIRED'].includes(reservation.status);
  const canPickup = reservation && !['CANCELLED', 'PICKED_UP', 'EXPIRED'].includes(reservation.status);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.patch<Reservation>(`/api/admin/reservations/${id}/cancel`, {
        reason: cancelReason,
      });
      setReservation(data);
      toast.success('Reservation cancelled');
    } catch {
      toast.error('Failed to cancel reservation');
    } finally {
      setCancelling(false);
      setCancelOpen(false);
      setCancelReason('');
    }
  };

  const handlePickup = async () => {
    setPickingUp(true);
    try {
      const { data } = await api.patch<Reservation>(`/api/admin/reservations/${id}/pickup`);
      setReservation(data);
      toast.success('Marked as picked up');
    } catch {
      toast.error('Failed to mark as picked up');
    } finally {
      setPickingUp(false);
      setPickupOpen(false);
    }
  };

  if (!reservation) {
    return (
      <div>
        <h1>Reservation Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Reservation {reservation.id.slice(0, 8)}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canPickup && (
            <button className="btn-primary" onClick={() => setPickupOpen(true)}>
              Mark Picked Up
            </button>
          )}
          {canCancel && (
            <button className="btn-danger" onClick={() => setCancelOpen(true)}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          maxWidth: 600,
        }}
      >
        <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem 1rem' }}>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Order ID</dt>
          <dd>{reservation.id}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>User</dt>
          <dd>{reservation.userName}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Merchant</dt>
          <dd>{reservation.merchantName}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Box</dt>
          <dd>{reservation.boxName}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Price</dt>
          <dd>${reservation.price.toFixed(2)}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</dt>
          <dd><StatusBadge status={reservation.status} colorMap={statusColors} /></dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Pickup Time</dt>
          <dd>{new Date(reservation.pickupTime).toLocaleString()}</dd>
          {reservation.cancelReason && (
            <>
              <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Cancel Reason</dt>
              <dd>{reservation.cancelReason}</dd>
            </>
          )}
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Created</dt>
          <dd>{new Date(reservation.createdAt).toLocaleString()}</dd>
        </dl>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Reservation"
        message="Please provide a reason for cancellation."
        confirmLabel="Cancel Reservation"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => { setCancelOpen(false); setCancelReason(''); }}
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
        open={pickupOpen}
        title="Mark as Picked Up"
        message="Are you sure you want to mark this reservation as picked up?"
        confirmLabel="Confirm Pickup"
        loading={pickingUp}
        onConfirm={handlePickup}
        onCancel={() => setPickupOpen(false)}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Box, Reservation, PaginatedResponse } from '../../types/api';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const statusColors: Record<string, string> = {
  PENDING: '#d97706',
  CONFIRMED: '#2563eb',
  PICKED_UP: '#16a34a',
  CANCELLED: '#6b7280',
  EXPIRED: '#6b7280',
  NO_SHOW: '#dc2626',
};

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
    render: (row) => <StatusBadge status={row.status} colorMap={statusColors} />,
  },
  {
    key: 'pickupTime',
    header: 'Pickup',
    render: (row) => new Date(row.pickupTime).toLocaleString(),
  },
];

interface ReservationFetchState {
  data: Reservation[];
  totalPages: number;
  key: string;
}

export default function BoxDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [box, setBox] = useState<Box | null>(null);
  const [resFetch, setResFetch] = useState<ReservationFetchState | null>(null);
  const [resPage, setResPage] = useState(0);

  const resFetchKey = `${resPage}`;

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<Box>(`/api/admin/boxes/${id}`, { signal: controller.signal })
      .then(({ data }) => setBox(data))
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load box');
        throw err;
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<PaginatedResponse<Reservation>>(`/api/admin/boxes/${id}/reservations`, {
        params: { page: resPage, size: 20 },
        signal: controller.signal,
      })
      .then(({ data: res }) => {
        setResFetch({ data: res.content, totalPages: res.totalPages, key: resFetchKey });
      })
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load reservations');
        throw err;
      });
    return () => controller.abort();
  }, [id, resPage, resFetchKey]);

  if (!box) {
    return (
      <div>
        <h1>Box Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  const resLoading = resFetch === null || resFetch.key !== resFetchKey;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>{box.name}</h1>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          maxWidth: 600,
          marginBottom: '2rem',
        }}
      >
        <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem 1rem' }}>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Merchant</dt>
          <dd>{box.merchantName}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Description</dt>
          <dd>{box.description || '—'}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Price</dt>
          <dd>
            <span style={{ textDecoration: 'line-through', color: 'var(--color-text-secondary)' }}>
              ${box.originalPrice.toFixed(2)}
            </span>
            {' → '}
            <strong>${box.discountedPrice.toFixed(2)}</strong>
          </dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Quantity</dt>
          <dd>{box.remaining} remaining of {box.quantity}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</dt>
          <dd><StatusBadge status={box.status} /></dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Sale Date</dt>
          <dd>{new Date(box.saleDate).toLocaleDateString()}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Pickup Window</dt>
          <dd>{new Date(box.pickupStart).toLocaleString()} — {new Date(box.pickupEnd).toLocaleString()}</dd>
        </dl>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Reservations</h2>
      <DataTable
        columns={reservationColumns}
        data={resFetch?.data ?? []}
        loading={resLoading}
        page={resPage}
        totalPages={resFetch?.totalPages ?? 0}
        onPageChange={setResPage}
        onRowClick={(row) => navigate(`/reservations/${row.id}`)}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
}
